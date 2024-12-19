import { Badge } from '@/components/ui/badge';
import { MatchEvent } from '../types/events';

interface EventMetadataProps {
  event: MatchEvent;
}

export function EventMetadata({ event }: EventMetadataProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {event.phase && (
        <Badge variant="secondary" className="text-xs whitespace-nowrap">
          {event.phase}
        </Badge>
      )}
      {event.timeElapsed && (
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {event.timeElapsed}
        </Badge>
      )}
      {event.team && (
        <Badge className="text-xs bg-primary/10 text-primary whitespace-nowrap">
          {event.team}
        </Badge>
      )}
    </div>
  );
}