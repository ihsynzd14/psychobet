export type DangerState = 
  | 'HomeSafe'
  | 'HomeAttack'
  | 'HomeDangerousAttack'
  | 'HomeFreeKick'
  | 'AwaySafe'
  | 'AwayAttack'
  | 'AwayDangerousAttack'
  | 'AwayFreeKick'
  | 'Safe'
  | 'Attack'
  | 'DangerousAttack'
  | 'Penalty'
  | 'CornerDanger'
  | 'HomeCornerDanger'
  | 'AwayCornerDanger'
  | 'AttackingFreeKick'
  | 'DangerousFreeKick'
  | 'FreeKick';

export type ThrowInState =
  | null
  | 'Safe'
  | 'Attack'
  | 'Dangerous';

export type BookingState =
  | 'Safe'
  | 'YellowCardDanger'
  | 'RedCardDanger';

export type SystemMessageType =
  | 'info'
  | 'warning'
  | 'error'
  | 'success';

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
    isConfirmed?: boolean;
    isOwnGoal?: boolean;
    wasPenalty?: boolean;
    scoredBy?: string;
    assistBy?: string;
    playerId?: string;
    playerOn?: string;
    playerOff?: string;
    savedBy?: string;
    status?: string;
    outcome?: string;
    fouledPlayer?: string;
    fouledBy?: string;
    state?: string;
    reason?: string;
    previousPhase?: string;
    currentPhase?: string;
    startTime?: string;
    message?: string;
    messageType?: SystemMessageType;
    messageId?: number;
    addedMinutes?: number;
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
    phaseTitle?: string;
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