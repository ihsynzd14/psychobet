'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Activity, Clock, LucideAlignHorizontalJustifyStart, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatTime } from './live-feed/utils';
import { EventView } from './live-feed/event-view';
import { processMatchActions, calculateScores } from './live-feed/event-processor';
import { LiveFeedPageProps, TeamLineup, Color } from './live-feed/types';
import { MatchEvent } from './live-feed/types';
import { MatchStats } from './live-feed/match-stats';
import { MatchHeader } from './live-feed/match-header';
import { MatchInfo } from './live-feed/match-info';

interface TeamInfo {
  sourceId: string;
  sourceName: string;
  strip: {
    color1: Color | null;
    color2: Color | null;
  };
}

export function LiveFeedPage({ fixtureId, competitionName, matchName, startDateUtc, venueName, roundName }: LiveFeedPageProps) {
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
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isMatchStatsExpanded, setIsMatchStatsExpanded] = useState<boolean>(true);
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

  // Update lineup data without caching - always use fresh data
  const updateLineups = useCallback((data: any) => {
    const updates = data.raw?.matchActions?.lineupUpdates?.updates;
    if (!updates?.length) return;

    // Always update with the latest lineup data, don't fallback to previous
      const latestHomeUpdate = updates
        .filter((u: any) => u.team === 'Home')
        .sort((a: any, b: any) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())[0];
      
      const latestAwayUpdate = updates
        .filter((u: any) => u.team === 'Away')
        .sort((a: any, b: any) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())[0];
      
    // Set home team lineup - use fresh data only
    if (latestHomeUpdate?.newLineup) {
      setHomeTeamLineup(latestHomeUpdate.newLineup);
      setIsLineupsLoading(false);
    }

    // Set away team lineup - use fresh data only
    if (latestAwayUpdate?.newLineup) {
      setAwayTeamLineup(latestAwayUpdate.newLineup);
      setIsLineupsLoading(false);
    }
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

  // Optimize scores update from raw data
  const updateScores = useCallback((data: any) => {
    const scores = calculateScores(data);
    setHomeScore(prev => prev !== scores.homeScore ? scores.homeScore : prev);
    setAwayScore(prev => prev !== scores.awayScore ? scores.awayScore : prev);
  }, []);

  // Process substitutions and update lineups in real-time
  const processSubstitutions = useCallback((data: any) => {
    const substitutions = data.raw?.matchActions?.substitutions?.substitutions;
    if (!substitutions?.length) return;

    // Get confirmed substitutions
    const confirmedSubs = substitutions.filter((sub: any) => sub.isConfirmed);
    if (!confirmedSubs.length) return;

    // Update home team lineup
    setHomeTeamLineup(prevLineup => {
      if (!prevLineup) return prevLineup;
      
      const homeSubs = confirmedSubs.filter((sub: any) => sub.team === 'Home');
      if (!homeSubs.length) return prevLineup;

      let updatedLineup = { ...prevLineup };
      
      homeSubs.forEach((sub: any) => {
        // Find player coming on (from bench)
        const playerOnIndex = updatedLineup.startingBench.findIndex(
          p => p.internalId === sub.playerOnInternalId
        );
        
        // Find player going off (from starting XI)
        const playerOffIndex = updatedLineup.startingOnPitch.findIndex(
          p => p.internalId === sub.playerOffInternalId
        );

        if (playerOnIndex !== -1 && playerOffIndex !== -1) {
          const playerOn = updatedLineup.startingBench[playerOnIndex];
          const playerOff = updatedLineup.startingOnPitch[playerOffIndex];

          // Create new arrays with the substitution
          updatedLineup = {
            ...updatedLineup,
            startingOnPitch: [
              ...updatedLineup.startingOnPitch.slice(0, playerOffIndex),
              playerOn,
              ...updatedLineup.startingOnPitch.slice(playerOffIndex + 1)
            ],
            startingBench: [
              ...updatedLineup.startingBench.slice(0, playerOnIndex),
              playerOff,
              ...updatedLineup.startingBench.slice(playerOnIndex + 1)
            ]
          };
        }
      });

      return updatedLineup;
    });

    // Update away team lineup
    setAwayTeamLineup(prevLineup => {
      if (!prevLineup) return prevLineup;
      
      const awaySubs = confirmedSubs.filter((sub: any) => sub.team === 'Away');
      if (!awaySubs.length) return prevLineup;

      let updatedLineup = { ...prevLineup };
      
      awaySubs.forEach((sub: any) => {
        // Find player coming on (from bench)
        const playerOnIndex = updatedLineup.startingBench.findIndex(
          p => p.internalId === sub.playerOnInternalId
        );
        
        // Find player going off (from starting XI)
        const playerOffIndex = updatedLineup.startingOnPitch.findIndex(
          p => p.internalId === sub.playerOffInternalId
        );

        if (playerOnIndex !== -1 && playerOffIndex !== -1) {
          const playerOn = updatedLineup.startingBench[playerOnIndex];
          const playerOff = updatedLineup.startingOnPitch[playerOffIndex];

          // Create new arrays with the substitution
          updatedLineup = {
            ...updatedLineup,
            startingOnPitch: [
              ...updatedLineup.startingOnPitch.slice(0, playerOffIndex),
              playerOn,
              ...updatedLineup.startingOnPitch.slice(playerOffIndex + 1)
            ],
            startingBench: [
              ...updatedLineup.startingBench.slice(0, playerOnIndex),
              playerOff,
              ...updatedLineup.startingBench.slice(playerOnIndex + 1)
            ]
          };
        }
      });

      return updatedLineup;
    });
  }, []);

  // Memoize possession data for MatchStats
  const memoizedPossession = useMemo(() => possession, [possession.home, possession.away]);

  // Son event'in timeElapsed'ını al ve matchPeriod'u güncelle
  const { lastTimeElapsed, currentPhase, displayPhase } = useMemo(() => {
    if (events.length === 0) return { lastTimeElapsed: '00:00', currentPhase: 'FirstHalf', displayPhase: 'First Half' };
    
    // Helper function to get the last clock stop time for completed phases
    const getLastClockStopTime = (phaseChangeTimestamp: string) => {
      // Find the last clock action event that stopped the clock before the phase change
      const clockStopEvents = events.filter(event => 
        event.type === 'clockAction' && 
        event.details.isClockRunning === false &&
        new Date(event.timestamp) <= new Date(phaseChangeTimestamp)
      );
      
      if (clockStopEvents.length > 0) {
        // Return the time from the most recent clock stop event
        return clockStopEvents[0].timeElapsed;
      }
      
      // Fallback to regular events if no clock stop found
      const regularEvents = events.filter(event => 
        event.team !== 'System' && 
        event.type !== 'bookingState' && 
        event.type !== 'phaseChange' && 
        event.type !== 'stoppageTime' &&
        new Date(event.timestamp) <= new Date(phaseChangeTimestamp)
      );
      
      return regularEvents.length > 0 ? regularEvents[0].timeElapsed : '00:00';
    };
    
    // First check for phase change events to get the most accurate current phase
    const phaseChangeEvents = events.filter(event => event.type === 'phaseChange');
    
    // If we have phase change events, use the most recent one to determine the current phase
    if (phaseChangeEvents.length > 0) {
      const latestPhaseChange = phaseChangeEvents[0]; // Events are already sorted by timestamp
      
      // Handle transition to PostMatch (match completely finished)
      if (latestPhaseChange.phase === 'PostMatch') {
        const lastTimeFromClockStop = getLastClockStopTime(latestPhaseChange.timestamp);
        
        return { 
          lastTimeElapsed: lastTimeFromClockStop, 
          currentPhase: 'PostMatch', 
          displayPhase: 'Match Complete' 
        };
      }
      
      // Handle transition to HalfTime (first half finished)
      if (latestPhaseChange.phase === 'HalfTime' && latestPhaseChange.details.previousPhase === 'FirstHalf') {
        const lastTimeFromClockStop = getLastClockStopTime(latestPhaseChange.timestamp);
        
        return { 
          lastTimeElapsed: lastTimeFromClockStop, 
          currentPhase: 'HalfTime', 
          displayPhase: '1st Half Complete' 
        };
      }
      
      // Handle transition to FullTimeNormalTime (second half finished, going to extra time)
      if (latestPhaseChange.phase === 'FullTimeNormalTime' && latestPhaseChange.details.previousPhase === 'SecondHalf') {
        const lastTimeFromClockStop = getLastClockStopTime(latestPhaseChange.timestamp);
        
        return { 
          lastTimeElapsed: lastTimeFromClockStop, 
          currentPhase: 'FullTimeNormalTime', 
          displayPhase: 'Full Time Normal Time' 
        };
      }
      
      // Handle transition to ExtraTimeHalfTime (extra time first half finished)
      if (latestPhaseChange.phase === 'ExtraTimeHalfTime' && latestPhaseChange.details.previousPhase === 'FullTimeExtraTime') {
        const lastTimeFromClockStop = getLastClockStopTime(latestPhaseChange.timestamp);
        
        return { 
          lastTimeElapsed: lastTimeFromClockStop, 
          currentPhase: 'ExtraTimeHalfTime', 
          displayPhase: 'Extra Time Half Time' 
        };
      }
      
      // Handle transition to Penalties (extra time second half finished)
      if (latestPhaseChange.phase === 'Penalties' && latestPhaseChange.details.previousPhase === 'ExtraTimeSecondHalf') {
        const lastTimeFromClockStop = getLastClockStopTime(latestPhaseChange.timestamp);
        
        return { 
          lastTimeElapsed: lastTimeFromClockStop, 
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
        // For completed phases, try to get clock stop time
        const halfTimeClockStop = getLastClockStopTime(lastEvent.timestamp);
        return { lastTimeElapsed: halfTimeClockStop, currentPhase: lastEvent.phase, displayPhase };
      case 'FullTime':
        displayPhase = '2nd Half Complete';
        // For completed phases, try to get clock stop time
        const fullTimeClockStop = getLastClockStopTime(lastEvent.timestamp);
        return { lastTimeElapsed: fullTimeClockStop, currentPhase: lastEvent.phase, displayPhase };
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
        // For completed phases, try to get clock stop time
        const postMatchClockStop = getLastClockStopTime(lastEvent.timestamp);
        return { lastTimeElapsed: postMatchClockStop, currentPhase: lastEvent.phase, displayPhase };
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

  // Track clock running status from clock action events
  useEffect(() => {
    // Find the most recent clock action event
    const clockActionEvents = events.filter(e => e.type === 'clockAction');
    
    if (clockActionEvents.length > 0) {
      // Get the latest clock action event (events are already sorted by timestamp)
      const latestClockAction = clockActionEvents[0];
      const newIsClockRunning = latestClockAction.details.isClockRunning ?? true;
      
      // Only update if the value has changed
      if (newIsClockRunning !== isClockRunning) {
        setIsClockRunning(newIsClockRunning);
        console.log('Clock status changed:', newIsClockRunning);
      }
    }
  }, [events, isClockRunning]);

  // Gol sayılarını hesapla
  const { homeGoals, awayGoals } = useMemo(() => {
    // Tüm gol olaylarını bul (dangerState tipindeki Goal olayları)
    const dangerStateGoals = events.filter(e => e.type === 'dangerState' && e.details.dangerState === 'Goal');
    
    // VAR kararlarını bul - sadece gol ile ilgili ve "No Goal" kararı verilmiş olanlar
    const cancelledGoals = events.filter(e => 
      e.type === 'var' && 
      e.details.state === 'Safe' && // Sadece tamamlanmış VAR kararlarını dikkate al
      (
        // Check both reason and originalReason for goal-related VAR
        (e.details.reason?.includes('Goal') && e.details.outcome?.includes('No Goal')) ||
        // Check originalOutcome for goal cancellations
        (e.details.originalOutcome?.includes('NoGoal')) ||
        // Also check for outcome text patterns
        (e.details.outcome === 'No Goal')
      )
    );
    
    // Debug logging to track VAR decisions
    if (cancelledGoals.length > 0) {
      console.log('Cancelled goals found:', cancelledGoals.map(g => ({
        id: g.id,
        team: g.team,
        reason: g.details.reason,
        outcome: g.details.outcome,
        originalReason: g.details.originalReason,
        originalOutcome: g.details.originalOutcome
      })));
    }
    
    // Ev sahibi ve deplasman takımlarının gol sayılarını hesapla
    const homeTeamGoals = dangerStateGoals.filter(e => e.team === 'Home').length;
    const awayTeamGoals = dangerStateGoals.filter(e => e.team === 'Away').length;
    
    // İptal edilen golleri takımlara göre say - improved team identification
    const cancelledHomeGoals = cancelledGoals.filter(e => {
      // First check the VAR event's team assignment
      if (e.team === 'Home') return true;
      
      // Then check the original reason for team identification
      if (e.details.originalReason?.includes('Home')) return true;
      
      // Check if the outcome mentions Home team
      if (e.details.originalOutcome?.includes('Home')) return true;
      
      // For "No Goal" outcomes, try to match with recent goal events by timestamp
      if (e.details.outcome === 'No Goal') {
        // Find a recent goal event within 2 minutes that could be related
        const eventTime = new Date(e.timestamp).getTime();
        const recentGoal = dangerStateGoals.find(goal => {
          const goalTime = new Date(goal.timestamp).getTime();
          const timeDiff = Math.abs(eventTime - goalTime);
          return goal.team === 'Home' && timeDiff < 120000; // 2 minutes threshold
        });
        if (recentGoal) return true;
      }
      
      return false;
    }).length;
    
    const cancelledAwayGoals = cancelledGoals.filter(e => {
      // First check the VAR event's team assignment
      if (e.team === 'Away') return true;
      
      // Then check the original reason for team identification
      if (e.details.originalReason?.includes('Away')) return true;
      
      // Check if the outcome mentions Away team
      if (e.details.originalOutcome?.includes('Away')) return true;
      
      // For "No Goal" outcomes, try to match with recent goal events by timestamp
      if (e.details.outcome === 'No Goal') {
        // Find a recent goal event within 2 minutes that could be related
        const eventTime = new Date(e.timestamp).getTime();
        const recentGoal = dangerStateGoals.find(goal => {
          const goalTime = new Date(goal.timestamp).getTime();
          const timeDiff = Math.abs(eventTime - goalTime);
          return goal.team === 'Away' && timeDiff < 120000; // 2 minutes threshold
        });
        if (recentGoal) return true;
      }
      
      return false;
    }).length;
    
    // Debug logging for final calculation
    console.log('Goal calculation:', {
      homeTeamGoals,
      awayTeamGoals,
      cancelledHomeGoals,
      cancelledAwayGoals,
      finalHome: Math.max(0, homeTeamGoals - cancelledHomeGoals),
      finalAway: Math.max(0, awayTeamGoals - cancelledAwayGoals)
    });
    
    // Net gol sayısını hesapla
    // Tehlike durumu olaylarından gelen goller - VAR ile iptal edilen goller
    return {
      homeGoals: Math.max(0, homeTeamGoals - cancelledHomeGoals),
      awayGoals: Math.max(0, awayTeamGoals - cancelledAwayGoals)
    };
  }, [events]);

  // Debug effect to track score changes
  useEffect(() => {
    console.log('Score values changed:', { homeGoals, awayGoals });
  }, [homeGoals, awayGoals]);

  useEffect(() => {
    const unsubscribe = api.subscribeToFixture(fixtureId, (data) => {
      const newEvents = processMatchActions(data);
      updateEvents(newEvents);
      updateTeams(data);
      updateLineups(data);
      updatePossession(data);
      updateScores(data);
      processSubstitutions(data);
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
  }, [fixtureId, updateEvents, updateTeams, updateLineups, updatePossession, updateScores, processSubstitutions, competitionName, matchName, startDateUtc]);

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
  }, [events]);

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
                venueName={venueName}
                roundName={roundName}
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
                homeScore={homeScore}
                awayScore={awayScore}
                stoppageTime={stoppageTime}
                currentPhase={currentPhase}
                isClockRunning={isClockRunning}
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
                        className="absolute top-0 left-0 w-full border-t border-b border-gray-100 dark:border-gray-800"
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

        {isMatchStatsExpanded && (
          <div className="w-[340px] border-l border-gray-100 dark:border-gray-700">
            <div className="border-b border-gray-100 dark:border-gray-700 p-2 py-[21.6px] flex items-center justify-between">
              <h2 className="text-sm font-normal flex items-center gap-2">
                <LucideAlignHorizontalJustifyStart className="w-4 h-4 text-blue-500" />
                Match Details
              </h2>
              <button
                onClick={() => setIsMatchStatsExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Close Match Details"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
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
        )}
        
        {!isMatchStatsExpanded && (
          <div className="w-8 border-l border-gray-100 dark:border-gray-700 flex items-center justify-center">
            <button
              onClick={() => setIsMatchStatsExpanded(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Open Match Details"
            >
              <ChevronLeft className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 