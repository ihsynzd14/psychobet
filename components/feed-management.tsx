'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, StopCircle, LayoutGrid, Table as TableIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedTable } from './feed-table';
import { api } from '@/lib/api';
import { useState } from 'react';

export function FeedManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeFeeds, setActiveFeeds] = useState<Set<string>>(new Set());

  const { data: fixtures = [], isLoading } = useQuery({
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
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-400/10">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                Psychobet System
              </h1>
              <p className="text-sm text-muted-foreground">
                {fixtures?.length ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Monitoring {fixtures?.length} active feed{fixtures?.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    No active feeds
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              onClick={() => stopAllFeedsMutation.mutate()}
              disabled={stopAllFeedsMutation.isPending}
              className="shadow-md hover:shadow-lg transition-all hover:scale-100 bg-red-500"
            >
              {stopAllFeedsMutation.isPending ? (
                <Activity className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <StopCircle className="w-4 h-4 mr-1" />
              )}
              Stop All Feeds
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                  <Activity className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
                </div>
                <p className="text-muted-foreground text-lg animate-pulse">Loading feeds...</p>
              </div>
            </div>
          ) : !fixtures?.length ? (
            <Card className="p-12 text-center bg-gradient-to-br from-background to-muted/50 border-dashed">
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 rounded-full bg-yellow-500/10 animate-pulse">
                  <AlertCircle className="w-16 h-16 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">No Live Fixtures</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    There are no live fixtures available at the moment. Please check back later.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <FeedTable
              fixtures={fixtures}
              activeFeeds={activeFeeds}
              onStart={handleStartFeed}
              onStop={handleStopFeed}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-400/10">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200">
              Psychobet System
            </h1>
            <p className="text-sm text-muted-foreground">
              {fixtures?.length ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Monitoring {fixtures?.length} active feed{fixtures?.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  No active feeds
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={() => stopAllFeedsMutation.mutate()}
            disabled={stopAllFeedsMutation.isPending}
            className="shadow-md hover:shadow-lg transition-all hover:scale-100 bg-red-500"
          >
            {stopAllFeedsMutation.isPending ? (
              <Activity className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <StopCircle className="w-4 h-4 mr-1" />
            )}
            Stop All Feeds
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <Activity className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
              </div>
              <p className="text-muted-foreground text-lg animate-pulse">Loading feeds...</p>
            </div>
          </div>
        ) : !fixtures?.length ? (
          <Card className="p-12 text-center bg-gradient-to-br from-background to-muted/50 border-dashed">
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 rounded-full bg-yellow-500/10 animate-pulse">
                <AlertCircle className="w-16 h-16 text-yellow-500" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">No Live Fixtures</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  There are no live fixtures available at the moment. Please check back later.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <FeedTable
            fixtures={fixtures}
            activeFeeds={activeFeeds}
            onStart={handleStartFeed}
            onStop={handleStopFeed}
          />
        )}
      </div>
    </div>
  );
}