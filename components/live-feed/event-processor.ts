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
    ['goals.goals', eventProcessors.goals],
    ['yellowCards.matchActions', eventProcessors.yellowCards],
    ['secondYellowCards.matchActions', eventProcessors.secondYellowCards],
    ['straightRedCards.matchActions', eventProcessors.straightRedCards],
    ['substitutions.substitutions', eventProcessors.substitutions],
    ['shotsOnTarget.shotsOnTarget', eventProcessors.shotsOnTarget],
    ['shotsOffTarget.matchActions', eventProcessors.shotsOffTarget],
    ['blockedShots.matchActions', eventProcessors.blockedShots],
    ['cornersV2.corners', eventProcessors.corners],
    ['penalties.penalties', eventProcessors.penalties],
    ['varStateChanges.varStateChanges', eventProcessors.varStateChanges],
    ['phaseChanges.phaseChanges', eventProcessors.phaseChanges],
    ['dangerStateChanges.dangerStateChanges', eventProcessors.dangerStateChanges],
    ['fouls.fouls', eventProcessors.fouls],
    ['bookingStateChanges.bookingStateChanges', eventProcessors.bookingStateChanges],
    ['systemMessages.systemMessages', eventProcessors.systemMessages],
    ['throwIns.matchActions', eventProcessors.throwIns],
    ['shotsOffWoodwork.matchActions', eventProcessors.shotsOffWoodwork],
    ['goalKicks.matchActions', eventProcessors.goalKicks],
    ['offsides.matchActions', eventProcessors.offsides],
    ['kickOffs.matchActions', eventProcessors.kickOffs],
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
    // Önce timestamp'e göre sırala (yeni olaylar önce)
    const timestampCompare = b.timestamp.localeCompare(a.timestamp);
    if (timestampCompare !== 0) return timestampCompare;

    // Aynı timestamp'te, FoulGiven ve diğer olayları sırala
    const aIsFoul = a.details.dangerState === 'FoulGiven';
    const bIsFoul = b.details.dangerState === 'FoulGiven';
    
    if (aIsFoul !== bIsFoul) {
      return aIsFoul ? 1 : -1;  // FoulGiven'ı sona koy
    }
    
    // Aynı tip olayları ID'ye göre sırala
    return a.id - b.id;
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