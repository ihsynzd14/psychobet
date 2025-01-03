import { MatchEvent, ProcessedMatchEvent } from '../types/match-event';
import { getKickoffDescription } from '../utils';

const RELEVANT_EVENT_TYPES = [
  'goals', 'yellowCards', 'redCards', 'corners', 'dangerStateChanges',
  'systemMessages', 'phaseChanges', 'shotsOnTarget', 'shotsOffTarget',
  'blockedShots', 'fouls', 'throwIns', 'substitutions', 'goalKicks',
  'varStateChanges', 'offsides', 'stoppageTimeAnnouncements', 'kickOffs',
  'bookingStateChanges' // Add this line
] as const;

export function determineEventCategory(event: MatchEvent): ProcessedMatchEvent['category'] {
  if (event.type === 'kickOffs') return 'system';
  if (event.type === 'systemMessages') return 'system';
  if (event.type === 'dangerStateChanges') return 'attack';
  if (event.type === 'varStateChanges') return 'system';
  if (event.type === 'stoppageTimeAnnouncements') return 'system';
  if (event.type === 'bookingStateChanges') return 'disciplinary'; // Add this line
  if (event.type === 'offsides') return 'attack';
  if (['yellowCards', 'redCards'].includes(event.type)) return 'disciplinary';
  if (['corners', 'throwIns'].includes(event.type)) return 'setpiece';
  if (['goals', 'shotsOnTarget', 'shotsOffTarget'].includes(event.type)) return 'attack';
  return 'other';
}

export function determineDisplaySide(event: MatchEvent): 'left' | 'right' | 'center' {
  if (['kickOffs', 'stoppageTimeAnnouncements', 'systemMessages', 'phaseChanges', 'bookingStateChanges'].includes(event.type)) {
    return 'center';
  }
  
  if (event.type === 'varStateChanges') {
    if (event.varReason === 'Unknown') return 'center';
    if (event.varReason?.startsWith('Home')) return 'left';
    if (event.varReason?.startsWith('Away')) return 'right';
    return 'center';
  }

  if ('foulingTeam' in event) {
    return event.foulingTeam === 'Home' ? 'left' : 'right';
  }

  if (event.team) {
    return event.team === 'Home' ? 'left' : 'right';
  }

  if (event.dangerState && !['HalfTime', 'FullTimeNormalTime'].includes(event.phase)) {
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
        if (type === 'dangerStateChanges' && ['HalfTime', 'FullTimeNormalTime'].includes(event.phase)) {
          return;
        }

        const addedMinutes = type === 'stoppageTimeAnnouncements' 
          ? (event as any).addedMinutes 
          : undefined;

        // Add description for kickoffs
        const message = type === 'kickOffs' 
          ? getKickoffDescription(event.team || '', event.phase)
          : event.message;

        allEvents.push({
          ...event,
          type,
          message,
          displaySide: determineDisplaySide(event),
          category: determineEventCategory(event),
          addedMinutes
        });
      });
    }
  });

  return allEvents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}