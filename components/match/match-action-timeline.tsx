import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { EventRow } from './event-row';
import { processMatchEvents } from './utils/event-processor';
import { useMemo } from 'react';

interface MatchActionTimelineProps {
  fixtureId: string;
  matchData: any;
}

export function MatchActionTimeline({ fixtureId, matchData }: MatchActionTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const events = useMemo(() => processMatchEvents(matchData), [matchData]);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  });

  return (
    <Card className="relative overflow-hidden">
      <div 
        ref={parentRef}
        className="h-[600px] overflow-auto overscroll-none scroll-smooth"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const event = events[virtualRow.index];
            return (
              <div
                key={`${event.type}-${event.id}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
                className={`
                  ${event.displaySide === 'center' ? 'bg-muted/5' :
                    event.displaySide === 'left' ? 'bg-primary/5' : 'bg-secondary/5'}
                  transition-colors hover:bg-accent/5
                `}
              >
                <EventRow event={event} />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}