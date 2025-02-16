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
    const events: MatchEvent[] = [];
    dangers?.forEach((danger) => {
      const team = danger.dangerState.startsWith('Away') ? 'Away' : danger.dangerState.startsWith('Home') ? 'Home' : null;
      if (team) {
        const rawState = danger.dangerState.replace(team, '');
        if (rawState !== 'Corner') {
          const baseState = rawState as DangerState;
          
          events.push({
            id: danger.id,
            type: 'dangerState',
            timestamp: danger.timestampUtc,
            phase: danger.phase,
            timeElapsed: danger.timeElapsedInPhase,
            team: team,
            details: {
              dangerState: baseState,
              isConfirmed: danger.isConfirmed
            }
          });
        }
      }
    });
    return events;
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

  shotsOffWoodwork: (events: any[]): MatchEvent[] => {
    return events?.map((event) => ({
      id: event.id,
      type: 'shotOffWoodwork',
      timestamp: event.timestampUtc,
      phase: event.phase,
      timeElapsed: event.timeElapsedInPhase,
      team: event.team,
      details: { playerId: event.playerInternalId }
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

  // Process goals
  if (actions.goals?.goals) {
    newEvents.push(...eventProcessors.goals(actions.goals.goals));
  }

  // Process yellow cards
  if (actions.yellowCards?.matchActions) {
    newEvents.push(...eventProcessors.yellowCards(actions.yellowCards.matchActions));
  }

  // Process second yellow cards
  if (actions.secondYellowCards?.matchActions) {
    newEvents.push(...eventProcessors.secondYellowCards(actions.secondYellowCards.matchActions));
  }

  // Process straight red cards
  if (actions.straightRedCards?.matchActions) {
    newEvents.push(...eventProcessors.straightRedCards(actions.straightRedCards.matchActions));
  }

  // Process substitutions
  if (actions.substitutions?.substitutions) {
    newEvents.push(...eventProcessors.substitutions(actions.substitutions.substitutions));
  }

  // Process shots on target
  if (actions.shotsOnTarget?.shotsOnTarget) {
    newEvents.push(...eventProcessors.shotsOnTarget(actions.shotsOnTarget.shotsOnTarget));
  }

  // Process shots off target
  if (actions.shotsOffTarget?.matchActions) {
    newEvents.push(...eventProcessors.shotsOffTarget(actions.shotsOffTarget.matchActions));
  }

  // Process blocked shots
  if (actions.blockedShots?.matchActions) {
    newEvents.push(...eventProcessors.blockedShots(actions.blockedShots.matchActions));
  }

  // Process corners
  if (actions.cornersV2?.corners) {
    newEvents.push(...eventProcessors.corners(actions.cornersV2.corners));
  }

  // Process penalties
  if (actions.penalties?.penalties) {
    newEvents.push(...eventProcessors.penalties(actions.penalties.penalties));
  }

  // Process VAR state changes
  if (actions.varStateChanges?.varStateChanges) {
    newEvents.push(...eventProcessors.varStateChanges(actions.varStateChanges.varStateChanges));
  }

  // Process phase changes
  if (actions.phaseChanges?.phaseChanges) {
    newEvents.push(...eventProcessors.phaseChanges(actions.phaseChanges.phaseChanges));
  }

  // Process danger state changes
  if (actions.dangerStateChanges?.dangerStateChanges) {
    newEvents.push(...eventProcessors.dangerStateChanges(actions.dangerStateChanges.dangerStateChanges));
  }

  // Process booking state changes
  if (actions.bookingStateChanges?.bookingStateChanges) {
    newEvents.push(...eventProcessors.bookingStateChanges(actions.bookingStateChanges.bookingStateChanges, actions));
  }

  // Process system messages
  if (actions.systemMessages?.systemMessages) {
    newEvents.push(...eventProcessors.systemMessages(actions.systemMessages.systemMessages));
  }

  // Process throw-ins
  if (actions.throwIns?.matchActions) {
    newEvents.push(...eventProcessors.throwIns(actions.throwIns.matchActions, actions));
  }

  // Process shots off woodwork
  if (actions.shotsOffWoodwork?.matchActions) {
    newEvents.push(...eventProcessors.shotsOffWoodwork(actions.shotsOffWoodwork.matchActions));
  }

  // Process goal kicks
  if (actions.goalKicks?.matchActions) {
    newEvents.push(...eventProcessors.goalKicks(actions.goalKicks.matchActions));
  }

  // Process offsides
  if (actions.offsides?.matchActions) {
    newEvents.push(...eventProcessors.offsides(actions.offsides.matchActions));
  }

  // Process kick-offs
  if (actions.kickOffs?.matchActions) {
    newEvents.push(...eventProcessors.kickOffs(actions.kickOffs.matchActions));
  }

  // Process stoppage time announcements
  if (actions.stoppageTimeAnnouncements?.stoppageTimeAnnouncements) {
    newEvents.push(...eventProcessors.stoppageTimeAnnouncements(actions.stoppageTimeAnnouncements.stoppageTimeAnnouncements));
  }

  return newEvents;
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