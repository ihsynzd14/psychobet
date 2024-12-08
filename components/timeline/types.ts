export interface TimelineEvent {
  type: string;
  id: number;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team?: string;
  isConfirmed: boolean;
  dangerState?: string;
  systemMessage?: string;
}