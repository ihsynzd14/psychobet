import { useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { usePoll } from '@/hooks/use-poll';
import { api } from '@/lib/api';
import { EventRow } from './event-row';
import { processEvents } from './utils/event-utils';
import type { MatchEvent } from './types/events';

interface MatchActionTimelineProps {
  fixtureId: any;
  matchData: any;
}

export function MatchActionTimeline({ fixtureId, matchData }: MatchActionTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Process and memoize events
  const events = useMemo(() => processEvents(matchData), [matchData]);

  // Compare function for data updates
  const compareEvents = useCallback((prev: MatchEvent[] | null, next: MatchEvent[]) => {
    if (!prev) return true;
    if (prev.length !== next.length) return true;
    return prev[0]?.id !== next[0]?.id;
  }, []);

  // Real-time polling with optimizations
  const { data: liveEvents } = usePoll({
    queryFn: () => api.getFeedView(fixtureId),
    enabled: true,
    baseDelay: 1000,
    minDelay: 500,
    maxDelay: 2000,
    compareData: compareEvents,
    adaptivePolling: true
  });

  // Virtualized list setup
  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 100, []),
    overscan: 5,
    scrollPaddingStart: 8,
    scrollPaddingEnd: 8
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
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={events[virtualRow.index].id}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <EventRow event={events[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}