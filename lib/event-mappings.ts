import { ProcessedMatchEvent } from '@/components/match/types/match-event';

// Optimize event name lookup with a WeakMap for better memory management
const EVENT_UI_NAMES = new Map<string, string>([
  // Match Status
  ['dangerStateChanges', 'Game Situation'],
  ['throwIns', 'Throw In'],
  ['corners', 'Corner'],
  ['goals', 'Goal'],
  ['yellowCards', 'Yellow Card'],
  ['redCards', 'Red Card'],
  ['substitutions', 'Substitution'],
  ['shotsOnTarget', 'Shot on Target'],
  ['shotsOffTarget', 'Shot off Target'],
  ['shotsOffWoodwork', 'Shot off Woodwork'],
  ['blockedShots', 'Blocked Shot'],
  ['fouls', 'Foul'],
  ['offsides', 'Offside'],
  ['goalKicks', 'Goal Kick'],
  ['penaltiesAwarded', 'Penalty Awarded'],
  ['missedPenalties', 'Missed Penalty'],
  ['savedPenalties', 'Saved Penalty'],
  ['systemMessages', 'System Message'],
  ['phaseChanges', 'Phase Change'],
  ['clockActions', 'Time Action'],
  ['stoppageTimeAnnouncements', 'Added Time'],
  ['kickOffs', 'Kick Off'],
  ['varStateChanges', 'VAR Review'],
  ['bookingStateChanges', 'Booking Status'],
  
  // Danger States
  ['Safe', 'Normal Play'],
  ['HomeDangerousAttack', 'Home Dangerous Attack'],
  ['AwayDangerousAttack', 'Away Dangerous Attack'],
  ['HomeSafe', 'Home Possession'],
  ['AwaySafe', 'Away Possession'],
  ['HomeAttack', 'Home Attack'],
  ['AwayAttack', 'Away Attack'],
  ['HomeDangerousFreeKick', 'Home Dangerous Free Kick'],
  ['AwayDangerousFreeKick', 'Away Dangerous Free Kick'],
  ['HomeFreeKick', 'Home Free Kick'],
  ['AwayFreeKick', 'Away Free Kick'],
  
  // VAR States
  ['Danger', 'VAR Check'],
  ['InProgress', 'VAR in Progress'],
  
  // Match Phases
  ['FirstHalf', 'First Half'],
  ['SecondHalf', 'Second Half'],
  ['HalfTime', 'Half Time'],
  ['PreMatch', 'Pre Match'],
  ['FullTimeNormalTime', 'Full Time']
]);

// Optimize cache with WeakMap for better garbage collection
const eventNameCache = new WeakMap<ProcessedMatchEvent, string>();

export function getEventUIName(event: ProcessedMatchEvent): string {
  // Try to get from cache first
  const cachedName = eventNameCache.get(event);
  if (cachedName) return cachedName;

  let result: string;

  // Optimized name resolution with Map lookup
  if (event.type === 'varStateChanges' && event.varState && event.varReason) {
    const stateUI = EVENT_UI_NAMES.get(event.varState) || event.varState;
    const reasonUI = EVENT_UI_NAMES.get(event.varReason) || event.varReason;
    result = `${stateUI} - ${reasonUI}`;
  } else if (event.type === 'dangerStateChanges' && event.dangerState) {
    result = EVENT_UI_NAMES.get(event.dangerState) || event.dangerState;
  } else if (event.type === 'phaseChanges' && event.currentPhase) {
    result = EVENT_UI_NAMES.get(event.currentPhase) || event.currentPhase;
  } else {
    result = EVENT_UI_NAMES.get(event.type) || event.type;
  }

  // Cache the result
  eventNameCache.set(event, result);
  return result;
}

// Optimize display check
export function shouldDisplayEvent(event: ProcessedMatchEvent): boolean {
  return true; // Can be extended with more complex logic if needed
}