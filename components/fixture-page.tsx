"use client"
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchHeader } from '@/components/match-header';
import { api } from '@/lib/api';
import { useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MatchActionTimeline } from './match/match-action-timeline';
import { useMatchData } from '@/hooks/use-match-data';
import { Skeleton } from '@/components/ui/skeleton';

function FixturePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { fixtureId } = useParams();

  const { 
    fixture, 
    feedData, 
    lastAction, 
    isLoading 
  } = useMatchData({ 
    fixtureId: fixtureId as string,
    bufferSize: 10,
    updateInterval: 1
  });
  
  const goals = useMemo(() => {
    const goals = feedData?.response?.[0]?.actions?.goals || [];
    return {
      home: goals.filter((g: { team: string }) => g.team === 'Home').length,
      away: goals.filter((g: { team: string }) => g.team === 'Away').length
    };
  }, [feedData]);

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

    return () => {
      api.stopFeed(fixtureId as string).catch(console.error);
    };
  }, [fixtureId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const matchData = feedData?.response?.[0];
  if (!matchData?.teams?.home || !matchData?.teams?.away) {
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
