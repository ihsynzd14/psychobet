export type DangerState = 'Safe' | 'Attack' | 'DangerousAttack' | 'FreeKick' | 'AttackingFreeKick' | 'DangerousFreeKick' | 'CornerDanger' | 'Penalty' | 'Corner' | 'Goal' | 'FoulGiven';

export type ThrowInState = 'Dangerous' | 'Attack' | 'Safe' | null;

export type BookingState = 'YellowCardDanger' | 'RedCardDanger' | 'Safe';

export type SystemMessageType = 'info' | 'warning' | 'error' | 'success';

export type Team = 'Home' | 'Away' | 'System';

export interface MatchEventDetails {
  // Common fields
  isConfirmed?: boolean;
  
  // Goal details
  isOwnGoal?: boolean;
  wasPenalty?: boolean;
  scoredBy?: Player | null;
  assistBy?: Player | null;

  // Card details
  player?: Player | null;

  // Substitution details
  playerOn?: Player | null;
  playerOff?: Player | null;

  // Shot details
  savedBy?: Player | null;

  // Danger state details
  dangerState?: DangerState;
  throwInState?: ThrowInState;
  
  ballReturnedToPlay?: boolean;
  
  // Booking state details
  bookingState?: BookingState;
  previousState?: BookingState;

  // System message details
  message?: string;
  messageId?: number;
  messageType?: SystemMessageType;
  status?: string;

  // Corner details
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

  // Penalty details
  outcome?: string;

  // VAR details
  state?: string;
  reason?: string;
  stateText?: string;
  stateColor?: string;
  originalReason?: string;
  originalOutcome?: string;
  isInProgress?: boolean;

  // Phase change details
  previousPhase?: string;
  currentPhase?: string;
  startTime?: string;
  phaseTitle?: string;

  // Stoppage time details
  addedMinutes?: number;
}

export interface MatchEvent {
  id: number;
  type: string;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team: Team;
  details: MatchEventDetails;
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

export interface LineupData {
  startingOnPitch: Player[];
  startingBench: Player[];
  formation: string | null;
}

export interface LineupUpdate {
  id: number;
  sequenceId: number;
  phase: string;
  timeElapsedInPhase: string;
  newLineup: LineupData;
  team: Team;
  isConfirmed: boolean;
  timestampUtc: string;
}

export interface TeamLineup {
  startingOnPitch: Player[];
  startingBench: Player[];
  formation: string | null;
} 