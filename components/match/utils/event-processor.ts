import { MatchEvent, ProcessedMatchEvent } from '../types/match-event';

const RELEVANT_EVENT_TYPES = [
  'goals', 'yellowCards', 'redCards', 'corners', 'dangerStateChanges',
  'systemMessages', 'phaseChanges', 'shotsOnTarget', 'shotsOffTarget',
  'blockedShots', 'fouls', 'throwIns', 'substitutions', 'goalKicks',
  'varStateChanges', 'offsides', 'stoppageTimeAnnouncements'
] as const;

export function determineEventCategory(event: MatchEvent): ProcessedMatchEvent['category'] {
  if (event.type === 'systemMessages') return 'system';
  if (event.type === 'dangerStateChanges') return 'attack';
  if (event.type === 'varStateChanges') return 'system';
  if (event.type === 'stoppageTimeAnnouncements') return 'system';
  if (event.type === 'offsides') return 'attack';
  if (['yellowCards', 'redCards'].includes(event.type)) return 'disciplinary';
  if (['corners', 'throwIns'].includes(event.type)) return 'setpiece';
  if (['goals', 'shotsOnTarget', 'shotsOffTarget'].includes(event.type)) return 'attack';
  return 'other';
}

export function determineDisplaySide(event: MatchEvent): 'left' | 'right' | 'center' {
  // Handle stoppage time announcements
  if (event.type === 'stoppageTimeAnnouncements') {
    return 'center';
  }

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

  // Handle events with team property (including offsides)
  if (event.team) {
    return event.team === 'Home' ? 'left' : 'right';
  }

  // Handle danger states - skip if in HalfTime
  if (event.dangerState && event.phase !== 'HalfTime') {
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
        // Skip danger states during HalfTime
        if (type === 'dangerStateChanges' && event.phase === 'HalfTime') {
          return;
        }

        // Extract addedMinutes from stoppageTimeAnnouncements
        const addedMinutes = type === 'stoppageTimeAnnouncements' 
          ? (event as any).addedMinutes 
          : undefined;

        allEvents.push({
          ...event,
          type,
          displaySide: determineDisplaySide(event),
          category: determineEventCategory(event),
          addedMinutes // Include addedMinutes in the processed event
        });
      });
    }
  });

  return allEvents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}