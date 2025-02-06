'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, StopCircle, ExternalLink, Clock, Activity, Trophy, Users, Radio, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Fixture } from '@/lib/api';
import Link from 'next/link';

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
    queryFn: async () => {
      try {
        return await api.getLastAction(fixture.fixtureId);
      } catch (error) {
        console.error('Feed query error:', error);
        return null;
      }
    },
    enabled: isActive,
    refetchInterval: isActive ? 12000 : false,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    retryDelay: 1000
  });

  const handleStart = async () => {
    try {
      await onStart();
      await refetchLastAction();
      // Ensure the query stays enabled
      queryClient.invalidateQueries({
        queryKey: ['lastAction', fixture.fixtureId]
      });
    } catch (error) {
      console.error('Error starting feed:', error);
    }
  };

  const handleStop = async () => {
    try {
      await onStop();
      // Clear the last action data from the cache
      queryClient.setQueryData(['lastAction', fixture.fixtureId], null);
      queryClient.cancelQueries({
        queryKey: ['lastAction', fixture.fixtureId]
      });
    } catch (error) {
      console.error('Error stopping feed:', error);
    }
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
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 hover:shadow-xl transition-all duration-300">
      <div className="inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <Shield className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="font-mono text-sm text-gray-500 dark:text-gray-400">#{fixture.fixtureId}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(fixture.status)} flex items-center gap-1.5 px-3 py-1`}
          >
            {getStatusIcon(fixture.status)}
            {fixture.status}
          </Badge>
        </div>
        
        <div className="mt-4 space-y-3">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
            {fixture.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {fixture.competitionName}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 text-blue-500" />
            <time className="tabular-nums">
              {new Date(fixture.startDateUtc).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </time>
          </div>

          {lastAction?.data?.lastAction && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Latest Update</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {lastAction.data.lastAction.type}: {lastAction.data.lastAction.description}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-800">
        {!isActive ? (
          <Button
            variant="outline"
            size="lg"
            className="w-full bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 hover:text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 dark:hover:text-indigo-300 transition-colors active:scale-[0.98]"
            onClick={handleStart}
          >
            <span className="flex items-center justify-center">
              <Play className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Start Feed
            </span>
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 dark:hover:text-red-300 transition-colors active:scale-[0.98]"
              onClick={handleStop}
            >
              <span className="flex items-center justify-center">
                <StopCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Stop Feed
              </span>
            </Button>
            <Link href={`/${fixture.fixtureId}`} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 dark:hover:text-blue-300 transition-colors active:scale-[0.98]"
              >
                <span className="flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </span>
              </Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}