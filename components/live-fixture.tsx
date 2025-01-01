'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, StopCircle, ExternalLink, Clock, Activity, Trophy, Users, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Fixture } from '@/lib/api';

interface LiveFixtureProps {
  fixture: Fixture;
  activeFeeds: Set<string>;
  onStart: () => void;
  onStop: () => void;
}

export function LiveFixture({ fixture, activeFeeds, onStart, onStop }: LiveFixtureProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use the shared activeFeeds state
  const isActive = activeFeeds.has(fixture.fixtureId);

  const { data: lastAction, refetch: refetchLastAction } = useQuery({
    queryKey: ['lastAction', fixture.fixtureId],
    queryFn: () => api.getLastAction(fixture.fixtureId),
    enabled: isActive, // Only fetch if feed is active
    refetchInterval: isActive ? 12000 : false, // Only poll if feed is active
  });

  const handleStart = async () => {
    await onStart();
    refetchLastAction(); // Refetch last action after starting
  };

  const handleStop = async () => {
    await onStop();
    // Clear the last action data from the cache
    queryClient.setQueryData(['lastAction', fixture.fixtureId], null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'covered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'covered':
        return <Radio className="w-4 h-4 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300">
      {/* Animated highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardHeader className="relative border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Trophy className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Match #{fixture.fixtureId}
            </CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(fixture.status)} flex items-center gap-1.5 px-3 py-1`}
          >
            {getStatusIcon(fixture.status)}
            {fixture.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Start Time:</span>
            <time className="tabular-nums">{new Date(fixture.startDateUtc).toLocaleString()}</time>
          </div>
        </div>

        {lastAction?.data?.lastAction ? (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Latest Update</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lastAction.data.lastAction.type}: {lastAction.data.lastAction.description}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No recent updates
          </div>
        )}
      </CardContent>

      <CardFooter className="relative grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        {!isActive ? (
          <Button
            variant="outline"
            className="bg-blue-950 group/btn hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-950 dark:hover:text-green-400 transition-colors"
            onClick={handleStart}
          >
            <Play className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
            Start Feed
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="bg-red-950 group/btn hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
              onClick={handleStop}
            >
              <StopCircle className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
              Stop Feed
            </Button>
            <Button
              variant="outline"
              className="bg-slate-700 group/btn hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors"
              onClick={() => router.push(`/${fixture.fixtureId}`)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}