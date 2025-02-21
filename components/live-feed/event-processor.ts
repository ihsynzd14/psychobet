import { MatchEvent, DangerState, SystemMessageType, ThrowInState, LineupUpdate, Player } from './types';
import { useMemo } from 'react';

// Lineup verilerini tutacak cache
let lineupCache: {
  home: Map<string, Player>;
  away: Map<string, Player>;
} | null = null;

// Lineup verilerini işle ve cache'e al
const processLineupData = (lineupUpdates: LineupUpdate[]) => {
  if (lineupCache) return; // Cache zaten varsa tekrar işleme

  lineupCache = {
    home: new Map(),
    away: new Map()
  };

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
    return subs?.map((sub) => ({
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
    })) || [];
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
      if (corner.awarded?.isConfirmed) {
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
    return penalties?.map((penalty) => ({
      id: penalty.id,
      type: 'penalty',
      timestamp: penalty.timestampUtc,
      phase: penalty.phase,
      timeElapsed: penalty.timeElapsedInPhase,
      team: penalty.team,
      details: {
        outcome: penalty.penaltyOutcome?.outcome,
        isConfirmed: penalty.penaltyOutcome?.isConfirmed
      }
    })) || [];
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
      if (!reason || reason === 'NotSet' || reason === 'Unknown') return 'VAR Check';

      // Remove team prefix for mapping
      const cleanReason = reason.replace(/^(Home|Away)/, '');

      const reasonMapping: Record<string, string> = {
        'Goal': 'Goal Check',
        'Penalty': 'Penalty Check',
        'RedCard': 'Red Card Check',
        'MistakenIdentity': 'Player Identity Check',
        'PenaltyRetake': 'Penalty Retake Check',
        'Unknown': 'VAR Check'
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
      // Determine team based on reason or outcome with V2 priority
      const team = v.varReasonV2?.startsWith('Home') || v.varOutcomeV2?.startsWith('Home') 
        ? 'Home' 
        : v.varReasonV2?.startsWith('Away') || v.varOutcomeV2?.startsWith('Away')
        ? 'Away' 
        : v.varReason?.startsWith('Home') || v.varOutcome?.startsWith('Home')
        ? 'Home'
        : v.varReason?.startsWith('Away') || v.varOutcome?.startsWith('Away')
        ? 'Away'
        : 'System';

      const reason = v.varReasonV2 || v.varReason;
      const outcome = v.varOutcomeV2 || v.varOutcome;
      const state = v.varState || 'Safe';

      return {
        id: v.id,
        type: 'var',
        timestamp: v.timestampUtc,
        phase: v.phase,
        timeElapsed: v.timeElapsedInPhase,
        team,
        details: {
          state,
          stateText: varStateMapping[state] || 'VAR Check',
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
      'PostMatch': '2nd Half Complete',
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
          : phaseTitles[phase.currentPhase] || `${phase.currentPhase} Started`
      }
    })) || [];
  },

  dangerStateChanges: (dangers: any[]): MatchEvent[] => {
    if (!dangers) return [];
    
    // Tek seferde map işlemi
    return dangers
      .filter(event => {
        const team = event.dangerState.startsWith('Away') ? 'Away' : event.dangerState.startsWith('Home') ? 'Home' : null;
        return team && !event.dangerState.endsWith('Corner');
      })
      .map(event => {
        const team = event.dangerState.startsWith('Away') ? 'Away' : 'Home';
        return {
          id: event.id,
          type: 'dangerState',
          timestamp: event.timestampUtc,
          phase: event.phase,
          timeElapsed: event.timeElapsedInPhase,
          team,
          details: {
            dangerState: event.dangerState.replace(team, '') as DangerState,
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
    return bookings?.map((booking) => {
      // Önceki booking state'i bul - aynı takım için ve daha önceki bir zaman için
      const previousBookings = allEvents.bookingStateChanges?.bookingStateChanges?.filter(
        (prevBooking: any) => 
          prevBooking.sequenceId < booking.sequenceId && 
          prevBooking.team === booking.team &&
          prevBooking.bookingState !== 'Safe'
      );

      // En son booking state'i al
      const previousBooking = previousBookings?.sort((a: any, b: any) => b.sequenceId - a.sequenceId)[0];

      return {
        id: booking.id,
        type: 'bookingState',
        timestamp: booking.timestampUtc,
        phase: booking.phase,
        timeElapsed: booking.timeElapsedInPhase,
        team: booking.team,
        details: {
          bookingState: booking.bookingState,
          previousState: previousBooking?.bookingState || null,
          isConfirmed: booking.isConfirmed
        }
      };
    }) || [];
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
    ['phaseChanges.phaseChanges', eventProcessors.phaseChanges],
    ['dangerStateChanges.dangerStateChanges', (events) => eventProcessors.dangerStateChanges(events).map(event => ({
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
    ['systemMessages.systemMessages', eventProcessors.systemMessages],
    ['throwIns.matchActions', (events, extra) => eventProcessors.throwIns(events, extra).map(event => ({
      ...event,
      timeElapsed: formatTimeElapsed(event.phase, event.timeElapsed)
    }))],
    ['shotsOffWoodwork.matchActions', (events) => eventProcessors.shotsOffWoodwork(events).map(event => ({
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
    ['stoppageTimeAnnouncements.stoppageTimeAnnouncements', eventProcessors.stoppageTimeAnnouncements]
  ];

  // Tek seferde tüm processorları çalıştır
  for (const [path, processor] of processors) {
    const events = path.split('.').reduce((obj, key) => obj?.[key], actions);
    if (events) {
      newEvents.push(...processor(events, actions));
    }
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
  const [hours, minutes, seconds] = timeElapsed.split(':').map(Number);
  const totalMinutes = (phase === 'SecondHalf' ? 45 : 0) + (hours * 60) + minutes;
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
  if (state.includes('DangerousAttack')) return 'Dangerous';
  if (state.includes('Attack')) return 'Attack';
  return 'Safe';
}; 