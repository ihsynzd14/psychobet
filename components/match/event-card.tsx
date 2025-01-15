import { Badge } from '@/components/ui/badge';
import { formatTimestamp } from '@/lib/utils';
import { TimelineEvent } from './types';
import { getEventIcon } from './event-icons';

interface EventCardProps {
  event: TimelineEvent;
}

export function EventCard({ event }: EventCardProps) {
  const isSystemMessage = event.type.toLowerCase() === 'systemmessages';

  // Special styling for system messages
  if (isSystemMessage) {
    return (
      <div className="px-4 py-3 rounded-lg border bg-secondary/20 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{event.timeElapsed}</span>
          <span className="text-sm text-muted-foreground">{event.phase}</span>
        </div>
        <p className="text-sm font-medium">{event.message}</p>
      </div>
    );
  }

  // Regular event card styling
  const getEventStyle = (type: string, dangerState?: string) => {
    const baseStyles = 'rounded-lg border shadow-sm p-4';
    const stateStyles = {
      safe: 'bg-green-50/80 dark:bg-green-900/30 border-green-200 dark:border-green-800',
      dangerous: 'bg-red-50/80 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      attack: 'bg-orange-50/80 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
      default: 'bg-card/80 backdrop-blur-sm'
    };

    if (dangerState?.includes('Safe')) return `${baseStyles} ${stateStyles.safe}`;
    if (dangerState?.includes('Dangerous')) return `${baseStyles} ${stateStyles.dangerous}`;
    if (dangerState?.includes('Attack')) return `${baseStyles} ${stateStyles.attack}`;

    const typeStyles: Record<string, string> = {
      goal: stateStyles.safe,
      yellowcard: 'bg-yellow-50/80 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
      redcard: stateStyles.dangerous,
      phasechange: 'bg-purple-50/80 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
    };

    return `${baseStyles} ${typeStyles[type.toLowerCase()] || stateStyles.default}`;
  };

  const eventDate = new Date(event.timestamp);
  const formattedTime = eventDate.toLocaleTimeString();

  return (
    <div className={getEventStyle(event.type, event.dangerState)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getEventIcon(event.type, event.dangerState)}
          <span className="font-medium text-sm">
            {event.type}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formattedTime}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {event.team && (
            <Badge variant="secondary" className="text-xs">
              {event.team}
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground">
            {event.description}
          </p>
        )}
        
        {event.dangerState && (
          <p className="text-sm font-medium">
            {event.uiName || event.dangerState}
          </p>
        )}

        <div className="flex justify-end mt-2">
          {event.phase && (
            <Badge variant="outline" className="text-xs">
              {event.phase}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}