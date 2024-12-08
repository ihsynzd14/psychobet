'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LiveFixture } from './live-fixture';
import { api } from '@/lib/api';

export function FeedManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fixtures, isLoading } = useQuery({
    queryKey: ['fixtures'],
    queryFn: api.getLiveFixtures,
  });

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
      toast({
        title: 'All Feeds Stopped',
        description: 'All feeds have been stopped successfully.',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!fixtures?.length) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
        <h2 className="text-lg font-semibold">No Live Fixtures</h2>
        <p className="text-muted-foreground">There are no live fixtures available at the moment.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Fixtures</h1>
        <Button
          variant="destructive"
          onClick={() => stopAllFeedsMutation.mutate()}
          disabled={stopAllFeedsMutation.isPending}
        >
          <StopCircle className="w-4 h-4 mr-2" />
          Stop All Feeds
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fixtures.map((fixture) => (
          <LiveFixture
            key={fixture.fixtureId}
            fixture={fixture}
            onStart={() => startFeedMutation.mutate(fixture.fixtureId)}
            onStop={() => stopFeedMutation.mutate(fixture.fixtureId)}
          />
        ))}
      </div>
    </div>
  );
}