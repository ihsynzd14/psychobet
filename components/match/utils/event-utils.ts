import { MatchEvent, EventType } from '../types/events';

export const formatDangerState = (dangerState: string): string => {
  if (!dangerState) return '';
  return dangerState
    .replace(/(Home|Away)/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

export const getDisplayTitle = (type: string, dangerState?: string): string => {
  if (type === 'throwIns') return 'Throw In';
  if (type === 'dangerStateChanges') return formatDangerState(dangerState || '');
  return type;
};

export const getEventColor = (type: string, dangerState?: string): string => {
  const baseColors = {
    safe: 'bg-green-50 dark:bg-green-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20',
    attack: 'bg-orange-50 dark:bg-orange-900/20',
    goal: 'bg-yellow-50 dark:bg-yellow-900/20',
    default: 'bg-background'
  };

  if (dangerState?.includes('Safe')) return baseColors.safe;
  if (dangerState?.includes('Dangerous')) return baseColors.danger;
  if (dangerState?.includes('Attack')) return baseColors.attack;
  if (type.toLowerCase().includes('goal')) return baseColors.goal;
  
  return baseColors.default;
};

export const processEvents = (matchData: any): MatchEvent[] => {
  const allEvents: MatchEvent[] = [];
  const actions = matchData?.actions || {};

  Object.entries(actions).forEach(([type, events]: [string, any]) => {
    if (Array.isArray(events)) {
      events.forEach(event => {
        allEvents.push({
          ...event,
          type: type === 'throwIns' ? 'throwIns' : type,
          timestamp: new Date(event.timestamp).getTime()
        });
      });
    }
  });

  return allEvents.sort((a, b) => b.timestamp - a.timestamp);
};