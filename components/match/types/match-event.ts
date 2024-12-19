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
  }
  
  export interface ProcessedMatchEvent extends MatchEvent {
    displaySide: 'left' | 'right' | 'center';
    category: 'attack' | 'defense' | 'setpiece' | 'disciplinary' | 'system' | 'other';
  }
  
  export type EventCategory = ProcessedMatchEvent['category'];