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
import { MatchInfo } from './live-feed/match-info';

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

export function LiveFeedPage({ fixtureId, competitionName, matchName, startDateUtc }: LiveFeedPageProps) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(formatTime(new Date()));
  const [homeTeam, setHomeTeam] = useState<TeamInfo | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamInfo | null>(null);
  const [homeTeamLineup, setHomeTeamLineup] = useState<TeamLineup | null>(null);
  const [awayTeamLineup, setAwayTeamLineup] = useState<TeamLineup | null>(null);
  const [isLineupsLoading, setIsLineupsLoading] = useState<boolean>(true);
  const [possession, setPossession] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const [matchPeriod, setMatchPeriod] = useState<string>('First Half');
  const [stoppageTime, setStoppageTime] = useState<number | null>(null);
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

  // Son event'in timeElapsed'ını al ve matchPeriod'u güncelle
  const { lastTimeElapsed, currentPhase, displayPhase } = useMemo(() => {
    if (events.length === 0) return { lastTimeElapsed: '00:00', currentPhase: 'FirstHalf', displayPhase: 'First Half' };
    
    // First check for phase change events to get the most accurate current phase
    const phaseChangeEvents = events.filter(event => event.type === 'phaseChange');
    
    // If we have phase change events, use the most recent one to determine the current phase
    if (phaseChangeEvents.length > 0) {
      const latestPhaseChange = phaseChangeEvents[0]; // Events are already sorted by timestamp
      
      // Handle transition to PostMatch (match completely finished)
      if (latestPhaseChange.phase === 'PostMatch') {
        // Find the last regular event before the phase change to get the last elapsed time
        const regularEvents = events.filter(event => 
          event.team !== 'System' && 
          event.type !== 'bookingState' && 
          event.type !== 'phaseChange' && 
          event.type !== 'stoppageTime' &&
          new Date(event.timestamp) <= new Date(latestPhaseChange.timestamp)
        );
        
        const lastTimeFromEvents = regularEvents.length > 0 ? regularEvents[0].timeElapsed : latestPhaseChange.timeElapsed;
        
        return { 
          lastTimeElapsed: lastTimeFromEvents, 
          currentPhase: 'PostMatch', 
          displayPhase: 'Match Complete' 
        };
      }
      
      // Handle transition to HalfTime (first half finished)
      if (latestPhaseChange.phase === 'HalfTime' && latestPhaseChange.details.previousPhase === 'FirstHalf') {
        // Find the last regular event before the phase change to get the last elapsed time
        const regularEvents = events.filter(event => 
          event.team !== 'System' && 
          event.type !== 'bookingState' && 
          event.type !== 'phaseChange' && 
          event.type !== 'stoppageTime' &&
          new Date(event.timestamp) <= new Date(latestPhaseChange.timestamp)
        );
        
        const lastTimeFromEvents = regularEvents.length > 0 ? regularEvents[0].timeElapsed : latestPhaseChange.timeElapsed;
        
        return { 
          lastTimeElapsed: lastTimeFromEvents, 
          currentPhase: 'HalfTime', 
          displayPhase: '1st Half Complete' 
        };
      }
      
      // Handle transition to FullTimeNormalTime (second half finished, going to extra time)
      if (latestPhaseChange.phase === 'FullTimeNormalTime' && latestPhaseChange.details.previousPhase === 'SecondHalf') {
        const regularEvents = events.filter(event => 
          event.team !== 'System' && 
          event.type !== 'bookingState' && 
          event.type !== 'phaseChange' && 
          event.type !== 'stoppageTime' &&
          new Date(event.timestamp) <= new Date(latestPhaseChange.timestamp)
        );
        
        const lastTimeFromEvents = regularEvents.length > 0 ? regularEvents[0].timeElapsed : latestPhaseChange.timeElapsed;
        
        return { 
          lastTimeElapsed: lastTimeFromEvents, 
          currentPhase: 'FullTimeNormalTime', 
          displayPhase: 'Full Time Normal Time' 
        };
      }
      
      // Handle transition to ExtraTimeHalfTime (extra time first half finished)
      if (latestPhaseChange.phase === 'ExtraTimeHalfTime' && latestPhaseChange.details.previousPhase === 'FullTimeExtraTime') {
        const regularEvents = events.filter(event => 
          event.team !== 'System' && 
          event.type !== 'bookingState' && 
          event.type !== 'phaseChange' && 
          event.type !== 'stoppageTime' &&
          new Date(event.timestamp) <= new Date(latestPhaseChange.timestamp)
        );
        
        const lastTimeFromEvents = regularEvents.length > 0 ? regularEvents[0].timeElapsed : latestPhaseChange.timeElapsed;
        
        return { 
          lastTimeElapsed: lastTimeFromEvents, 
          currentPhase: 'ExtraTimeHalfTime', 
          displayPhase: 'Extra Time Half Time' 
        };
      }
      
      // Handle transition to Penalties (extra time second half finished)
      if (latestPhaseChange.phase === 'Penalties' && latestPhaseChange.details.previousPhase === 'ExtraTimeSecondHalf') {
        const regularEvents = events.filter(event => 
          event.team !== 'System' && 
          event.type !== 'bookingState' && 
          event.type !== 'phaseChange' && 
          event.type !== 'stoppageTime' &&
          new Date(event.timestamp) <= new Date(latestPhaseChange.timestamp)
        );
        
        const lastTimeFromEvents = regularEvents.length > 0 ? regularEvents[0].timeElapsed : latestPhaseChange.timeElapsed;
        
        return { 
          lastTimeElapsed: lastTimeFromEvents, 
          currentPhase: 'Penalties', 
          displayPhase: 'Penalties' 
        };
      }
    }
    
    // Filter out system messages, booking states, phase changes, and stoppage time events
    const filteredEvents = events.filter(event => 
      event.team !== 'System' && 
      event.type !== 'bookingState' && 
      event.type !== 'phaseChange' && 
      event.type !== 'stoppageTime'
    );

    // If no valid events found after filtering, return default values
    if (filteredEvents.length === 0) return { lastTimeElapsed: '00:00', currentPhase: 'FirstHalf', displayPhase: 'First Half' };

    // Get the last valid event
    const lastEvent = filteredEvents[0]; // Events are already sorted by timestamp
    
    // Phase'e göre periyot metnini belirle
    let displayPhase = 'First Half';
    switch (lastEvent.phase) {
      case 'SecondHalf':
        displayPhase = 'Second Half';
        break;
      case 'HalfTime':
        displayPhase = 'Half Time';
        return { lastTimeElapsed: lastEvent.timeElapsed, currentPhase: lastEvent.phase, displayPhase };
      case 'FullTime':
        displayPhase = '2nd Half Complete';
        return { lastTimeElapsed: lastEvent.timeElapsed, currentPhase: lastEvent.phase, displayPhase };
      case 'FullTimeNormalTime':
        displayPhase = 'Full Time Normal Time';
        break;
      case 'FullTimeExtraTime':
        displayPhase = 'Extra Time First Half';
        break;
      case 'ExtraTimeHalfTime':
        displayPhase = 'Extra Time Half Time';
        break;
      case 'ExtraTimeSecondHalf':
        displayPhase = 'Extra Time Second Half';
        break;
      case 'Penalties':
        displayPhase = 'Penalties';
        break;
      case 'PostMatch':
        displayPhase = 'Match Complete';
        break;
      default:
        displayPhase = 'First Half';
    }
    
    return {
      lastTimeElapsed: lastEvent.timeElapsed,
      currentPhase: lastEvent.phase,
      displayPhase
    };
  }, [events]);

  useEffect(() => {
    setMatchPeriod(displayPhase);
  }, [displayPhase]);

  // Uzatma süresini takip et
  useEffect(() => {
    // Uzatma süresi olaylarını bul
    const stoppageTimeEvents = events.filter(e => e.type === 'stoppageTime');
    
    if (stoppageTimeEvents.length > 0) {
      // En son uzatma süresi olayını al
      const latestStoppageTimeEvent = stoppageTimeEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      // Eğer olay mevcut fazla ilgiliyse, uzatma süresini ayarla
      if (latestStoppageTimeEvent.phase === currentPhase) {
        const minutes = latestStoppageTimeEvent.details.addedMinutes;
        setStoppageTime(typeof minutes === 'number' ? minutes : null);
      } else {
        // Eğer olay mevcut fazla ilgili değilse, uzatma süresini sıfırla
        setStoppageTime(null);
      }
    } else {
      // Uzatma süresi olayı yoksa, uzatma süresini sıfırla
      setStoppageTime(null);
    }
  }, [events, currentPhase]);

  // Gol sayılarını hesapla
  const { homeGoals, awayGoals } = useMemo(() => {
    // Tüm gol olaylarını bul (dangerState tipindeki Goal olayları)
    const dangerStateGoals = events.filter(e => e.type === 'dangerState' && e.details.dangerState === 'Goal');
    
    // VAR kararlarını bul - sadece gol ile ilgili ve "No Goal" kararı verilmiş olanlar
    const cancelledGoals = events.filter(e => 
      e.type === 'var' && 
      e.details.reason?.includes('Goal') && 
      e.details.outcome?.includes('No Goal') &&
      e.details.state === 'Safe' // Sadece tamamlanmış VAR kararlarını dikkate al
    );
    
    // Ev sahibi ve deplasman takımlarının gol sayılarını hesapla
    const homeTeamGoals = dangerStateGoals.filter(e => e.team === 'Home').length;
    const awayTeamGoals = dangerStateGoals.filter(e => e.team === 'Away').length;
    
    // İptal edilen golleri takımlara göre say
    const cancelledHomeGoals = cancelledGoals.filter(e => e.team === 'Home').length;
    const cancelledAwayGoals = cancelledGoals.filter(e => e.team === 'Away').length;
    
    // Net gol sayısını hesapla
    // Tehlike durumu olaylarından gelen goller - VAR ile iptal edilen goller
    return {
      homeGoals: Math.max(0, homeTeamGoals - cancelledHomeGoals),
      awayGoals: Math.max(0, awayTeamGoals - cancelledAwayGoals)
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

    // Sayfa yenilendiğinde feed'in aktif olduğundan emin ol
    const ensureFeedIsActive = async () => {
      try {
        // Feed'in aktif olup olmadığını kontrol et
        await api.getLastAction(fixtureId);
      } catch (error: any) {
        // Eğer feed aktif değilse, yeniden başlat
        if (error.message?.includes('Feed not found')) {
          try {
            await api.startFeed(fixtureId);
            console.log('Feed restarted after page refresh');
          } catch (startError) {
            console.error('Error restarting feed:', startError);
          }
        }
      }
    };

    // Konsola yazdırarak değerleri kontrol et
    console.log('LiveFeedPage received props:', {
      fixtureId,
      competitionName,
      matchName,
      startDateUtc
    });

    ensureFeedIsActive();

    // 10 saniye sonra hala data gelmemişse loading'i kaldır
    const timer = setTimeout(() => {
      setIsLineupsLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [fixtureId, updateEvents, updateTeams, updateLineups, updatePossession, competitionName, matchName, startDateUtc]);

  // Add a new effect to handle substitution events
  useEffect(() => {
    // Check for substitution events that have been updated with player data
    const substitutionEvents = events.filter(e => 
      e.type === 'substitution' && 
      (e.details.playerOn !== null || e.details.playerOff !== null)
    );
    
    if (substitutionEvents.length > 0) {
      // Force a re-render of the lineup component by creating a shallow copy
      if (homeTeamLineup) {
        setHomeTeamLineup({...homeTeamLineup});
      }
      if (awayTeamLineup) {
        setAwayTeamLineup({...awayTeamLineup});
      }
    }
  }, [events, homeTeamLineup, awayTeamLineup]);

  // Add a new effect to handle yellow card player updates
  useEffect(() => {
    // Get all yellow card events
    const yellowCardEvents = events.filter(e => 
      (e.type === 'yellowCard' || e.type === 'secondYellow' || e.type === 'redCard')
    );

    // Check if any have updated player data
    const hasPlayerUpdates = yellowCardEvents.some(e => e.details.player?.sourceName);

    if (hasPlayerUpdates && (homeTeamLineup || awayTeamLineup)) {
      // Force an update to the events list by creating a new array with the same items
      // This causes the EventView components to re-render with the updated player names
      setEvents(prevEvents => [...prevEvents]);
    }
  }, [events, homeTeamLineup, awayTeamLineup]);

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
            <>
              <MatchInfo 
                competitionName={competitionName}
                matchName={matchName}
                startDateUtc={startDateUtc}
                events={events}
              />
              <MatchHeader 
                homeTeam={homeTeam} 
                awayTeam={awayTeam} 
                currentTime={currentTime}
                matchPeriod={matchPeriod}
                homeRedCards={events.filter(e => (e.type === 'redCard' || e.type === 'secondYellow') && e.team === 'Home').length}
                awayRedCards={events.filter(e => (e.type === 'redCard' || e.type === 'secondYellow') && e.team === 'Away').length}
                matchTimeElapsed={lastTimeElapsed}
                homeScore={homeGoals}
                awayScore={awayGoals}
                stoppageTime={stoppageTime}
                currentPhase={currentPhase}
              />
            </>
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
          <div className="border-b border-gray-100 dark:border-gray-700 p-2 py-[21.6px]">
            <h2 className="text-sm font-normal flex items-center gap-2">
              <LucideAlignHorizontalJustifyStart className="w-4 h-4 text-blue-500" />
              Match Details
            </h2>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700">
            <MatchStats 
              events={events} 
              possession={memoizedPossession}
              homeTeamLineup={homeTeamLineup}
              awayTeamLineup={awayTeamLineup}
              isLineupsLoading={isLineupsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 