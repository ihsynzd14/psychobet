import { memo, useMemo, useState, useEffect } from 'react';
import { TeamJersey } from './jerseys';
import { Square } from 'lucide-react';
import Image from 'next/image';

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
  stoppageTime?: number | null;
  currentPhase?: string;
}

const RedCards = memo(({ count }: { count: number }) => {
  const cards = useMemo(() => Array(count).fill(0), [count]);
  
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-0.5">
      {cards.map((_, index) => (
        <Image 
          key={index} 
          src="/img/red.png" 
          alt="Red Card" 
          width={16} 
          height={16} 
          className="w-4 h-5"
        />
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
  awayScore = 0,
  stoppageTime = null,
  currentPhase = 'FirstHalf'
}) => {
  const [displayTime, setDisplayTime] = useState(matchTimeElapsed);
  const [lastTimeElapsed, setLastTimeElapsed] = useState(matchTimeElapsed);
  const [halfTimeEndTime, setHalfTimeEndTime] = useState('45:00');
  const [prevMatchPeriod, setPrevMatchPeriod] = useState(matchPeriod);
  const [displayHomeScore, setDisplayHomeScore] = useState(homeScore);
  const [displayAwayScore, setDisplayAwayScore] = useState(awayScore);

  // Update scores when props change (including when VAR cancels a goal)
  useEffect(() => {
    setDisplayHomeScore(homeScore);
    setDisplayAwayScore(awayScore);
  }, [homeScore, awayScore]);

  useEffect(() => {
    // Debug log to help identify why timer might still be running
    console.log('Current state:', { 
      matchPeriod, 
      currentPhase, 
      displayTime,
      matchTimeElapsed,
      shouldStopTimer: currentPhase === 'PostMatch'
    });

    // If match period changes, update the previous match period
    if (matchPeriod !== prevMatchPeriod) {
      setPrevMatchPeriod(matchPeriod);
    }

    // FIRST HALF - Timer runs normally
    if (currentPhase === 'FirstHalf') {
      // Update time if we get a new time from events
      if (matchTimeElapsed !== lastTimeElapsed) {
        setDisplayTime(matchTimeElapsed);
        setLastTimeElapsed(matchTimeElapsed);
      }
      
      // Start the timer
      const timer = setInterval(() => {
        setDisplayTime(prevTime => {
          const seconds = timeElapsedToSeconds(prevTime);
          return secondsToTimeElapsed(seconds + 1);
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    // HALF TIME - Show last time from first half and stop timer
    if (currentPhase === 'HalfTime' || matchPeriod === 'Half Time') {
      // Save the end time of first half when we first enter half time
      if (prevMatchPeriod !== 'Half Time' && matchPeriod === 'Half Time') {
        setHalfTimeEndTime(displayTime);
      }
      
      // Display the saved half time end
      setDisplayTime(halfTimeEndTime);
      return; // Stop timer
    }
    
    // SECOND HALF - Timer starts from 45:00
    if (currentPhase === 'SecondHalf' || matchPeriod === 'Second Half') {
      // If we're just starting second half, set time to 45:00
      if (prevMatchPeriod === 'Half Time' && (matchPeriod === 'Second Half' || currentPhase === 'SecondHalf')) {
        setDisplayTime('45:00');
      }
      
      // Update time if we get a new time from events
      if (matchTimeElapsed !== lastTimeElapsed) {
        setDisplayTime(matchTimeElapsed);
        setLastTimeElapsed(matchTimeElapsed);
      }
      
      // Start the timer
      const timer = setInterval(() => {
        setDisplayTime(prevTime => {
          const seconds = timeElapsedToSeconds(prevTime);
          return secondsToTimeElapsed(seconds + 1);
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    // FULL TIME NORMAL TIME - Show last time from second half and stop timer
    if (currentPhase === 'FullTimeNormalTime' || matchPeriod === 'Full Time Normal Time') {
      // Keep the last elapsed time
      if (prevMatchPeriod !== 'Full Time Normal Time' && matchPeriod === 'Full Time Normal Time') {
        setDisplayTime(matchTimeElapsed);
      }
      return; // Stop timer
    }
    
    // EXTRA TIME FIRST HALF - Timer starts from 90:00
    if (currentPhase === 'FullTimeExtraTime' || matchPeriod === 'Extra Time First Half') {
      // If we're just starting extra time, set time to 90:00
      if (prevMatchPeriod === 'Full Time Normal Time' && 
          (matchPeriod === 'Extra Time First Half' || currentPhase === 'FullTimeExtraTime')) {
        setDisplayTime('90:00');
      }
      
      // Update time if we get a new time from events
      if (matchTimeElapsed !== lastTimeElapsed) {
        setDisplayTime(matchTimeElapsed);
        setLastTimeElapsed(matchTimeElapsed);
      }
      
      // Start the timer
      const timer = setInterval(() => {
        setDisplayTime(prevTime => {
          const seconds = timeElapsedToSeconds(prevTime);
          return secondsToTimeElapsed(seconds + 1);
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    // EXTRA TIME HALF TIME - Show last time from extra time first half and stop timer
    if (currentPhase === 'ExtraTimeHalfTime' || matchPeriod === 'Extra Time Half Time') {
      // Keep the last elapsed time
      if (prevMatchPeriod !== 'Extra Time Half Time' && matchPeriod === 'Extra Time Half Time') {
        setDisplayTime(matchTimeElapsed);
      }
      return; // Stop timer
    }
    
    // EXTRA TIME SECOND HALF - Timer starts from 105:00
    if (currentPhase === 'ExtraTimeSecondHalf' || matchPeriod === 'Extra Time Second Half') {
      // If we're just starting extra time second half, set time to 105:00
      if (prevMatchPeriod === 'Extra Time Half Time' && 
          (matchPeriod === 'Extra Time Second Half' || currentPhase === 'ExtraTimeSecondHalf')) {
        setDisplayTime('105:00');
      }
      
      // Update time if we get a new time from events
      if (matchTimeElapsed !== lastTimeElapsed) {
        setDisplayTime(matchTimeElapsed);
        setLastTimeElapsed(matchTimeElapsed);
      }
      
      // Start the timer
      const timer = setInterval(() => {
        setDisplayTime(prevTime => {
          const seconds = timeElapsedToSeconds(prevTime);
          return secondsToTimeElapsed(seconds + 1);
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    // PENALTIES - Show last time from extra time second half and stop timer
    if (currentPhase === 'Penalties' || matchPeriod === 'Penalties') {
      // Keep the last elapsed time (should be 120:00)
      if (prevMatchPeriod !== 'Penalties' && matchPeriod === 'Penalties') {
        setDisplayTime('120:00');
      }
      return; // Stop timer
    }
    
    // POST MATCH - Show last time and stop timer
    if (currentPhase === 'PostMatch' || matchPeriod === 'Match Complete' || 
        matchPeriod === '2nd Half Complete' || matchPeriod === 'Full Time') {
      // Preserve the final time
      if (prevMatchPeriod !== 'Match Complete' && prevMatchPeriod !== 'PostMatch' && 
          prevMatchPeriod !== '2nd Half Complete' && prevMatchPeriod !== 'Full Time') {
        setDisplayTime(matchTimeElapsed);
      }
      return; // Stop timer
    }
    
    // Default case - update time if we get a new time from events
    if (matchTimeElapsed !== lastTimeElapsed) {
      setDisplayTime(matchTimeElapsed);
      setLastTimeElapsed(matchTimeElapsed);
    }
  }, [matchTimeElapsed, lastTimeElapsed, matchPeriod, currentPhase, prevMatchPeriod, halfTimeEndTime, displayTime]);

  const showStoppageTime = useMemo(() => {
    return stoppageTime !== null && 
           stoppageTime > 0 && 
           (currentPhase === 'FirstHalf' || currentPhase === 'SecondHalf');
  }, [stoppageTime, currentPhase]);

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
          <ScoreDisplay score={displayHomeScore} />
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {displayTime}
              {showStoppageTime && (
                <span className="text-red-500 dark:text-red-400 ml-1">+{stoppageTime}'</span>
              )}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {matchPeriod === 'Half Time' ? 'Half Time - Break' : matchPeriod}
            </span>
          </div>
          <ScoreDisplay score={displayAwayScore} />
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