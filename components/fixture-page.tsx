"use client"
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchHeader } from '@/components/match-header';
import { api } from '@/lib/api';
import { useMemo, useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MatchActionTimeline } from './match/match-action-timeline';
import { useMatchData } from '@/hooks/use-match-data';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchUnavailable } from '@/components/match-unavailable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load iframes for better performance
const PitchView = lazy(() => import('@/components/match/pitch-view'));
const LineupsView = lazy(() => import('@/components/match/lineups-view'));

enum ViewMode {
  SINGLE = 'single',
  ALL = 'all',
  PITCH_LINEUPS = 'pitch_lineups',
  TIMELINE_LINEUPS = 'timeline_lineups',
  TIMELINE_PITCH = 'timeline_pitch'
}

function FixturePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { fixtureId } = useParams();
  const [activeTab, setActiveTab] = useState<string>('timeline');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SINGLE);

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

  const renderTimeline = useCallback(() => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-auto"
    >
      <MatchActionTimeline 
        fixtureId={fixtureId} 
        matchData={feedData?.response?.[0]}
      />
    </motion.div>
  ), [fixtureId, feedData]);

  const renderPitch = useCallback(() => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full min-h-[300px]"
    >
      <Suspense fallback={<Skeleton className="w-full h-full" />}>
        <PitchView fixtureId={fixtureId as string} />
      </Suspense>
    </motion.div>
  ), [fixtureId]);

  const renderLineups = useCallback(() => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full min-h-[300px]"
    >
      <Suspense fallback={<Skeleton className="w-full h-full" />}>
        <LineupsView fixtureId={fixtureId as string} />
      </Suspense>
    </motion.div>
  ), [fixtureId]);

  const renderContent = useCallback(() => {
    const variants = {
      enter: { opacity: 0, y: 20 },
      center: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };

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

    switch (viewMode) {
      case ViewMode.ALL:
        return (
          <motion.div 
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-5 gap-4 h-[calc(100vh-300px)]"
          >
            <div className="col-span-3 h-full">
              {renderTimeline()}
            </div>
            <div className="col-span-2 grid grid-rows-2 gap-4 h-full">
              <div className="row-span-1 h-full">
                {renderPitch()}
              </div>
              <div className="row-span-1 h-full">
                {renderLineups()}
              </div>
            </div>
          </motion.div>
        );
      case ViewMode.PITCH_LINEUPS:
        return (
          <motion.div 
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4 h-[calc(100vh-200px)]"
          >
            <div className="col-span-1 h-full">
              {renderPitch()}
            </div>
            <div className="col-span-1 h-full">
              {renderLineups()}
            </div>
          </motion.div>
        );
      case ViewMode.TIMELINE_LINEUPS:
        return (
          <motion.div 
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)]"
          >
            <div className="col-span-3 h-full">
              {renderTimeline()}
            </div>
            <div className="col-span-2 h-full">
              {renderLineups()}
            </div>
          </motion.div>
        );
      case ViewMode.TIMELINE_PITCH:
        return (
          <motion.div 
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)]"
          >
            <div className="col-span-3 h-full">
              {renderTimeline()}
            </div>
            <div className="col-span-2 h-full">
              {renderPitch()}
            </div>
          </motion.div>
        );
      default:
        return (
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
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500"
                      />
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
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500"
                      />
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
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500"
                      />
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="timeline" className="w-full mt-0 h-[calc(100vh-300px)] pb-0">
                {renderTimeline()}
              </TabsContent>

              <TabsContent value="pitch" className="w-full mt-0 h-[calc(100vh-300px)]">
                {activeTab === 'pitch' && renderPitch()}
              </TabsContent>

              <TabsContent value="lineups" className="w-full mt-0 h-[calc(100vh-300px)]">
                {activeTab === 'lineups' && renderLineups()}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        );
    }
  }, [viewMode, activeTab, renderTimeline, renderPitch, renderLineups, isLoading, feedData]);

  const matchData = feedData?.response?.[0];

  return (
    <main className="min-h-screen bg-black">
      <div className="w-full">
        {matchData?.teams?.home && matchData?.teams?.away && (
          <>
            <MatchHeader 
              fixture={matchData}
              lastAction={lastAction}
              homeTeam={matchData.teams.home.sourceName}
              awayTeam={matchData.teams.away.sourceName}
              goals={goals}
            />
            <div className="flex items-center justify-end px-4 py-2 border-b border-gray-800">
              <div className="flex items-center space-x-4">
                <Select
                  value={viewMode}
                  onValueChange={(value: string) => setViewMode(value as ViewMode)}
                >
                  <SelectTrigger className="w-[200px] bg-transparent border-gray-700">
                    <SelectValue placeholder="Görünüm Modu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ViewMode.ALL}>All</SelectItem>
                    <SelectItem value={ViewMode.SINGLE}>Only Timeline</SelectItem>
                    <SelectItem value={ViewMode.PITCH_LINEUPS}>Pitch + Lineups</SelectItem>
                    <SelectItem value={ViewMode.TIMELINE_LINEUPS}>Timeline + Lineups</SelectItem>
                    <SelectItem value={ViewMode.TIMELINE_PITCH}>Timeline + Pitch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>

      {renderContent()}
    </main>
  );
}

export default FixturePage;