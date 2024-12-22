import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { EventRow } from './event-row';
import { processMatchEvents } from './utils/event-processor';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ProcessedMatchEvent } from './types/match-event';

interface MatchActionTimelineProps {
  fixtureId: any;
  matchData: any;
}

const varStateMap: Record<string, string> = {
  'Danger': 'VAR Check Started',
  'InProgress': 'VAR Review in Progress',
  'Safe': 'VAR Check Complete'
};

export function MatchActionTimeline({ fixtureId, matchData }: MatchActionTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const events = useMemo(() => processMatchEvents(matchData), [matchData]);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  });

  const getEventDescription = (event: ProcessedMatchEvent) => {
    if (event.displaySide === 'center') {
      if (event.type === 'systemMessages') {
        return {
          title: event.message || 'System Message',
          description: 'System Update'
        };
      }
      if (event.type === 'phaseChanges') {
        return {
          title: event.currentPhase || 'Phase Change',
          description: 'Period Change'
        };
      }
      if (event.type === 'varStateChanges' && event.varState) {
        const getVarDescription = (event: ProcessedMatchEvent) => {
          if (event.varReason === 'NotSet') return event.varOutcome || 'VAR Check';
          return `${event.varReason} Check`;
        };
  
        return {
          title: varStateMap[event.varState] || event.varState,
          description: getVarDescription(event)
        };
      }
    }
    return null;
  };
    
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
            const centerEventDetails = getEventDescription(event);
            
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
                className={cn(
                  event.displaySide === 'center' 
                    ? 'bg-transparent text-center' 
                    : event.displaySide === 'left' 
                      ? 'bg-primary/5' 
                      : 'bg-secondary/5',
                  'transition-colors hover:bg-accent/5'
                )}
              >
                <EventRow 
                  event={event} 
                  centerEventDetails={centerEventDetails}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}