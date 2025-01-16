export interface MatchEvent {
  id: number;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team?: 'Home' | 'Away';
  isConfirmed: boolean;
  type: string;
  dangerState?: string;
  message?: string;
  playerId?: string | null;
  foulingTeam?: 'Home' | 'Away';
  varState?: 'Danger' | 'InProgress' | 'Safe';
  varReason?: string;
  varOutcome?: string;
  varReasonV2?: string;
  varOutcomeV2?: string;
  currentPhase?: string;
  addedMinutes?: number;
  bookingState?: 'YellowCardDanger' | 'RedCardDanger' | 'Safe';
}

export interface ProcessedMatchEvent {
  id: number;
  timestamp: string;
  phase: string;
  phaseDisplay?: string;
  timeElapsed: string;
  type: string;
  typeDisplay?: string;
  message?: string;
  team?: string;
  foulingTeam?: string;
  displaySide: 'left' | 'right' | 'center';
  dangerState?: string;
  dangerStateDisplay?: string;
  varState?: string;
  varStateDisplay?: string;
  varReason?: string;
  isConfirmed: boolean;
  category?: 'attack' | 'defense' | 'setpiece' | 'disciplinary' | 'system' | 'other';
}

export type EventCategory = 'attack' | 'defense' | 'setpiece' | 'disciplinary' | 'system' | 'other';
