'use client';

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowLeft, Clock, Flag } from 'lucide-react';
import { MatchConditions } from './match/match-conditions';
import { MatchStats } from './match/match-stats';
import { TeamJersey } from './match/jerseys/team-jersey';
import router from 'next/router';
import { Button } from './ui/button';

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
  lastAction: any;
  homeTeam?: string;
  awayTeam?: string;
  goals: {
    home: number;
    away: number;
  };
}

const defaultColors = {
  home: {
    color1: { r: 30, g: 64, b: 175 }, // Blue
    color2: { r: 255, g: 255, b: 255 } // White
  },
  away: {
    color1: { r: 185, g: 28, b: 28 }, // Red
    color2: { r: 255, g: 255, b: 255 } // White
  }
};

export function MatchHeader({ 
  fixture, 
  lastAction, 
  homeTeam = 'Home Team', // Default values
  awayTeam = 'Away Team',
  goals 
}: MatchHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Match Conditions */}
        <div className="bg-muted/30 p-4 border-b">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fixtures
          </Button>
          <MatchConditions systemMessages={fixture.actions.systemMessages || []} />
        </div>

        {/* Score and Teams Section */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 items-center">
            {/* Home Team */}
            <div className="text-center space-y-3">
              <div className="relative w-fit mx-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent rounded-full blur-sm" />
                <div className="relative p-2 rounded-full bg-gradient-to-t from-background/10 to-background/5 ring-1 ring-white/10 dark:bg-[#2e2e2e] bg-[#e2e2e2]">
                  <TeamJersey 
                    color1={fixture.teams.home.strip?.color1 || defaultColors.home.color1}
                    color2={fixture.teams.home.strip?.color2 || defaultColors.home.color2}
                    className="relative z-10" 
                    type={'home'}              
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold truncate" title={homeTeam}>{homeTeam}</h3>
              <div className="text-5xl font-bold text-primary leading-none">{goals.home}</div>
            </div>

            {/* Match Info */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex flex-col items-center text-center">
                <Badge variant="secondary" className="text-sm px-3 py-1 mb-1">
                  {lastAction?.data?.matchStatus || fixture.matchStatus}
                </Badge>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <time>{format(new Date(fixture.timestamp), 'HH:mm')}</time>
                </div>
              </div>
            
              <Badge variant="outline" className="text-xs">
                {lastAction?.data?.lastAction?.phase || fixture.phase}
              </Badge>

              {lastAction?.data?.lastAction && (
                <div className="mt-3 space-y-2 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="px-3 py-1.5 rounded-md bg-primary/10 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span className="font-medium">
                        {lastAction.data.lastAction.type === 'dangerStateChanges'
                          ? lastAction.data.lastAction.dangerState
                          : lastAction.data.lastAction.type}
                      </span>
                    </div>
                  </div>
                  {lastAction.data.lastAction.team && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Flag className="w-3 h-3" /> {lastAction.data.lastAction.team} Team
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center space-y-3">
              <div className="relative w-fit mx-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent rounded-full blur-sm" />
                <div className="relative p-2 rounded-full bg-gradient-to-t from-background/10 to-background/5 ring-1 ring-white/10 dark:bg-[#2e2e2e] bg-[#e2e2e2]">
                  <TeamJersey 
                    color1={fixture.teams.away.strip?.color1 || defaultColors.away.color1}
                    color2={fixture.teams.away.strip?.color2 || defaultColors.away.color2}
                    className="relative z-10" 
                    type={'home'}              
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold truncate" title={awayTeam}>{awayTeam}</h3>
              <div className="text-5xl font-bold text-primary leading-none">{goals.away}</div>
            </div>
          </div>
          <br/>

          {/* Stats Section */}
          <MatchStats matchData={fixture} />
        </div>
      </CardContent>
    </Card>
  );
}