import { MatchEvent, DangerState, SystemMessageType, ThrowInState } from './types';

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
        scoredBy: goal.scoredByInternalId,
        assistBy: goal.assistByInternalId
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
      details: { playerId: card.playerInternalId }
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
      details: { playerId: card.playerInternalId }
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
      details: { playerId: card.playerInternalId }
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
        playerOn: sub.playerOnInternalId,
        playerOff: sub.playerOffInternalId
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
        playerId: shot.playerInternalId,
        savedBy: shot.savedByInternalId
      }
    })) || [];
  },

  shotsOffWoodwork: (shots: any[]): MatchEvent[] => {
    // Handle the nested structure
    return shots?.map((shot) => ({
      id: shot.id,
      type: 'shotOffWoodwork',
      timestamp: shot.timestampUtc,
      phase: shot.phase,
      timeElapsed: shot.timeElapsedInPhase,
      team: shot.team,
      details: { 
        playerId: shot.playerInternalId,
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
      details: { playerId: shot.playerInternalId }
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
      details: { playerId: shot.playerInternalId }
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
    return var_?.map((v) => ({
      id: v.id,
      type: 'var',
      timestamp: v.timestampUtc,
      phase: v.phase,
      timeElapsed: v.timeElapsedInPhase,
      team: v.team,
      details: {
        state: v.varState,
        reason: v.varReasonV2 || v.varReason,
        outcome: v.varOutcomeV2 || v.varOutcome
      }
    })) || [];
  },

  phaseChanges: (phases: any[]): MatchEvent[] => {
    const phaseTitles: Record<string, string> = {
      'FirstHalf': '1st Half Started',
      'HalfTime': '1st Half Complete',
      'SecondHalf': '2nd Half Started',
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
      // Önceki booking state'i bul
      const previousBooking = allEvents.bookingStateChanges?.bookingStateChanges?.find(
        (prevBooking: any) => 
          prevBooking.sequenceId < booking.sequenceId && 
          prevBooking.team === booking.team &&
          prevBooking.bookingState !== 'Safe'
      );

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
      details: { playerId: event.playerInternalId }
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
      details: { playerId: event.playerInternalId }
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
      details: { playerId: event.playerInternalId }
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
        playerId: event.playerInternalId,
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