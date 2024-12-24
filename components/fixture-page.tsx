"use client"
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchHeader } from '@/components/match-header';
import { api } from '@/lib/api';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MatchActionTimeline } from './match/match-action-timeline';

function FixturePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { fixtureId } = useParams();
  const [isLive, setIsLive] = useState(false);

  const { data: fixture, isLoading: fixtureLoading } = useQuery({
    queryKey: ['fixture', fixtureId],
    queryFn: () => api.getFixture(fixtureId as string),
    refetchInterval: isLive ? 1000 : 5000,
  });

  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ['feed', fixtureId],
    queryFn: () => api.getFeedView(fixtureId as string),
    refetchInterval: isLive ? 1 : 1,
  });

  const { data: lastAction, isLoading: lastActionLoading } = useQuery({
    queryKey: ['lastAction', fixtureId],
    queryFn: () => api.getLastAction(fixtureId as string),
    refetchInterval: isLive ? 1 : 1,
    enabled: !!fixtureId,
  });

  useEffect(() => {
    if (!fixtureId) return;

    api.startFeed(fixtureId as string)
      .catch(error => {
        toast({
          title: 'Error',
          description: 'Failed to start the feed. Please try again.',
          variant: 'destructive',
        });
      });

    const unsubscribe = api.subscribeToFixture(fixtureId as string, (data) => {
      if (data?.status === 'LIVE' && !isLive) {
        setIsLive(true);
      }
    });

    return () => {
      unsubscribe();
      api.stopFeed(fixtureId as string).catch(console.error);
    };
  }, [fixtureId, isLive, toast]);
  
  const goals = useMemo(() => {
    const goals = feedData?.response?.[0]?.actions?.goals || [];
    return {
      home: goals.filter((g: { team: string }) => g.team === 'Home').length,
      away: goals.filter((g: { team: string }) => g.team === 'Away').length
    };
  }, [feedData]);

  if (fixtureLoading || feedLoading || lastActionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const matchData = feedData?.response?.[0];
  if (!fixture || !matchData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl font-semibold">Match data not available</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Fixtures
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Fixtures
        </Button>

        <MatchHeader 
          fixture={matchData}
          lastAction={lastAction}
          homeTeam={matchData.teams.home.sourceName}
          awayTeam={matchData.teams.away.sourceName}
          goals={goals}
        />

        <MatchActionTimeline 
          fixtureId={fixtureId} 
          matchData={matchData}
        />

      </div>
    </main>
  );
}

export default FixturePage;