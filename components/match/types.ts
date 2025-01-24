export interface TimelineEvent {
  id: number;
  type: string;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team?: string;
  isConfirmed: boolean;
  dangerState?: string;
  description?: string;
  message?: string;
  previousPhase?: string;
  currentPhase?: string;
}

export interface MatchData {
  actions: {
    goals: TimelineEvent[];
    yellowCards: TimelineEvent[];
    redCards: TimelineEvent[];
    corners: TimelineEvent[];
    throwIns: TimelineEvent[];
    substitutions: TimelineEvent[];
    offsides: TimelineEvent[];
    goalKicks: TimelineEvent[];
    dangerStateChanges: TimelineEvent[];
    systemMessages: TimelineEvent[];
    phaseChanges: TimelineEvent[];
    shotsOnTarget: TimelineEvent[];
    shotsOffTarget: TimelineEvent[];
    blockedShots: TimelineEvent[];
    clockActions: TimelineEvent[];
  };
}