import { TimelineEvent } from './types';

export const cleanEventName = (eventName: string): string => {
  // Remove Home/Away prefix
  const withoutTeam = eventName.replace(/(Home|Away)/, '').trim();
  
  // Add spaces before capital letters
  return withoutTeam.replace(/([A-Z])/g, ' $1').trim();
};

export const sortEventsByTimestamp = (events: TimelineEvent[]): TimelineEvent[] => {
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const combineMatchEvents = (matchData: any): TimelineEvent[] => {
  const eventMappings = [
    { key: 'goals', type: 'goal' },
    { key: 'yellowCards', type: 'yellowCard' },
    { key: 'redCards', type: 'redCard' },
    { key: 'corners', type: 'corner' },
    { key: 'fouls', type: 'foul', teamKey: 'foulingTeam' },
    { key: 'throwIns', type: 'throwIn' },
    { key: 'substitutions', type: 'substitution' },
    { key: 'offsides', type: 'offside' },
    { key: 'goalKicks', type: 'goalKick' },
    { key: 'dangerStateChanges', type: 'Danger State Change' },
    { key: 'systemMessages', type: 'systemmessages' },
    { key: 'phaseChanges', type: 'phaseChange' },
    { key: 'shotsOnTarget', type: 'shotOnTarget' },
    { key: 'shotsOffTarget', type: 'shotOffTarget' },
    { key: 'blockedShots', type: 'blockedShot' },
    { key: 'clockActions', type: 'clockAction' }
  ];

  return eventMappings.reduce((acc: TimelineEvent[], mapping) => {
    const events = matchData?.actions?.[mapping.key] || [];
    return [...acc, ...events.map((e: any) => ({
      ...e,
      type: mapping.type,
      team: mapping.teamKey ? e[mapping.teamKey] : e.team
    }))];
  }, []);
};