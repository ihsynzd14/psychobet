export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const getEventColor = (type: string): string => {
  switch (type) {
    case 'systemMessage':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'goal':
      return 'bg-green-100 dark:bg-green-900';
    case 'yellowCard':
    case 'bookingState':
      return 'bg-yellow-100 dark:bg-yellow-900';
    case 'redCard':
    case 'secondYellow':
      return 'bg-red-100 dark:bg-red-900';
    case 'substitution':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'shotOnTarget':
    case 'shotOffTarget':
    case 'shotBlocked':
      return 'bg-purple-100 dark:bg-purple-900';
    case 'cornerAwarded':
    case 'cornerTaken':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'penalty':
      return 'bg-red-100 dark:bg-red-900';
    case 'foul':
      return 'bg-yellow-100 dark:bg-yellow-900';
    case 'var':
      return 'bg-purple-100 dark:bg-purple-900';
    case 'phaseChange':
      return 'bg-green-100 dark:bg-green-900';
    case 'freeKick':
      return 'bg-yellow-100 dark:bg-yellow-900';
    case 'dangerState':
      return 'bg-red-100 dark:bg-red-900';
    case 'throwIn':
    case 'goalKick':
    case 'offside':
    case 'kickOff':
      return 'bg-blue-100 dark:bg-blue-900';
    default:
      return 'bg-gray-100 dark:bg-gray-900';
  }
}; 