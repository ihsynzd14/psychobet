import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Play, StopCircle, ExternalLink, Clock, Activity, Shield, Trophy, Radio } from 'lucide-react';
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
import { useState } from 'react';
import { RealTimeFeedModal } from './real-time-feed-modal';

interface FeedTableProps {
  fixtures: Fixture[];
  activeFeeds: Set<string>;
  onStart: (fixtureId: string) => void;
  onStop: (fixtureId: string) => void;
}

export function FeedTable({ fixtures, activeFeeds, onStart, onStop }: FeedTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

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
      
      <div className="rounded-2xl border bg-white/80 dark:bg-gray-900/80 shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/90 to-gray-50/50 dark:from-gray-800/90 dark:to-gray-800/50">
                <TableHead className="w-[80px] font-semibold text-blue-600 dark:text-blue-400 sticky left-0 bg-gray-50/90 dark:bg-gray-800/90 z-20">ID</TableHead>
                <TableHead className="w-[200px] lg:w-[300px] font-semibold text-blue-600 dark:text-blue-400">Match</TableHead>
                <TableHead className="hidden md:table-cell w-[150px] lg:w-[200px] font-semibold text-blue-600 dark:text-blue-400">Tournament</TableHead>
                <TableHead className="w-[100px] font-semibold text-blue-600 dark:text-blue-400">Status</TableHead>
                <TableHead className="hidden sm:table-cell w-[120px] lg:w-[180px] font-semibold text-blue-600 dark:text-blue-400">Start Time</TableHead>
                <TableHead className="w-[120px] lg:w-[250px] text-right font-semibold text-blue-600 dark:text-blue-400 sticky right-0 bg-gray-50/90 dark:bg-gray-800/90 z-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixtures.map((fixture) => {
                const isActive = activeFeeds.has(fixture.fixtureId);

                return (
                  <TableRow 
                    key={fixture.fixtureId} 
                    className="group/row hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400 sticky left-0 bg-white/80 dark:bg-gray-900/80 group-hover/row:bg-blue-50/50 dark:group-hover/row:bg-blue-900/20 z-20">
                      <div className="flex items-center">
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          #{fixture.fixtureId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-indigo-500/10 group-hover/row:bg-indigo-500/20 transition-colors">
                          <Shield className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">
                          {fixture.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/10 group-hover/row:bg-amber-500/20 transition-colors">
                          <Trophy className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover/row:text-amber-600 dark:group-hover/row:text-amber-400 transition-colors">
                          {fixture.competitionName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(fixture.status)} px-3 py-1 transition-all group-hover/row:scale-105`}
                      >
                        {fixture.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <time className="tabular-nums font-medium whitespace-nowrap">
                          {new Date(fixture.startDateUtc).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                    </TableCell>
                    <TableCell className="text-right p-2 sticky right-0 bg-white/80 dark:bg-gray-900/80 group-hover/row:bg-blue-50/50 dark:group-hover/row:bg-blue-900/20 z-20">
                      <div className="flex items-center justify-end gap-1">
                        {!isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStart(fixture.fixtureId)}
                            className="text-xs bg-white text-gray-700 group/btn hover:bg-green-100 hover:text-green-700 hover:border-green-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-green-900 dark:hover:text-green-400 transition-all hover:scale-105"
                          >
                            <Play className="w-3 h-3 mr-1 group-hover/btn:animate-pulse" />
                            <span className="hidden sm:inline">Start Feed</span>
                            <span className="sm:hidden">Start</span>
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/live/${fixture.fixtureId}`)}
                              className="text-xs bg-blue-50 text-blue-600 group/btn hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 transition-all hover:scale-105"
                            >
                              <Radio className="w-3 h-3 mr-1 group-hover/btn:animate-pulse" />
                              <span className="hidden sm:inline">Real-Time</span>
                              <span className="sm:hidden">Live</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onStop(fixture.fixtureId)}
                              className="text-xs bg-red-50 text-red-600 group/btn hover:bg-red-100 hover:text-red-700 hover:border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-all hover:scale-105"
                            >
                              <StopCircle className="w-3 h-3 mr-1 group-hover/btn:animate-pulse" />
                              <span className="hidden sm:inline">Stop Feed</span>
                              <span className="sm:hidden">Stop</span>
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

      <RealTimeFeedModal
        fixtureId={selectedFixture || ''}
        isOpen={!!selectedFixture}
        onClose={() => setSelectedFixture(null)}
      />
    </div>
  );
}