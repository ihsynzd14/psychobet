export type DangerState = 'Safe' | 'Attack' | 'DangerousAttack' | 'FreeKick' | 'AttackingFreeKick' | 'DangerousFreeKick' | 'CornerDanger' | 'Penalty' | 'Corner' | 'Goal';

export type ThrowInState = 'Dangerous' | 'Attack' | 'Safe' | null;

export type BookingState = 'YellowCardDanger' | 'RedCardDanger' | 'Safe';

export type SystemMessageType = 'info' | 'warning' | 'error' | 'success';

export interface MatchEvent {
  id: number;
  type: string;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team: 'Home' | 'Away' | 'System';
  details: {
    dangerState?: DangerState;
    throwInState?: ThrowInState;
    bookingState?: BookingState;
    previousState?: BookingState;
    isConfirmed?: boolean;
    isOwnGoal?: boolean;
    wasPenalty?: boolean;
    scoredBy?: number;
    assistBy?: number;
    playerId?: number;
    playerOn?: number;
    playerOff?: number;
    savedBy?: number;
    outcome?: string;
    reason?: string;
    state?: string;
    message?: string;
    messageId?: number;
    messageType?: SystemMessageType;
    addedMinutes?: number;
    previousPhase?: string;
    currentPhase?: string;
    startTime?: string;
    phaseTitle?: string;
    status?: string;
    cornerData?: {
      awarded?: {
        isConfirmed: boolean;
        timestampUtc: string;
        timeElapsedInPhase: string;
      };
      taken?: {
        isConfirmed: boolean;
        timestampUtc: string;
        timeElapsedInPhase: string;
      };
    };
  };
}

export interface LiveFeedPageProps {
  fixtureId: string;
}

export interface Player {
  internalId: string;
  sourceId: string;
  sourceName: string;
  position: string | null;
  shirtNumber: number;
  playerPosition: string;
}

export interface TeamLineup {
  startingOnPitch: Player[];
  startingBench: Player[];
  formation: string | null;
} 