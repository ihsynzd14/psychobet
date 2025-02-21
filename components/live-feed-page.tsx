'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Activity, Clock, LucideAlignHorizontalJustifyStart, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatTime } from './live-feed/utils';
import { EventView } from './live-feed/event-view';
import { processMatchActions } from './live-feed/event-processor';
import { LiveFeedPageProps, TeamLineup } from './live-feed/types';
import { MatchEvent } from './live-feed/types';
import { MatchStats } from './live-feed/match-stats';
import { MatchHeader } from './live-feed/match-header';
import { MatchLineups } from './live-feed/match-lineups';

interface TeamInfo {
  sourceId: string;
  sourceName: string;
  strip: {
    color1: {
      r: number;
      g: number;
      b: number;
    };
    color2: {
      r: number;
      g: number;
      b: number;
    };
  };
}

export function LiveFeedPage({ fixtureId }: LiveFeedPageProps) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(formatTime(new Date()));
  const [homeTeam, setHomeTeam] = useState<TeamInfo | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamInfo | null>(null);
  const [homeTeamLineup, setHomeTeamLineup] = useState<TeamLineup | null>(null);
  const [awayTeamLineup, setAwayTeamLineup] = useState<TeamLineup | null>(null);
  const [isLineupsLoading, setIsLineupsLoading] = useState<boolean>(true);
  const [possession, setPossession] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const parentRef = useRef<HTMLDivElement>(null);

  // Optimize event update function
  const updateEvents = useCallback((newEvents: MatchEvent[]) => {
    setEvents(prev => {
      const eventMap = new Map(prev.map(e => [e.id, e]));
      newEvents.forEach(e => eventMap.set(e.id, e));
      return Array.from(eventMap.values())
        .sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          
          // Eğer timestamp'ler aynıysa, özel sıralama mantığı uygula
          if (timeA === timeB) {
            // Foul ve DangerState olayları için özel sıralama
            if (a.type === 'foul' && b.type === 'dangerState' && b.details.dangerState?.includes('FreeKick')) {
              return 1; // Foul'u üste koy
            }
            if (b.type === 'foul' && a.type === 'dangerState' && a.details.dangerState?.includes('FreeKick')) {
              return -1; // Foul'u üste koy
            }
          }
          
          // Normal timestamp sıralaması
          return timeB - timeA;
        });
    });
  }, []);

  // Optimize team updates
  const updateTeams = useCallback((data: any) => {
    if (data.raw.homeTeam) {
      setHomeTeam(data.raw.homeTeam);
    }
    if (data.raw.awayTeam) {
      setAwayTeam(data.raw.awayTeam);
    }
  }, []);

  // Optimize lineup updates with memoization
  const updateLineups = useCallback((data: any) => {
    const updates = data.raw?.matchActions?.lineupUpdates?.updates;
    if (!updates?.length) return;

    setHomeTeamLineup(prev => {
      const latestHomeUpdate = updates
        .filter((u: any) => u.team === 'Home')
        .sort((a: any, b: any) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())[0];
      
      const newLineup = latestHomeUpdate?.newLineup || prev;
      if (newLineup) setIsLineupsLoading(false);
      return newLineup;
    });

    setAwayTeamLineup(prev => {
      const latestAwayUpdate = updates
        .filter((u: any) => u.team === 'Away')
        .sort((a: any, b: any) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())[0];
      
      const newLineup = latestAwayUpdate?.newLineup || prev;
      if (newLineup) setIsLineupsLoading(false);
      return newLineup;
    });
  }, []);

  // Optimize possession updates with memoization and deep comparison
  const updatePossession = useCallback((data: any) => {
    if (data.raw?.statistics?.possession) {
      setPossession(prev => {
        const newPossession = {
          home: data.raw.statistics.possession.home,
          away: data.raw.statistics.possession.away
        };
        
        // Sadece değerler değiştiyse güncelle
        if (prev.home !== newPossession.home || prev.away !== newPossession.away) {
          return newPossession;
        }
        return prev;
      });
    }
  }, []);

  // Memoize possession data for MatchStats
  const memoizedPossession = useMemo(() => possession, [possession.home, possession.away]);

  // Son event'in timeElapsed'ını al
  const lastTimeElapsed = useMemo(() => {
    if (events.length === 0) return '00:00';
    return events[0].timeElapsed; // Events zaten timestamp'e göre sıralı olduğu için ilk event en son event
  }, [events]);

  // Gol sayılarını hesapla
  const { homeGoals, awayGoals } = useMemo(() => {
    const goals = events.filter(e => e.type === 'dangerState' && e.details.dangerState === 'Goal');
    return {
      homeGoals: goals.filter(e => e.team === 'Home').length,
      awayGoals: goals.filter(e => e.team === 'Away').length
    };
  }, [events]);

  useEffect(() => {
    const unsubscribe = api.subscribeToFixture(fixtureId, (data) => {
      const newEvents = processMatchActions(data);
      updateEvents(newEvents);
      updateTeams(data);
      updateLineups(data);
      updatePossession(data);
    });

    // 10 saniye sonra hala data gelmemişse loading'i kaldır
    const timer = setTimeout(() => {
      setIsLineupsLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [fixtureId, updateEvents, updateTeams, updateLineups, updatePossession]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Optimize virtualizer with memoized key getter
  const getItemKey = useCallback((index: number) => events[index].id, [events]);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
    getItemKey
  });

  // Memoize sorted events
  const sortedEvents = useMemo(() => events, [events]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex">
        <div className="flex-1">
          {homeTeam && awayTeam && (
            <MatchHeader 
              homeTeam={homeTeam} 
              awayTeam={awayTeam} 
              currentTime={currentTime}
              matchPeriod="1st Half"
              homeRedCards={events.filter(e => e.type === 'redCard' && e.team === 'Home').length}
              awayRedCards={events.filter(e => e.type === 'redCard' && e.team === 'Away').length}
              matchTimeElapsed={lastTimeElapsed}
              homeScore={homeGoals}
              awayScore={awayGoals}
            />
          )}

          <div className="h-[calc(100vh-100px)]">
            <div className="bg-white dark:bg-gray-800 h-full flex flex-col">              
              <div 
                ref={parentRef} 
                className="flex-1 overflow-auto"
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const event = sortedEvents[virtualRow.index];
                    return (
                      <div
                        key={event.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="absolute top-0 left-0 w-full p-2 border-t border-b border-gray-100 dark:border-gray-800"
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="relative">
                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-gray-300 dark:bg-gray-600" />
                          <EventView event={event} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {events.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                  No events yet...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-[300px] border-l border-gray-100 dark:border-gray-700">
          <div className="border-b border-gray-100 dark:border-gray-700 p-2">
            <h2 className="text-sm font-normal flex items-center gap-2">
              <LucideAlignHorizontalJustifyStart className="w-4 h-4 text-blue-500" />
              Match Stats
            </h2>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700">
            <MatchStats 
              events={events} 
              possession={memoizedPossession} 
            />
          </div>
          <div className="border-b border-gray-100 dark:border-gray-700 p-2">
            <h2 className="text-sm font-normal flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Lineups
            </h2>
          </div>
          <div className="flex-1 overflow-auto">
            {isLineupsLoading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                Loading lineups...
              </div>
            ) : homeTeamLineup && awayTeamLineup ? (
              <MatchLineups
                homeTeamLineup={homeTeamLineup}
                awayTeamLineup={awayTeamLineup}
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                No lineups available for this match
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 