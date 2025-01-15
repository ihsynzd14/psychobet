import { TimelineEvent } from './types';

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

export function formatMatchTime(timeElapsed: string, phase: string): string {
  // Handle empty or invalid time
  if (!timeElapsed) return '00:00';

  // Parse the time elapsed
  const [hours, minutes, seconds] = timeElapsed.split(':').map(Number);
  
  // For second half, add 45 minutes
  if (phase === 'SecondHalf') {
    const totalMinutes = (hours * 60) + minutes + 45;
    return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // For first half, just return the original time without hours
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getKickoffDescription(team: string, phase: string): string {
  if (phase === 'FirstHalf') {
    return `Kick Off`;
  }
  if (phase === 'SecondHalf') {
    return `Kick Off`;
  }
  return `Kickoff by ${team} Team`;
}