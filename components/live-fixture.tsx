'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Play, StopCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Fixture } from '@/lib/api';

interface LiveFixtureProps {
  fixture: Fixture;
  onStart: () => void;
  onStop: () => void;
}

export function LiveFixture({ fixture, onStart, onStop }: LiveFixtureProps) {
  const router = useRouter();

  const { data: lastAction } = useQuery({
    queryKey: ['lastAction', fixture.fixtureId],
    queryFn: () => api.getLastAction(fixture.fixtureId),
    enabled: !!fixture.fixtureId,
    refetchInterval: 5000,
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-600/10 to-green-700/10 dark:from-green-500/20 dark:to-green-600/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">
            Fixture {fixture.fixtureId}
          </CardTitle>
          <Badge variant={fixture.status === 'Covered' ? 'default' : 'secondary'}>
            {fixture.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Start Time: {new Date(fixture.startDateUtc).toLocaleString()}
          </div>
          {lastAction?.data?.lastAction && (
            <div className="bg-primary/5 p-3 rounded-md">
              <p className="text-sm font-medium">Last Action:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lastAction.data.lastAction.type}: {lastAction.data.lastAction.description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-green-600/10 to-green-700/10 dark:from-green-500/20 dark:to-green-600/20 flex justify-between gap-2">
        <Button variant="outline" onClick={onStart}>
          <Play className="w-4 h-4 mr-2" />
          Start Feed
        </Button>
        <Button variant="outline" onClick={onStop}>
          <StopCircle className="w-4 h-4 mr-2" />
          Stop Feed
        </Button>
        <Button 
          variant="default"
          onClick={() => router.push(`/${fixture.fixtureId}`)}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Feed
        </Button>
      </CardFooter>
    </Card>
  );
}