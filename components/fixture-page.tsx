"use client"
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchHeader } from '@/components/match-header';
import { api } from '@/lib/api';
import { useMemo, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MatchActionTimeline } from './match/match-action-timeline';
import { useMatchData } from '@/hooks/use-match-data';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchUnavailable } from '@/components/match-unavailable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function FixturePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { fixtureId } = useParams();
  const [activeTab, setActiveTab] = useState<string>('timeline');

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
    return <MatchUnavailable />;
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Full width MatchHeader */}
      <div className="w-full">
        <MatchHeader 
          fixture={matchData}
          lastAction={lastAction}
          homeTeam={matchData.teams.home.sourceName}
          awayTeam={matchData.teams.away.sourceName}
          goals={goals}
        />
      </div>

      <Tabs defaultValue="timeline" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center border-b border-gray-800 py-3">
          <TabsList className="mb-[-1px] bg-transparent space-x-8">
            <TabsTrigger 
              value="pitch" 
              className="relative data-[state=active]:bg-transparent data-[state=active]:text-white px-4 transition-all duration-200 ease-in-out hover:text-gray-300"
            >
              <div className="relative py-2">
                <h1 className="font-medium text-lg">Pitch View</h1>
                {activeTab === 'pitch' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500 transition-all duration-200 ease-in-out" />
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="relative data-[state=active]:bg-transparent data-[state=active]:text-white px-4 transition-all duration-200 ease-in-out hover:text-gray-300"
            >
              <div className="relative py-2">
                <h1 className="font-medium text-lg">Timeline</h1>
                {activeTab === 'timeline' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500 transition-all duration-200 ease-in-out" />
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="lineups" 
              className="relative data-[state=active]:bg-transparent data-[state=active]:text-white px-4 transition-all duration-200 ease-in-out hover:text-gray-300"
            >
              <div className="relative py-2">
                <h1 className="font-medium text-lg">Line-ups</h1>
                {activeTab === 'lineups' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500 transition-all duration-200 ease-in-out" />
                )}
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timeline" className="w-full mt-0">
          <MatchActionTimeline 
            fixtureId={fixtureId} 
            matchData={matchData}
          />
        </TabsContent>

        <TabsContent value="pitch" className="w-full mt-0">
          {activeTab === 'pitch' && (
            <iframe 
              id="gsm-game-tracker" 
              scrolling="no" 
              src={`https://gsm-widgets.betstream.betgenius.com/multisportgametracker/?fixtureId=${fixtureId}&productName=gsmdemo-dark&widget=court`}
              width="100%" 
              height="600px" 
              style={{ border: 0 }}
              title="Pitch Track"
            />
          )}
        </TabsContent>

        <TabsContent value="lineups" className="w-full mt-0">
          {activeTab === 'lineups' && (
            <iframe 
              id="gsm-game-tracker" 
              scrolling="no" 
              src={`https://gsm-widgets.betstream.betgenius.com/multisportgametracker/?fixtureId=${fixtureId}&productName=gsmdemo-dark&widget=lineups`}
              width="100%" 
              height="600px" 
              style={{ border: 0 }}
              title="Lineups"
            />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default FixturePage;