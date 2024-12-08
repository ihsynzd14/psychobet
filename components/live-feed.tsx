'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LiveFeedProps {
  feedData: any;
}

export function LiveFeed({ feedData }: LiveFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedData]);

  const renderFeedItem = (item: any) => {
    const timestamp = new Date(item.timestamp).toLocaleTimeString();
    return (
      <div key={item.id} className="p-3 border-b last:border-0 hover:bg-primary/5 transition-colors">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium">{item.type}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-sm mt-1 text-muted-foreground">{item.description}</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4" ref={scrollRef}>
          <div className="space-y-2">
            {Array.isArray(feedData.response) ? (
              feedData.response.map(renderFeedItem)
            ) : (
              <p className="text-center text-muted-foreground">No feed updates available</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}