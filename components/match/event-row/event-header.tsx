import { Badge } from '@/components/ui/badge';
import { formatTimestamp } from '@/lib/utils';
import { getEventIcon } from '../event-icons';
import { getDisplayTitle } from '../utils/event-utils';
import { MatchEvent } from '../types/events';

interface EventHeaderProps {
  event: MatchEvent;
}

export function EventHeader({ event }: EventHeaderProps) {
  const displayTitle = getDisplayTitle(event.type, event.dangerState);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-[60%]">
        <span className="flex-shrink-0">
          {getEventIcon(event.type, event.dangerState)}
        </span>
        <span className="font-medium truncate">{displayTitle}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {event.isConfirmed && (
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            Confirmed
          </Badge>
        )}
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {formatTimestamp(event.timestamp)}
        </Badge>
      </div>
    </div>
  );
}