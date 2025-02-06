'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Activity, Clock, Download } from 'lucide-react';
import { api } from '@/lib/api';

import { EventView } from './live-feed/event-view';
import { Button } from '@/components/ui/button';
import { formatTime } from './live-feed/utils';
import { processMatchActions } from './live-feed/event-processor';
import { LiveFeedPageProps, MatchEvent } from './live-feed/types';

export function LiveFeedPage({ fixtureId }: LiveFeedPageProps) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(formatTime(new Date()));
  const [rawData, setRawData] = useState<any>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const downloadRawData = useCallback(() => {
    if (!rawData) return;

    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match_${fixtureId}_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [rawData, fixtureId]);

  useEffect(() => {
    const unsubscribe = api.subscribeToFixture(fixtureId, (data) => {
      setRawData(data); // Store raw data
      const newEvents = processMatchActions(data);
      setEvents(prev => {
        const combined = [...prev, ...newEvents];
        return Array.from(
          new Map(combined.map(event => [event.id, event])).values()
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      });
    });

    return () => {
      unsubscribe();
    };
  }, [fixtureId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  });

  const sortedEvents = useMemo(() => {
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Match #{fixtureId}
            </h1>
            <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                {currentTime}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadRawData}
            disabled={!rawData}
            className="bg-purple-950 group hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-950 dark:hover:text-purple-400 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Download Raw Data
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-100 dark:border-gray-700 p-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Live Match Events
            </h2>
          </div>
          
          <div 
            ref={parentRef} 
            className="h-[calc(100vh-200px)] overflow-auto px-3"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const event = sortedEvents[virtualRow.index];
                return (
                  <div
                    key={event.id}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <EventView event={event} />
                  </div>
                );
              })}
            </div>
          </div>

          {events.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
              No events yet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 