'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, StopCircle, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { LiveFixture } from './live-fixture';
import { FeedTable } from './feed-table';
import { api } from '@/lib/api';
import { useState } from 'react';

export function FeedManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Lift activeFeeds state to parent component
  const activeFeeds = useQuery({
    queryKey: ['activeFeeds'],
    queryFn: () => new Set<string>(),
    initialData: new Set<string>()
  });

  const { data: fixtures, isLoading } = useQuery({
    queryKey: ['fixtures'],
    queryFn: api.getLiveFixtures,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  const handleStartFeed = async (fixtureId: string) => {
    await startFeedMutation.mutateAsync(fixtureId);
    // Update active feeds
    const newActiveFeeds = new Set(activeFeeds.data);
    newActiveFeeds.add(fixtureId);
    queryClient.setQueryData(['activeFeeds'], newActiveFeeds);
  };

  const handleStopFeed = async (fixtureId: string) => {
    await stopFeedMutation.mutateAsync(fixtureId);
    // Update active feeds
    const newActiveFeeds = new Set(activeFeeds.data);
    newActiveFeeds.delete(fixtureId);
    queryClient.setQueryData(['activeFeeds'], newActiveFeeds);
    // Clear the last action data
    queryClient.setQueryData(['lastAction', fixtureId], null);
  };

  const startFeedMutation = useMutation({
    mutationFn: api.startFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      toast({
        title: 'Feed Started',
        description: 'The feed has been started successfully.',
      });
    },
  });

  const stopFeedMutation = useMutation({
    mutationFn: api.stopFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      toast({
        title: 'Feed Stopped',
        description: 'The feed has been stopped successfully.',
      });
    },
  });

  const stopAllFeedsMutation = useMutation({
    mutationFn: api.stopAllFeeds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      // Clear all active feeds
      queryClient.setQueryData(['activeFeeds'], new Set<string>());
      toast({
        title: 'All Feeds Stopped',
        description: 'All feeds have been stopped successfully.',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading feeds...</p>
        </div>
      </div>
    );
  }

  if (!fixtures?.length) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-background to-muted/50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-yellow-500/10">
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">No Live Fixtures</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              There are no live fixtures available at the moment. Please check back later.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Live Fixtures</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring {fixtures?.length} active feed{fixtures?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Toggle
              pressed={viewMode === 'grid'}
              onPressedChange={() => setViewMode('grid')}
              size="sm"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === 'table'}
              onPressedChange={() => setViewMode('table')}
              size="sm"
              aria-label="Table view"
            >
              <TableIcon className="h-4 w-4" />
            </Toggle>
          </div>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => stopAllFeedsMutation.mutate()}
            disabled={stopAllFeedsMutation.isPending}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Stop All Feeds
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fixtures?.map((fixture) => (
            <LiveFixture
              key={fixture.fixtureId}
              fixture={fixture}
              activeFeeds={activeFeeds.data}
              onStart={() => handleStartFeed(fixture.fixtureId)}
              onStop={() => handleStopFeed(fixture.fixtureId)}
            />
          ))}
        </div>
      ) : (
        <FeedTable
          fixtures={fixtures || []}
          activeFeeds={activeFeeds.data}
          onStart={handleStartFeed}
          onStop={handleStopFeed}
        />
      )}
    </div>
  );
}