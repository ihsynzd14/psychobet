'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, StopCircle, LayoutGrid, Table as TableIcon, Clock } from 'lucide-react';
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
  const [activeFeeds, setActiveFeeds] = useState<Set<string>>(new Set());

  const { data: fixtures, isLoading } = useQuery({
    queryKey: ['fixtures'],
    queryFn: async () => {
      const data = await api.getLiveFixtures();
      return data.sort((a, b) => a.fixtureId.localeCompare(b.fixtureId));
    },
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  const handleStartFeed = async (fixtureId: string) => {
    try {
      await startFeedMutation.mutateAsync(fixtureId);
      // Update active feeds
      setActiveFeeds(prev => {
        const newSet = new Set(prev);
        newSet.add(fixtureId);
        return newSet;
      });
    } catch (error) {
      console.error('Error starting feed:', error);
    }
  };

  const handleStopFeed = async (fixtureId: string) => {
    try {
      await stopFeedMutation.mutateAsync(fixtureId);
      // Update active feeds
      setActiveFeeds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fixtureId);
        return newSet;
      });
      // Clear the last action data
      queryClient.setQueryData(['lastAction', fixtureId], null);
    } catch (error) {
      console.error('Error stopping feed:', error);
    }
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
      setActiveFeeds(new Set());
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
      <Card className="relative overflow-hidden bg-white dark:bg-zinc-950">
        <div className="p-12 flex flex-col items-center justify-center min-h-[600px] text-center">
          {/* Main Content Container */}
          <div className="space-y-12">
            {/* Animated Icon */}
            <div className="relative inline-flex">
              <div className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-blue-400 opacity-20"></div>
              <div className="relative rounded-full bg-blue-500 p-6 shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Text Section */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight">
                No Live Matches Right Now
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                We're keeping an eye out for upcoming matches. They'll appear here as soon as they begin.
              </p>
            </div>

            {/* Interactive Elements */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-muted">
                <Activity className="w-5 h-5 text-blue-500 animate-[spin_3s_linear_infinite]" />
                <span className="text-sm font-medium">Auto-refreshing feed status...</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Next automatic check in 3 seconds</span>
                </div>
              </div>
            </div>           
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
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {fixtures?.map((fixture) => (
            <LiveFixture
              key={fixture.fixtureId}
              fixture={fixture}
              activeFeeds={activeFeeds}
              onStart={() => handleStartFeed(fixture.fixtureId)}
              onStop={() => handleStopFeed(fixture.fixtureId)}
            />
          ))}
        </div>
      ) : (
        <FeedTable
          fixtures={fixtures || []}
          activeFeeds={activeFeeds}
          onStart={handleStartFeed}
          onStop={handleStopFeed}
        />
      )}
    </div>
  );
}