import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Play, StopCircle, ExternalLink, Clock, Activity, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import type { Fixture } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface FeedTableProps {
  fixtures: Fixture[];
  activeFeeds: Set<string>;
  onStart: (fixtureId: string) => void;
  onStop: (fixtureId: string) => void;
}

export function FeedTable({ fixtures, activeFeeds, onStart, onStop }: FeedTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const lastActions = Object.fromEntries(
    fixtures.map(fixture => {
      const isActive = activeFeeds.has(fixture.fixtureId);
      return [
        fixture.fixtureId,
        useQuery({
          queryKey: ['lastAction', fixture.fixtureId],
          queryFn: async () => {
            try {
              const result = await api.getLastAction(fixture.fixtureId);
              return result;
            } catch (error) {
              console.error(`Feed error for fixture ${fixture.fixtureId}:`, error);
              // Return previous data if available to prevent feed interruption
              const previousData = queryClient.getQueryData(['lastAction', fixture.fixtureId]);
              if (previousData) return previousData;
              return null;
            }
          },
          enabled: isActive,
          refetchInterval: isActive ? 5000 : false,
          staleTime: Infinity,
          gcTime: Infinity,
          retry: 3,
          retryDelay: 1000
        })
      ];
    })
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'covered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Live Matches</h2>
        </div>
        <Badge 
          variant="outline" 
          className="px-4 py-1.5 bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          {fixtures.length} Fixtures Available
        </Badge>
      </div>
      
      <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden relative group">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <TableHead className="w-[100px] font-semibold">ID</TableHead>
              <TableHead className="w-[300px] font-semibold">Match</TableHead>
              <TableHead className="w-[200px] font-semibold">Tournament</TableHead>
              <TableHead className="w-[120px] font-semibold">Status</TableHead>
              <TableHead className="w-[180px] font-semibold">Start Time</TableHead>
              <TableHead className="font-semibold">Last Action</TableHead>
              <TableHead className="text-right w-[250px] font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixtures.map((fixture) => {
              const lastAction = lastActions[fixture.fixtureId];
              const isActive = activeFeeds.has(fixture.fixtureId);

              return (
                <TableRow 
                  key={fixture.fixtureId} 
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  <TableCell className="font-mono">
                    #{fixture.fixtureId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10">
                        <Shield className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{fixture.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10">
                        <Trophy className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{fixture.competitionName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(fixture.status)} px-3 py-1`}
                    >
                      {fixture.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {lastAction?.data?.data?.lastAction ? (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                          {lastAction.data.data.lastAction.type}: {lastAction.data.data.lastAction.description}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No recent actions</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStart(fixture.fixtureId)}
                          className="bg-blue-950 group/btn hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-950 dark:hover:text-green-400 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                          Start Feed
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStop(fixture.fixtureId)}
                            className="bg-red-950 group/btn hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
                          >
                            <StopCircle className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                            Stop Feed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/${fixture.fixtureId}`)}
                            className="bg-slate-700 group/btn hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}