import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchTimeline } from './match-timeline';
import { Card } from '@/components/ui/card';

interface MatchTabsProps {
  matchData: any;
}

export function MatchTabs({ matchData }: MatchTabsProps) {
  return (
    <Tabs defaultValue="timeline" className="w-full mt-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
        <TabsTrigger value="lineups">Lineups</TabsTrigger>
      </TabsList>
      
      <TabsContent value="timeline">
        <Card className="p-4">
          <MatchTimeline matchData={matchData} />
        </Card>
      </TabsContent>
      
      <TabsContent value="stats">
        <Card className="p-4">
          <p className="text-muted-foreground text-center">Match statistics coming soon</p>
        </Card>
      </TabsContent>
      
      <TabsContent value="lineups">
        <Card className="p-4">
          <p className="text-muted-foreground text-center">Team lineups coming soon</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}