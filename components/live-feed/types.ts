export type DangerState = 'Safe' | 'Attack' | 'DangerousAttack' | 'FreeKick' | 'AttackingFreeKick' | 'DangerousFreeKick' | 'CornerDanger' | 'Penalty' | 'Corner' | 'Goal' | 'FoulGiven';

export type ThrowInState = 'Dangerous Attack' | 'Attack' | 'Safe' | null;

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
  isCancelled?: boolean; // Add this line
  isGoalCancelled?: boolean; // Add this line for VAR goal cancellation

  // Phase change details
  previousPhase?: string;
  currentPhase?: string;
  startTime?: string;
  phaseTitle?: string;

  // Stoppage time details
  addedMinutes?: number;

  // Clock action details
  activityType?: string;
  isClockRunning?: boolean;

  // Reliability details
  isReliable?: boolean;
  reliabilityReasons?: {
    Heartbeat?: string;
    FeedReliability?: string;
    Coverage?: string;
  } | null;

  // Extra time calculation fields
  extraTimeCalculation?: {
    type: 'substitution' | 'injury' | 'var' | 'incident' | 'redCard';
    duration?: number; // in seconds
    startTime?: string; // timestamp when stoppage started
    endTime?: string; // timestamp when play resumed
    calculatedTime?: number; // calculated extra time in seconds
  };
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
  competitionName: string;
  matchName: string;
  startDateUtc: string;
  venueName?: string;
  roundName?: string;
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

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface TeamStrip {
  color1: Color | null;
  color2: Color | null;
}

// Extra Time Calculation Types
export interface ExtraTimeCalculation {
  firstHalf: {
    substitutions: number;
    injuries: number;
    varChecks: number;
    incidents: number;
    redCards: number;
    total: number;
  };
  secondHalf: {
    substitutions: number;
    injuries: number;
    varChecks: number;
    incidents: number;
    redCards: number;
    total: number;
  };
  history: ExtraTimeEvent[];
}

export interface ExtraTimeEvent {
  id: string;
  type: 'substitution' | 'injury' | 'var' | 'incident' | 'redCard';
  phase: 'FirstHalf' | 'SecondHalf';
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  description: string;
  timestamp: string;
} 