import { memo } from 'react';
import { EventHeader } from './event-row/event-header';
import { EventMetadata } from './event-row/event-metadata';
import { EventMessage } from './event-row/event-message';
import { MatchEvent } from './types/events';
import { getEventColor } from './utils/event-utils';

interface EventRowProps {
  event: MatchEvent;
}

export const EventRow = memo(function EventRow({ event }: EventRowProps) {
  return (
    <div 
      className={`min-h-[80px] p-4 border-b ${getEventColor(event.type, event.dangerState)}`}
    >
      <EventHeader event={event} />
      <EventMetadata event={event} />
      {event.message && <EventMessage message={event.message} />}
    </div>
  );
});