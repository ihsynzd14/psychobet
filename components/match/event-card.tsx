import { Badge } from '@/components/ui/badge';
import { formatTimestamp } from '@/lib/utils';
import { TimelineEvent } from './types';
import { getEventIcon } from './event-icons';
import { cleanEventName } from './utils';

interface EventCardProps {
  event: TimelineEvent;
}

export function EventCard({ event }: EventCardProps) {
  const isSystemMessage = event.type.toLowerCase() === 'systemmessages';

  // Special styling for system messages
  if (isSystemMessage) {
    return (
      <div className="px-4 py-3 rounded-lg border bg-secondary/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{event.timeElapsed}</span>
            <span>•</span>
            <span>{event.phase}</span>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium">{event.message}</p>
      </div>
    );
  }

  // Regular event card styling
  const getEventStyle = (type: string, dangerState?: string) => {
    const baseStyles = 'rounded-lg border shadow-sm p-4 transition-colors';
    const stateStyles = {
      safe: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      dangerous: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      attack: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      default: 'bg-card'
    };

    if (dangerState?.includes('Safe')) return `${baseStyles} ${stateStyles.safe}`;
    if (dangerState?.includes('Dangerous')) return `${baseStyles} ${stateStyles.dangerous}`;
    if (dangerState?.includes('Attack')) return `${baseStyles} ${stateStyles.attack}`;

    const typeStyles: Record<string, string> = {
      goal: stateStyles.safe,
      yellowcard: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      redcard: stateStyles.dangerous,
      phasechange: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    };

    return `${baseStyles} ${typeStyles[type.toLowerCase()] || stateStyles.default}`;
  };

  const eventDate = new Date(event.timestamp);
  const formattedDate = eventDate.toLocaleDateString();
  const formattedTime = eventDate.toLocaleTimeString();

  return (
    <div className={getEventStyle(event.type, event.dangerState)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getEventIcon(event.type, event.dangerState)}
          <span className="font-semibold text-sm">
            {cleanEventName(event.type)}
          </span>
        </div>
        {event.isConfirmed && (
          <Badge variant="outline" className="text-xs">
            Confirmed
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          <span>{formattedTime}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {event.phase && (
            <Badge variant="outline" className="text-xs">
              {event.phase}
            </Badge>
          )}
          {event.timeElapsed && (
            <Badge variant="secondary" className="text-xs">
              {event.timeElapsed}
            </Badge>
          )}
          {event.team && (
            <Badge variant="secondary" className="text-xs">
              {event.team}
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {event.description}
          </p>
        )}
        
        {event.dangerState && (
          <p className="text-sm font-medium">
            {cleanEventName(event.dangerState)}
          </p>
        )}
      </div>
    </div>
  );
}