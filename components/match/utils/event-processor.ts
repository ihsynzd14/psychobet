import { MatchEvent, ProcessedMatchEvent } from '../types/match-event';

const RELEVANT_EVENT_TYPES = [
  'goals', 'yellowCards', 'redCards', 'corners', 'dangerStateChanges',
  'systemMessages', 'phaseChanges', 'shotsOnTarget', 'shotsOffTarget',
  'blockedShots', 'fouls', 'throwIns', 'substitutions', 'goalKicks',
  'varStateChanges' // Added varStateChanges
] as const;

export function determineEventCategory(event: MatchEvent): ProcessedMatchEvent['category'] {
  if (event.type === 'systemMessages') return 'system';
  if (event.type === 'dangerStateChanges') return 'attack';
  if (event.type === 'varStateChanges') return 'system'; // Add this line
  if (['yellowCards', 'redCards'].includes(event.type)) return 'disciplinary';
  if (['corners', 'throwIns'].includes(event.type)) return 'setpiece';
  if (['goals', 'shotsOnTarget', 'shotsOffTarget'].includes(event.type)) return 'attack';
  return 'other';
}

export function determineDisplaySide(event: MatchEvent): 'left' | 'right' | 'center' {
  if (event.type === 'systemMessages') return 'center';
  if (event.type === 'phaseChanges') return 'center';
  
  // Handle VAR state changes
  if (event.type === 'varStateChanges') {
    if (event.varReason === 'Unknown') return 'center';
    if (event.varReason?.startsWith('Home')) return 'left';
    if (event.varReason?.startsWith('Away')) return 'right';
    return 'center';
  }

  // Handle events with foulingTeam property
  if ('foulingTeam' in event) {
    return event.foulingTeam === 'Home' ? 'left' : 'right';
  }

  // Handle events with team property
  if (event.team) {
    return event.team === 'Home' ? 'left' : 'right';
  }

  // Handle danger states
  if (event.dangerState) {
    if (event.dangerState.startsWith('Home')) return 'left';
    if (event.dangerState.startsWith('Away')) return 'right';
  }

  return 'center';
}


export function processMatchEvents(matchData: any): ProcessedMatchEvent[] {
  const allEvents: ProcessedMatchEvent[] = [];
  const actions = matchData?.actions || {};

  RELEVANT_EVENT_TYPES.forEach(type => {
    if (Array.isArray(actions[type])) {
      actions[type].forEach((event: MatchEvent) => {
        allEvents.push({
          ...event,
          type,
          displaySide: determineDisplaySide(event),
          category: determineEventCategory(event)
        });
      });
    }
  });

  return allEvents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}