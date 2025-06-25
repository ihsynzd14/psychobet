import { MatchEvent, DangerState, SystemMessageType, ThrowInState, LineupUpdate, Player } from './types';
import { useMemo } from 'react';

// Lineup verilerini tutacak cache
let lineupCache: {
  home: Map<string, Player>;
  away: Map<string, Player>;
} | null = null;

// Lineup verilerini işle ve cache'e al
const processLineupData = (lineupUpdates: LineupUpdate[]) => {
  // Initialize cache if it doesn't exist
  if (!lineupCache) {
    lineupCache = {
      home: new Map(),
      away: new Map()
    };
  }

  // Her takım için son lineup güncellemesini bul
  const homeUpdate = lineupUpdates.filter(u => u.team === 'Home').pop();
  const awayUpdate = lineupUpdates.filter(u => u.team === 'Away').pop();

  if (homeUpdate) {
    [...homeUpdate.newLineup.startingOnPitch, ...homeUpdate.newLineup.startingBench].forEach(player => {
      lineupCache!.home.set(player.internalId, player);
    });
  }

  if (awayUpdate) {
    [...awayUpdate.newLineup.startingOnPitch, ...awayUpdate.newLineup.startingBench].forEach(player => {
      lineupCache!.away.set(player.internalId, player);
    });
  }
};

// Player bilgisini getir
const getPlayerInfo = (internalId: string | null, team: 'Home' | 'Away'): Player | null => {
  if (!internalId || !lineupCache) return null;
  return lineupCache[team.toLowerCase() as 'home' | 'away'].get(internalId) || null;
};

// Pre-define processors for better performance
const eventProcessors = {
  goals: (goals: any[]): MatchEvent[] => {
    return goals?.map((goal) => ({
      id: goal.id,
      type: 'goal',
      timestamp: goal.timestampUtc,
      phase: goal.phase,
      timeElapsed: goal.timeElapsedInPhase,
      team: goal.team,
      details: {
        isOwnGoal: goal.isOwnGoal,
        wasPenalty: goal.wasScoredFromPenalty,
        scoredBy: getPlayerInfo(goal.scoredByInternalId, goal.team),
        assistBy: getPlayerInfo(goal.assistByInternalId, goal.team),
        isConfirmed: goal.isConfirmed
      }
    })) || [];
  },

  yellowCards: (cards: any[]): MatchEvent[] => {
    return cards?.map((card) => ({
      id: card.id,
      type: 'yellowCard',
      timestamp: card.timestampUtc,
      phase: card.phase,
      timeElapsed: card.timeElapsedInPhase,
      team: card.team,
      details: { 
        player: getPlayerInfo(card.playerInternalId, card.team),
        isConfirmed: card.isConfirmed 
      }
    })) || [];
  },

  secondYellowCards: (cards: any[]): MatchEvent[] => {
    return cards?.map((card) => ({
      id: card.id,
      type: 'secondYellow',
      timestamp: card.timestampUtc,
      phase: card.phase,
      timeElapsed: card.timeElapsedInPhase,
      team: card.team,
      details: { 
        player: getPlayerInfo(card.playerInternalId, card.team),
        isConfirmed: card.isConfirmed 
      }
    })) || [];
  },

  straightRedCards: (cards: any[]): MatchEvent[] => {
    return cards?.map((card) => ({
      id: card.id,
      type: 'redCard',
      timestamp: card.timestampUtc,
      phase: card.phase,
      timeElapsed: card.timeElapsedInPhase,
      team: card.team,
      details: { 
        player: getPlayerInfo(card.playerInternalId, card.team),
        isConfirmed: card.isConfirmed 
      }
    })) || [];
  },

  substitutions: (subs: any[]): MatchEvent[] => {
    return subs?.map((sub) => {
      // Create the basic substitution event
      const event: MatchEvent = {
        id: sub.id,
        type: 'substitution',
        timestamp: sub.timestampUtc,
        phase: sub.phase,
        timeElapsed: sub.timeElapsedInPhase,
        team: sub.team,
        details: {
          playerOn: getPlayerInfo(sub.playerOnInternalId, sub.team),
          playerOff: getPlayerInfo(sub.playerOffInternalId, sub.team),
          isConfirmed: sub.isConfirmed
        }
      };
      
      return event;
    }) || [];
  },

  shotsOnTarget: (shots: any[]): MatchEvent[] => {
    return shots?.map((shot) => ({
      id: shot.id,
      type: 'shotOnTarget',
      timestamp: shot.timestampUtc,
      phase: shot.phase,
      timeElapsed: shot.timeElapsedInPhase,
      team: shot.team,
      details: {
        player: getPlayerInfo(shot.playerInternalId, shot.team),
        savedBy: getPlayerInfo(shot.savedByInternalId, shot.team === 'Home' ? 'Away' : 'Home'),
        isConfirmed: shot.isConfirmed
      }
    })) || [];
  },

  shotsOffWoodwork: (shots: any[]): MatchEvent[] => {
    return shots?.map((shot) => ({
      id: shot.id,
      type: 'shotOffWoodwork',
      timestamp: shot.timestampUtc,
      phase: shot.phase,
      timeElapsed: shot.timeElapsedInPhase,
      team: shot.team,
      details: { 
        player: getPlayerInfo(shot.playerInternalId, shot.team),
        isConfirmed: shot.isConfirmed,
        ballReturnedToPlay: shot.ballReturnedToPlay
      }
    })) || [];
  },

  shotsOffTarget: (shots: any[]): MatchEvent[] => {
    return shots?.map((shot) => ({
      id: shot.id,
      type: 'shotOffTarget',
      timestamp: shot.timestampUtc,
      phase: shot.phase,
      timeElapsed: shot.timeElapsedInPhase,
      team: shot.team,
      details: { 
        player: getPlayerInfo(shot.playerInternalId, shot.team),
        isConfirmed: shot.isConfirmed
      }
    })) || [];
  },

  blockedShots: (shots: any[]): MatchEvent[] => {
    return shots?.map((shot) => ({
      id: shot.id,
      type: 'shotBlocked',
      timestamp: shot.timestampUtc,
      phase: shot.phase,
      timeElapsed: shot.timeElapsedInPhase,
      team: shot.team,
      details: { 
        player: getPlayerInfo(shot.playerInternalId, shot.team),
        isConfirmed: shot.isConfirmed
      }
    })) || [];
  },

  corners: (corners: any[]): MatchEvent[] => {
    const events: MatchEvent[] = [];
    corners?.forEach((corner) => {
      if (corner.awarded) {
        events.push({
          id: parseInt(corner.id + '01'),
          type: 'cornerAwarded',
          timestamp: corner.awarded.timestampUtc,
          phase: corner.phase,
          timeElapsed: corner.awarded.timeElapsedInPhase,
          team: corner.team,
          details: { status: 'awarded' }
        });
      }
      if (corner.taken?.isConfirmed) {
        events.push({
          id: parseInt(corner.id + '02'),
          type: 'cornerTaken',
          timestamp: corner.taken.timestampUtc,
          phase: corner.phase,
          timeElapsed: corner.taken.timeElapsedInPhase,
          team: corner.team,
          details: { status: 'taken' }
        });
      }
    });
    return events;
  },

  penalties: (penalties: any[]): MatchEvent[] => {
    if (!penalties) return [];

    const events: MatchEvent[] = [];

    penalties.forEach(penalty => {
      // Create initial penalty awarded event
      events.push({
        id: penalty.id * 10, // Multiply by 10 to avoid ID conflicts with outcome events
        type: 'penalty',
        timestamp: penalty.timestampUtc,
        phase: penalty.phase,
        timeElapsed: penalty.timeElapsedInPhase,
        team: penalty.team,
        details: {
          state: 'awarded',
          outcome: undefined,
          player: getPlayerInfo(penalty.playerInternalId, penalty.team),
          isConfirmed: penalty.isConfirmed
        }
      });

      // If we have an outcome, create an outcome event
      if (penalty.penaltyOutcome) {
        const outcomeTimestamp = new Date(penalty.timestampUtc);
        outcomeTimestamp.setSeconds(outcomeTimestamp.getSeconds() + 1); // Add 1 second to ensure proper ordering

        events.push({
          id: penalty.id * 10 + 1, // Add 1 to differentiate from award event
          type: 'penalty',
          timestamp: outcomeTimestamp.toISOString(),
          phase: penalty.phase,
          timeElapsed: penalty.timeElapsedInPhase,
          team: penalty.team,
          details: {
            state: 'outcome',
            outcome: penalty.penaltyOutcome.outcome || 'NotTaken',
            player: getPlayerInfo(penalty.playerInternalId, penalty.team),
            isConfirmed: penalty.penaltyOutcome.isConfirmed
          }
        });
      }
    });

    return events;
  },

  varStateChanges: (var_: any[]): MatchEvent[] => {
    if (!var_) return [];

    // VAR State mapping
    const varStateMapping: Record<string, string> = {
      'Safe': 'VAR Complete',
      'InProgress': 'VAR In Progress',
      'Danger': 'VAR Check'
    };

    const getVarTitle = (reason: string): string => {
      if (!reason || reason === 'NotSet') return '';  // Return empty string for NotSet only

      // Handle team-specific reasons first (before removing team prefix)
      if (reason === 'HomeUnknown') return 'Home Team Incident';
      if (reason === 'AwayUnknown') return 'Away Team Incident';
      if (reason === 'HomeGoal') return 'Home Goal';
      if (reason === 'AwayGoal') return 'Away Goal';

      // Remove team prefix for mapping
      const cleanReason = reason.replace(/^(Home|Away)/, '');

      const reasonMapping: Record<string, string> = {
        'Goal': reason.startsWith('Home') ? 'Home Goal' : reason.startsWith('Away') ? 'Away Goal' : 'Goal Check',
        'Penalty': 'Penalty Check',
        'RedCard': 'Red Card Check',
        'MistakenIdentity': 'Player Identity Check',
        'PenaltyRetake': 'Penalty Retake Check',
        'Unknown': ''
      };

      return reasonMapping[cleanReason] || 'VAR Check';
    };

    const getVarOutcomeText = (outcome: string, state: string): string => {
      if (!outcome || outcome === 'NotSet' || outcome === 'Unknown') {
        return state === 'InProgress' ? 'Checking...' : '';
      }

      // Remove team prefix for mapping
      const cleanOutcome = outcome.replace(/^(Home|Away)/, '');

      const outcomeMapping: Record<string, string> = {
        // Goal Outcomes
        'GoalAwarded': 'Goal Given',
        'NoGoal': 'No Goal',
        
        // Penalty Outcomes
        'PenaltyAwarded': 'Penalty Given',
        'NoPenalty': 'No Penalty',
        'PenaltyWillBeRetaken': 'Penalty to be Retaken',
        'NoPenaltyRetake': 'No Penalty Retake',
        
        // Card Outcomes
        'RedCardGiven': 'Red Card Given',
        'NoRedCard': 'No Red Card',
        
        // Player Identity Outcomes
        'PlayerChanged': 'Player Identity Corrected',
        'PlayerNotChanged': 'Player Identity Confirmed',
        
        // Other Outcomes
        'NoAction': 'No Action Required',
        'Unknown': 'Decision Pending'
      };

      return outcomeMapping[cleanOutcome] || cleanOutcome;
    };

    const getVarStateColor = (state: string): string => {
      switch (state) {
        case 'InProgress':
          return 'text-yellow-600 dark:text-yellow-400';
        case 'Danger':
          return 'text-red-600 dark:text-red-400';
        case 'Safe':
        default:
          return 'text-green-600 dark:text-green-400';
      }
    };

    return var_.map((v) => {
      // Determine team based on VAR state and reason/outcome
      const team = v.varState === 'Danger' 
        ? 'System'  // Always center for initial VAR check
        : v.varState === 'InProgress'
        ? (v.varReasonV2?.startsWith('Home') || v.varReason?.startsWith('Home') ? 'Home' : 'Away')
        : v.varState === 'Safe' && v.varOutcomeV2 === 'NotSet'
        ? 'System'  // Center for VAR not given
        : (v.varOutcomeV2?.startsWith('Home') || v.varOutcome?.startsWith('Home') ? 'Home' : 'Away');

      const reason = v.varReasonV2 || v.varReason;
      const outcome = v.varOutcomeV2 || v.varOutcome;
      const state = v.varState || 'Safe';

      // Determine display text based on state
      let display = varStateMapping[state] || 'VAR Check';

      // VAR durumuna göre mesajı oluştur
      if (state === 'Danger') {
        const reasonText = getVarTitle(reason);
        display = reasonText ? `Possible VAR - ${reasonText}` : 'Possible VAR';
      } else if (state === 'InProgress' && reason && reason !== 'NotSet') {
        display = `VAR - ${getVarTitle(reason)}`;
      } else if (state === 'Safe' && outcome && outcome !== 'NotSet') {
        display = `VAR Ended - ${getVarOutcomeText(outcome, state)}`;
      } else if (state === 'Safe' && outcome === 'NotSet') {
        display = 'No VAR';  // Just the message without any additional text
      }

      return {
        id: v.id,
        type: 'var',
        timestamp: v.timestampUtc,
        phase: v.phase,
        timeElapsed: v.timeElapsedInPhase,
        team,
        details: {
          state,
          stateText: display,
          stateColor: getVarStateColor(state),
          reason: getVarTitle(reason),
          outcome: getVarOutcomeText(outcome, state),
          isConfirmed: v.isConfirmed,
          originalReason: reason,
          originalOutcome: outcome,
          isInProgress: state === 'InProgress'
        }
      };
    });
  },

  phaseChanges: (phases: any[]): MatchEvent[] => {
    const phaseTitles: Record<string, string> = {
      'FirstHalf': '1st Half Started',
      'HalfTime': '1st Half Complete',
      'SecondHalf': '2nd Half Started',
      'PostMatch': 'Match Complete',
      'Penalties': 'Penalties Started',
      'FullTimeNormalTime': 'Full Time Normal Time',
      'FullTimeExtraTime': 'Extra Time First Half',
      'ExtraTimeHalfTime': 'Extra Time Half Time',
      'ExtraTimeSecondHalf': 'Extra Time Second Half',
      'FullTime': '2nd Half Complete'
    };

    return phases?.map((phase) => ({
      id: phase.id,
      type: 'phaseChange',
      timestamp: phase.timestampUtc,
      phase: phase.currentPhase,
      timeElapsed: '00:00',
      team: 'System',
      details: {
        previousPhase: phase.previousPhase,
        currentPhase: phase.currentPhase,
        startTime: phase.currentPhaseStartTime,
        phaseTitle: phase.previousPhase === 'FirstHalf' && phase.currentPhase === 'HalfTime' 
          ? '1st Half Complete' 
          : phase.previousPhase === 'SecondHalf' && phase.currentPhase === 'FullTime'
          ? '2nd Half Complete'
          : phase.previousPhase === 'SecondHalf' && phase.currentPhase === 'FullTimeNormalTime'
          ? 'Full Time Normal Time'
          : phase.previousPhase === 'FullTimeNormalTime' && phase.currentPhase === 'FullTimeExtraTime'
          ? 'Extra Time First Half'
          : phase.previousPhase === 'FullTimeExtraTime' && phase.currentPhase === 'ExtraTimeHalfTime'
          ? 'Extra Time Half Time'
          : phase.previousPhase === 'ExtraTimeHalfTime' && phase.currentPhase === 'ExtraTimeSecondHalf'
          ? 'Extra Time Second Half'
          : phase.previousPhase === 'ExtraTimeSecondHalf' && phase.currentPhase === 'Penalties'
          ? 'Penalties Started'
          : phaseTitles[phase.currentPhase] || `${phase.currentPhase} Started`
      }
    })) || [];
  },

  dangerStateChanges: (dangers: any[], allEvents: any): MatchEvent[] => {
    if (!dangers) return [];
    
    // Tek seferde map işlemi
    return dangers
      .filter(event => {
        const team = event.dangerState.startsWith('Away') ? 'Away' : event.dangerState.startsWith('Home') ? 'Home' : null;
        return team && !event.dangerState.endsWith('Corner');
      })
      .map(event => {
        const team = event.dangerState.startsWith('Away') ? 'Away' : 'Home';
        const dangerState = event.dangerState.replace(team, '') as DangerState;
        
        // For Goal events, try to find the corresponding goal event to get scorer and assist info
        if (dangerState === 'Goal') {
          // Try to find a matching goal event with the same timestamp or very close
          const goalEvents = allEvents.goals?.goals || [];
          const matchingGoal = goalEvents.find((goal: any) => {
            // Check if timestamps are close (within 5 seconds)
            const eventTime = new Date(event.timestampUtc).getTime();
            const goalTime = new Date(goal.timestampUtc).getTime();
            const timeDiff = Math.abs(eventTime - goalTime);
            return goal.team === team && timeDiff < 5000; // 5 seconds threshold
          });
          
          if (matchingGoal) {
            return {
              id: event.id,
              type: 'dangerState',
              timestamp: event.timestampUtc,
              phase: event.phase,
              timeElapsed: event.timeElapsedInPhase,
              team,
              details: {
                dangerState,
                isConfirmed: event.isConfirmed,
                // Add goal details from the matching goal event
                isOwnGoal: matchingGoal.isOwnGoal,
                wasPenalty: matchingGoal.wasScoredFromPenalty,
                scoredBy: getPlayerInfo(matchingGoal.scoredByInternalId, team),
                assistBy: getPlayerInfo(matchingGoal.assistByInternalId, team)
              }
            };
          }
        }
        
        // Default return for non-goal events or when no matching goal event is found
        return {
          id: event.id,
          type: 'dangerState',
          timestamp: event.timestampUtc,
          phase: event.phase,
          timeElapsed: event.timeElapsedInPhase,
          team,
          details: {
            dangerState,
            isConfirmed: event.isConfirmed
          }
        };
      });
  },

  fouls: (fouls: any[]): MatchEvent[] => {
    if (!fouls) return [];
    
    // Tek seferde map işlemi
    return fouls.map(event => ({
      id: event.id + 10000, // FoulGiven olayları için ID offset
      type: 'foul',
      timestamp: event.timestampUtc,
      phase: event.phase,
      timeElapsed: event.timeElapsedInPhase,
      team: event.foulingTeam === 'Home' ? 'Away' : 'Home', // Karşı takıma atama
      details: {
        dangerState: 'FoulGiven' as DangerState,
        isConfirmed: event.isConfirmed
      }
    }));
  },

  bookingStateChanges: (bookings: any[], allEvents: any): MatchEvent[] => {
    const result: MatchEvent[] = [];
    
    if (!bookings) return result;
    
    interface YellowCardState {
      sequenceId: number;
      timestamp: string;
    }
    
    // Track active booking states with their sequence IDs and timestamps
    const activeStates = {
      yellow: [] as YellowCardState[], // Array to track multiple yellow cards with their details
      red: new Set<number>()
    };
    
    // Process bookings in sequence order
    const sortedBookings = [...bookings].sort((a, b) => a.sequenceId - b.sequenceId);
    
    sortedBookings.forEach(booking => {
      if (booking.bookingState === 'YellowCardDanger') {
        // Store the yellow card risk with its details
        activeStates.yellow.push({
          sequenceId: booking.sequenceId,
          timestamp: booking.timestampUtc
        });
        
        result.push({
          id: booking.id,
          type: 'bookingState',
          timestamp: booking.timestampUtc,
          phase: booking.phase,
          timeElapsed: booking.timeElapsedInPhase,
          team: booking.team,
          details: {
            bookingState: booking.bookingState,
            previousState: undefined,
            isConfirmed: booking.isConfirmed
          }
        });
      } 
      else if (booking.bookingState === 'RedCardDanger') {
        activeStates.red.add(booking.sequenceId);
        result.push({
          id: booking.id,
          type: 'bookingState',
          timestamp: booking.timestampUtc,
          phase: booking.phase,
          timeElapsed: booking.timeElapsedInPhase,
          team: booking.team,
          details: {
            bookingState: booking.bookingState,
            previousState: undefined,
            isConfirmed: booking.isConfirmed
          }
        });
      }
      else if (booking.bookingState === 'Safe') {
        // Create end events for all active states
        if (activeStates.red.size > 0) {
          result.push({
            id: booking.id * 10 + 1,
            type: 'bookingState',
            timestamp: booking.timestampUtc,
            phase: booking.phase,
            timeElapsed: booking.timeElapsedInPhase,
            team: booking.team,
            details: {
              bookingState: 'Safe',
              previousState: 'RedCardDanger',
              isConfirmed: booking.isConfirmed
            }
          });
          activeStates.red.clear();
        }
        
        // Create separate end events for each active yellow card risk
        activeStates.yellow.forEach((yellowCard, index) => {
          const yellowEndTime = new Date(booking.timestampUtc);
          // Add small time offset for each yellow card to maintain order
          yellowEndTime.setMilliseconds(yellowEndTime.getMilliseconds() + index + 1);
          
          result.push({
            id: booking.id * 10 + 2 + index,
            type: 'bookingState',
            timestamp: yellowEndTime.toISOString(),
            phase: booking.phase,
            timeElapsed: booking.timeElapsedInPhase,
            team: booking.team,
            details: {
              bookingState: 'Safe',
              previousState: 'YellowCardDanger',
              isConfirmed: booking.isConfirmed
            }
          });
        });
        
        // Clear all active states
        activeStates.yellow = [];
      }
    });
    
    return result;
  },

  systemMessages: (msgs: any[]): MatchEvent[] => {
    return msgs?.filter(msg => msg.message !== "Standby").map((msg) => ({
      id: msg.id,
      type: 'systemMessage',
      timestamp: msg.timestamp,
      phase: msg.phase,
      timeElapsed: msg.timeElapsedInPhase,
      team: 'System',
      details: {
        message: msg.message,
        messageId: msg.messageId,
        messageType: getSystemMessageType(msg.messageId),
        isConfirmed: true
      }
    })) || [];
  },

  goalKicks: (events: any[]): MatchEvent[] => {
    return events?.map((event) => ({
      id: event.id,
      type: 'goalKick',
      timestamp: event.timestampUtc,
      phase: event.phase,
      timeElapsed: event.timeElapsedInPhase,
      team: event.team,
      details: { 
        player: getPlayerInfo(event.playerInternalId, event.team),
        isConfirmed: event.isConfirmed
      }
    })) || [];
  },

  offsides: (events: any[]): MatchEvent[] => {
    return events?.map((event) => ({
      id: event.id,
      type: 'offsides',
      timestamp: event.timestampUtc,
      phase: event.phase,
      timeElapsed: event.timeElapsedInPhase,
      team: event.team,
      details: { 
        player: getPlayerInfo(event.playerInternalId, event.team),
        isConfirmed: event.isConfirmed
      }
    })) || [];
  },

  kickOffs: (events: any[]): MatchEvent[] => {
    return events?.map((event) => ({
      id: event.id,
      type: 'kickOff',
      timestamp: event.timestampUtc,
      phase: event.phase,
      timeElapsed: event.timeElapsedInPhase,
      team: event.team,
      details: { 
        player: getPlayerInfo(event.playerInternalId, event.team),
        isConfirmed: event.isConfirmed
      }
    })) || [];
  },

  throwIns: (events: any[], allEvents: any): MatchEvent[] => {
    return events?.map((event) => ({
      id: event.id,
      type: 'throwIn',
      timestamp: event.timestampUtc,
      phase: event.phase,
      timeElapsed: event.timeElapsedInPhase,
      team: event.team,
      details: {
        player: getPlayerInfo(event.playerInternalId, event.team),
        isConfirmed: event.isConfirmed,
        throwInState: getThrowInState(allEvents, event)
      }
    })) || [];
  },

  stoppageTimeAnnouncements: (announcements: any[]): MatchEvent[] => {
    return announcements?.map((announcement) => ({
      id: announcement.id,
      type: 'stoppageTime',
      timestamp: announcement.timestampUtc,
      phase: announcement.phase,
      timeElapsed: announcement.timeElapsedInPhase,
      team: 'System',
      details: {
        addedMinutes: announcement.addedMinutes,
        isConfirmed: announcement.isConfirmed
      }
    })) || [];
  },

  // Remove the missedPenalties processor since it's now handled in the penalties processor
  missedPenalties: (penalties: any[]): MatchEvent[] => {
    // Return empty array since missed penalties are now handled in the penalties processor
    return [];
  }
};

export const processMatchActions = (data: any): MatchEvent[] => {
  const actions = data.raw.matchActions;
  
  // Lineup verilerini işle
  if (actions.lineupUpdates?.updates) {
    processLineupData(actions.lineupUpdates.updates);
  }

  const newEvents: MatchEvent[] = [];

  // Tüm event processorları için array oluştur
  const processors: [string, (events: any[], extra?: any) => MatchEvent[]][] = [
    ['goals.goals', (events) => eventProcessors.goals(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['yellowCards.matchActions', (events) => eventProcessors.yellowCards(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['secondYellowCards.matchActions', (events) => eventProcessors.secondYellowCards(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['straightRedCards.matchActions', (events) => eventProcessors.straightRedCards(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['substitutions.substitutions', (events) => eventProcessors.substitutions(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['shotsOnTarget.shotsOnTarget', (events) => eventProcessors.shotsOnTarget(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['shotsOffTarget.matchActions', (events) => eventProcessors.shotsOffTarget(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['blockedShots.matchActions', (events) => eventProcessors.blockedShots(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['cornersV2.corners', (events) => eventProcessors.corners(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['penalties.penalties', (events) => eventProcessors.penalties(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['varStateChanges.varStateChanges', (events) => eventProcessors.varStateChanges(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['phaseChanges.phaseChanges', (events) => eventProcessors.phaseChanges(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['dangerStateChanges.dangerStateChanges', (events, extra) => eventProcessors.dangerStateChanges(events, extra).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['fouls.fouls', (events) => eventProcessors.fouls(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['bookingStateChanges.bookingStateChanges', (events, extra) => eventProcessors.bookingStateChanges(events, extra).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['systemMessages.systemMessages', (events) => eventProcessors.systemMessages(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['throwIns.matchActions', (events, extra) => eventProcessors.throwIns(events, extra).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['shotsOffWoodwork.shotsOffWoodwork', (events) => eventProcessors.shotsOffWoodwork(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['goalKicks.matchActions', (events) => eventProcessors.goalKicks(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['offsides.matchActions', (events) => eventProcessors.offsides(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['kickOffs.matchActions', (events) => eventProcessors.kickOffs(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['stoppageTimeAnnouncements.stoppageTimeAnnouncements', (events) => eventProcessors.stoppageTimeAnnouncements(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['missedPenalties.matchActions', (events) => eventProcessors.missedPenalties(events).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
  ];

  // Tek seferde tüm processorları çalıştır
  for (const [path, processor] of processors) {
    const events = path.split('.').reduce((obj, key) => obj?.[key], actions);
    if (events) {
      newEvents.push(...processor(events, actions));
    }
  }

  // Update substitution events with player data if available
  if (lineupCache) {
    for (let i = 0; i < newEvents.length; i++) {
      const event = newEvents[i];
      if (event.type === 'substitution') {
        // If player data is missing, try to get it from the lineup cache
        if (!event.details.playerOn && event.team && (event.team === 'Home' || event.team === 'Away')) {
          const sub = actions.substitutions?.substitutions?.find((s: any) => s.id === event.id);
          if (sub && sub.playerOnInternalId) {
            event.details.playerOn = getPlayerInfo(sub.playerOnInternalId, event.team);
          }
        }
        
        if (!event.details.playerOff && event.team && (event.team === 'Home' || event.team === 'Away')) {
          const sub = actions.substitutions?.substitutions?.find((s: any) => s.id === event.id);
          if (sub && sub.playerOffInternalId) {
            event.details.playerOff = getPlayerInfo(sub.playerOffInternalId, event.team);
          }
        }
      }
    }
  }

  // Process goal events to update dangerState Goal events with scorer information
  const goalEvents = newEvents.filter(e => e.type === 'goal');
  const dangerStateGoalEvents = newEvents.filter(e => e.type === 'dangerState' && e.details.dangerState === 'Goal');
  
  if (goalEvents.length > 0 && dangerStateGoalEvents.length > 0) {
    // For each dangerState Goal event, try to find a matching goal event
    dangerStateGoalEvents.forEach(dangerEvent => {
      // Find a goal event for the same team with a close timestamp
      const matchingGoal = goalEvents.find(goalEvent => {
        const dangerTime = new Date(dangerEvent.timestamp).getTime();
        const goalTime = new Date(goalEvent.timestamp).getTime();
        const timeDiff = Math.abs(dangerTime - goalTime);
        return goalEvent.team === dangerEvent.team && timeDiff < 10000; // 10 seconds threshold
      });
      
      // If we found a matching goal event, update the dangerState event with scorer info
      if (matchingGoal && matchingGoal.details.scoredBy) {
        dangerEvent.details.scoredBy = matchingGoal.details.scoredBy;
        dangerEvent.details.assistBy = matchingGoal.details.assistBy;
        dangerEvent.details.isOwnGoal = matchingGoal.details.isOwnGoal;
        dangerEvent.details.wasPenalty = matchingGoal.details.wasPenalty;
      }
    });
  }

  // Son sıralama işlemi
  return newEvents.sort((a, b) => {
    // Foul olaylarını her zaman üste koy
    const aIsFoul = a.type === 'foul';
    const bIsFoul = b.type === 'foul';
    
    if (aIsFoul !== bIsFoul) {
      return aIsFoul ? 1 : -1;  // Foul'u her zaman üste koy
    }
    
    // Eğer ikisi de foul veya ikisi de foul değilse, timestamp'e göre sırala
    return b.timestamp.localeCompare(a.timestamp);
  });
};

// Helper function to determine message type
const getSystemMessageType = (messageId: number): SystemMessageType => {
  // Game state messages
  if (messageId >= 2000 && messageId < 3000) return 'info';
  // Warning messages
  if (messageId >= 1000 && messageId < 2000) return 'warning';
  // Error messages
  if (messageId >= 3000) return 'error';
  // Default info messages
  return 'info';
};

// Optimize edilmiş zaman formatı fonksiyonu
const formatTimeElapsed = (phase: string, timeElapsed: string): string => {
  if (!timeElapsed || timeElapsed === '00:00') return '00:00';

  // HH:MM:SS formatını kontrol et
  if (timeElapsed.split(':').length === 3) {
    const [hours, minutes, seconds] = timeElapsed.split(':').map(Number);
    const totalMinutes = (phase === 'SecondHalf' ? 45 : 0) + (hours * 60) + minutes;
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // MM:SS formatı için
  const [minutes, seconds] = timeElapsed.split(':').map(Number);
  const totalMinutes = (phase === 'SecondHalf' ? 45 : 0) + minutes;
  return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
};

const getThrowInState = (events: Record<string, any>, currentEvent: any): ThrowInState => {
  // Aynı takımın sonraki tehlike durumunu bul
  const nextDangerState = events.dangerStateChanges?.dangerStateChanges?.find(
    (danger: any) => 
      danger.sequenceId > currentEvent.sequenceId && 
      danger.timeElapsedInPhase === currentEvent.timeElapsedInPhase &&
      danger.dangerState.startsWith(currentEvent.team)
  );

  if (!nextDangerState) return null;

  const state = nextDangerState.dangerState.replace(currentEvent.team, '');
  if (state.includes('DangerousAttack')) return 'Dangerous Attack';
  if (state.includes('Attack')) return 'Attack';
  return 'Safe';
}; 