import { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { EventRow } from './event-row';
import { processMatchEvents } from './utils/event-processor';
import { cn } from '@/lib/utils';
import { ProcessedMatchEvent } from './types/match-event';
import { EventSettingsSheet } from './event-settings-sheet';

interface MatchActionTimelineProps {
  fixtureId: any;
  matchData: any;
}

const EVENT_TYPES = [
  { id: 'goals', label: 'Goals' },
  { id: 'yellowCards', label: 'Yellow Cards' },
  { id: 'redCards', label: 'Red Cards' },
  { id: 'corners', label: 'Corners' },
  { id: 'dangerStateChanges', label: 'Danger States' },
  { id: 'systemMessages', label: 'System Messages' },
  { id: 'phaseChanges', label: 'Phase Changes' },
  { id: 'shotsOnTarget', label: 'Shots on Target' },
  { id: 'shotsOffTarget', label: 'Shots off Target' },
  { id: 'blockedShots', label: 'Blocked Shots' },
  { id: 'fouls', label: 'Fouls' },
  { id: 'throwIns', label: 'Throw Ins' },
  { id: 'substitutions', label: 'Substitutions' },
  { id: 'goalKicks', label: 'Goal Kicks' },
  { id: 'varStateChanges', label: 'VAR States' },
  { id: 'offsides', label: 'Offsides' },
  { id: 'stoppageTimeAnnouncements', label: 'Stoppage Time' },
  { id: 'kickOffs', label: 'Kick Offs' },
  { id: 'bookingStateChanges', label: 'Booking States' }
];

const varStateMap: Record<string, string> = {
  'Danger': 'VAR Check Started',
  'InProgress': 'VAR Review in Progress',
  'Safe': 'VAR Check Complete'
};

export function MatchActionTimeline({ fixtureId, matchData }: MatchActionTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set(EVENT_TYPES.map(et => et.id)));
  
  const events = useMemo(() => {
    const processedEvents = processMatchEvents(matchData);
    return processedEvents.filter(event => visibleEvents.has(event.type));
  }, [matchData, visibleEvents]);

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
      if (event.type === 'stoppageTimeAnnouncements') {
        return {
          title: `Added Time: ${event.addedMinutes} minutes`,
          description: 'Stoppage Time'
        };
      }
      if (event.type === 'bookingStateChanges') {
        const getBookingStateTitle = (state: string | undefined) => {
          if (!state) return 'Booking State Change';
          
          switch (state) {
            case 'YellowCardDanger':
              return 'Yellow Card Warning';
            case 'RedCardDanger':
              return 'Red Card Warning';
            case 'Safe':
              return 'Booking Check Complete';
            default:
              return 'Booking State Change';
          }
        };
        
        return {
          title: getBookingStateTitle(event.bookingState),
          description: event.bookingState === 'Safe' ? 'Check Complete' : 'Booking Check'
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
    <Card className="relative overflow-hidden border-none shadow-none">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500"></div>
          </div>
        </div>
        <EventSettingsSheet 
          eventTypes={EVENT_TYPES}
          visibleEvents={visibleEvents}
          onVisibilityChange={setVisibleEvents}
        />
      </div>
      <div 
        ref={parentRef}
        className="h-[600px] overflow-auto overscroll-none scroll-smooth px-2"
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
                  'px-2',
                  event.displaySide === 'center' && 'flex justify-center'
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