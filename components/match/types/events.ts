export interface MatchEvent {
  id: number;
  type: string;
  timestamp: number;
  phase: string;
  timeElapsed: string;
  team?: string;
  message?: string;
  dangerState?: string;
  isConfirmed: boolean;
}

export interface DangerStateEvent extends MatchEvent {
  dangerState: string;
}

export type EventType = 
  | 'goals'
  | 'yellowCards'
  | 'redCards'
  | 'corners'
  | 'dangerStateChanges'
  | 'systemMessages';