'use client';

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock } from 'lucide-react';

interface LastAction {
  type: string;
  id: number;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  isConfirmed: boolean;
  dangerState?: string;
  team?: string;
}

interface LastActionResponse {
  status: string;
  data: {
    timestamp: string;
    matchStatus: string;
    lastAction: LastAction;
  };
}

interface MatchHeaderProps {
  fixture: any;
  lastAction: LastActionResponse | null;
  homeTeam: string;
  awayTeam: string;
  goals: {
    home: number;
    away: number;
  };
}

export function MatchHeader({ fixture, lastAction, homeTeam, awayTeam, goals }: MatchHeaderProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{homeTeam}</h3>
            <span className="text-4xl font-bold text-primary">{goals.home}</span>
          </div>
          
          <div className="text-center flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {lastAction?.data?.matchStatus || fixture.matchStatus}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {lastAction?.data?.lastAction?.phase || fixture.phase}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Clock className="w-4 h-4" />
              {format(new Date(fixture.timestamp), 'HH:mm')}
            </div>
            {lastAction?.data?.lastAction && (
              <div className="mt-4 flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm bg-primary/10 p-2 rounded-md">
                  <Activity className="w-4 h-4" />
                  <span>
                    {lastAction.data.lastAction.type === 'dangerStateChanges' 
                      ? lastAction.data.lastAction.dangerState 
                      : lastAction.data.lastAction.type}
                  </span>
                </div>
                {lastAction.data.lastAction.team && (
                  <Badge variant="outline" className="text-xs">
                    {lastAction.data.lastAction.team} Team
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{awayTeam}</h3>
            <span className="text-4xl font-bold text-primary">{goals.away}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}