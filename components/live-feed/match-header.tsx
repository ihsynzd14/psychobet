import { memo, useMemo } from 'react';
import { TeamJersey } from './jerseys';
import { Square } from 'lucide-react';

interface TeamInfo {
  sourceId: string;
  sourceName: string;
  strip: {
    color1: {
      r: number;
      g: number;
      b: number;
    };
    color2: {
      r: number;
      g: number;
      b: number;
    };
  };
}

interface MatchHeaderProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  currentTime: string;
  matchPeriod?: string;
  homeRedCards?: number;
  awayRedCards?: number;
}

const RedCards = memo(({ count }: { count: number }) => {
  const cards = useMemo(() => Array(count).fill(0), [count]);
  
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-0.5">
      {cards.map((_, index) => (
        <Square key={index} className="w-4 h-4 fill-red-600 text-red-600" />
      ))}
    </div>
  );
});

RedCards.displayName = 'RedCards';

export const MatchHeader = memo<MatchHeaderProps>(({ 
  homeTeam, 
  awayTeam, 
  currentTime, 
  matchPeriod = '1st Half',
  homeRedCards = 0,
  awayRedCards = 0
}) => {
  if (!homeTeam?.strip || !awayTeam?.strip) {
    return (
      <div className="flex flex-col border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-center p-4">
          <span className="text-gray-500 dark:text-gray-400"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1">
          <TeamJersey 
            color1={homeTeam.strip.color1} 
            color2={homeTeam.strip.color2} 
            type="home"
          />
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {homeTeam.sourceName}
            </h2>
            <RedCards count={homeRedCards} />
          </div>
        </div>

        {/* Match Time and Period */}
        <div className="px-4 flex flex-col items-center">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{currentTime}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{matchPeriod}</span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <RedCards count={awayRedCards} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {awayTeam.sourceName}
            </h2>
          </div>
          <TeamJersey 
            color1={awayTeam.strip.color1} 
            color2={awayTeam.strip.color2} 
            type="away"
          />
        </div>
      </div>
    </div>
  );
}); 