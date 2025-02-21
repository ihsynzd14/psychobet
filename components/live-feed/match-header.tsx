import { memo, useMemo, useState, useEffect } from 'react';
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
  matchTimeElapsed?: string;
  homeScore?: number;
  awayScore?: number;
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

const ScoreDisplay = memo(({ score = 0 }: { score?: number }) => (
  <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums bg-gray-100 dark:from-transparent dark:to-gray-800 px-4 py-2 rounded-lg shadow-sm">
    {score}
  </div>
));

ScoreDisplay.displayName = 'ScoreDisplay';

const timeElapsedToSeconds = (timeElapsed: string): number => {
  const [minutes, seconds] = timeElapsed.split(':').map(Number);
  return minutes * 60 + seconds;
};

const secondsToTimeElapsed = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const MatchHeader = memo<MatchHeaderProps>(({ 
  homeTeam, 
  awayTeam, 
  currentTime, 
  matchPeriod = '1st Half',
  homeRedCards = 0,
  awayRedCards = 0,
  matchTimeElapsed = '00:00',
  homeScore = 0,
  awayScore = 0
}) => {
  const [displayTime, setDisplayTime] = useState(matchTimeElapsed);
  const [lastTimeElapsed, setLastTimeElapsed] = useState(matchTimeElapsed);

  useEffect(() => {
    if (matchTimeElapsed !== lastTimeElapsed) {
      setDisplayTime(matchTimeElapsed);
      setLastTimeElapsed(matchTimeElapsed);
    }

    const timer = setInterval(() => {
      setDisplayTime(prevTime => {
        const seconds = timeElapsedToSeconds(prevTime);
        return secondsToTimeElapsed(seconds + 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchTimeElapsed, lastTimeElapsed]);

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
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {homeTeam.sourceName}
              </h2>
              <RedCards count={homeRedCards} />
            </div>
          </div>
        </div>

        {/* Score and Match Time */}
        <div className="flex items-center gap-4">
          <ScoreDisplay score={homeScore} />
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{displayTime}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{matchPeriod}</span>
          </div>
          <ScoreDisplay score={awayScore} />
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <RedCards count={awayRedCards} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {awayTeam.sourceName}
              </h2>
            </div>
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

MatchHeader.displayName = 'MatchHeader';