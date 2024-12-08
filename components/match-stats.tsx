'use client';

import { Card, CardContent } from '@/components/ui/card';

interface MatchStatsProps {
  possession: {
    home: number;
    away: number;
  };
}

export function MatchStats({ possession }: MatchStatsProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Match Statistics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Possession</span>
              <span>{possession.home}% - {possession.away}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${possession.home}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}