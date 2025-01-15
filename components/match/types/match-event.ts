export interface MatchEvent {
  id: number;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team?: 'Home' | 'Away';
  isConfirmed: boolean;
  type: string;
  dangerState?: string;
  uiName?: string;
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
  bookingState?: 'YellowCardDanger' | 'RedCardDanger' | 'Safe' ; // Added this property
}
export interface ProcessedMatchEvent extends MatchEvent {
  displaySide: 'left' | 'right' | 'center';
  category: 'attack' | 'defense' | 'setpiece' | 'disciplinary' | 'system' | 'other';
  addedMinutes?: number;
}

export type EventCategory = ProcessedMatchEvent['category'];
