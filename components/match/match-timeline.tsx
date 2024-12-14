import { ScrollArea } from '@/components/ui/scroll-area';
import { TimelineEvent } from './types';
import { EventCard } from './event-card';
import { combineMatchEvents, sortEventsByTimestamp } from './utils';

interface MatchTimelineProps {
  matchData: any;
}

export function MatchTimeline({ matchData }: MatchTimelineProps) {
  const allEvents = combineMatchEvents(matchData);
  const sortedEvents = sortEventsByTimestamp(allEvents);

  const getEventPosition = (event: TimelineEvent): 'left' | 'right' | 'center' => {
    if (event.type === 'systemmessages' || event.type === 'phaseChange') {
      return 'center';
    }
    return event.team === 'Home' ? 'left' : 'right';
  };

  const containerClasses = {
    left: 'col-start-1 col-end-6 mr-auto',
    center: 'col-start-3 col-end-9',
    right: 'col-start-6 col-end-11 ml-auto'
  };

  return (
    <ScrollArea className="h-[600px] w-full pr-4">
      <div className="grid grid-cols-10 gap-4 relative px-4">
        {/* Center line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />
        
        {sortedEvents.map((event) => {
          const position = getEventPosition(event);
          
          return (
            <div 
              key={`${event.type}-${event.id}`}
              className={`${containerClasses[position]} mb-6`}
            >
              <EventCard event={event} />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}