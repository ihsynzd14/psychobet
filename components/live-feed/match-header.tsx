import { memo, useMemo, useState, useEffect } from 'react';
import { TeamJersey } from './jerseys';
import { Square } from 'lucide-react';
import Image from 'next/image';
import { Color } from './types';

interface TeamInfo {
  sourceId: string;
  sourceName: string;
  strip: {
    color1: Color | null;
    color2: Color | null;
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
  isClockRunning?: boolean;
}

const RedCards = memo(({ count }: { count: number }) => {
  const cards = useMemo(() => Array(count).fill(0), [count]);
  
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-0.5 ml-1">
      {cards.map((_, index) => (
        <Image 
          key={index} 
          src="/img/red.png" 
          alt="Red Card" 
          width={16} 
          height={16} 
          className="w-3 h-4 sm:w-4 sm:h-5"
        />
      ))}
    </div>
  );
});

RedCards.displayName = 'RedCards';

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
  currentPhase = 'FirstHalf',
  isClockRunning = true
}) => {
  const [displayTime, setDisplayTime] = useState(matchTimeElapsed);
  const [lastTimeElapsed, setLastTimeElapsed] = useState(matchTimeElapsed);
  const [halfTimeEndTime, setHalfTimeEndTime] = useState('45:00');
  const [prevMatchPeriod, setPrevMatchPeriod] = useState(matchPeriod);

  // Use props directly for scores to ensure immediate updates
  const displayHomeScore = homeScore;
  const displayAwayScore = awayScore;

  // Log score changes for debugging
  useEffect(() => {
    console.log('MatchHeader score props changed:', { 
      homeScore, 
      awayScore
    });
  }, [homeScore, awayScore]);

  useEffect(() => {
    // Debug log to help identify why timer might still be running
    console.log('Current state:', { 
      matchPeriod, 
      currentPhase, 
      displayTime,
      matchTimeElapsed,
      isClockRunning,
      shouldStopTimer: currentPhase === 'PostMatch'
    });

    // If match period changes, update the previous match period
    if (matchPeriod !== prevMatchPeriod) {
      setPrevMatchPeriod(matchPeriod);
    }

    // PRE-MATCH - Before the match starts, don't run timer
    if (currentPhase !== 'FirstHalf' && 
        currentPhase !== 'SecondHalf' && 
        currentPhase !== 'ExtraTimeFirstHalf' && 
        currentPhase !== 'ExtraTimeSecondHalf' &&
        currentPhase !== 'HalfTime' &&
        currentPhase !== 'FullTimeNormalTime' &&
        currentPhase !== 'ExtraTimeHalfTime' &&
        currentPhase !== 'Penalties' &&
        currentPhase !== 'PostMatch') {
      // Match hasn't started yet, show 00:00 and don't run timer
      setDisplayTime('00:00');
      return; // Stop timer
    }

    // FIRST HALF - Timer runs normally (when clock is running)
    if (currentPhase === 'FirstHalf') {
      // Update time if we get a new time from events
      if (matchTimeElapsed !== lastTimeElapsed) {
        setDisplayTime(matchTimeElapsed);
        setLastTimeElapsed(matchTimeElapsed);
      }
      
      // Only start the timer if the clock is running
      if (isClockRunning) {
        const timer = setInterval(() => {
          setDisplayTime(prevTime => {
            const seconds = timeElapsedToSeconds(prevTime);
            return secondsToTimeElapsed(seconds + 1);
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
      
      // If clock is not running, don't start timer
      return;
    }
    
    // 1ST HALF COMPLETE - Stop the timer and show the last time
    if (matchPeriod === '1st Half Complete') {
      // Preserve the final time of first half
      if (prevMatchPeriod !== '1st Half Complete') {
        setDisplayTime(matchTimeElapsed);
      }
      return; // Stop timer
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
      
      // Only start the timer if the clock is running
      if (isClockRunning) {
        const timer = setInterval(() => {
          setDisplayTime(prevTime => {
            const seconds = timeElapsedToSeconds(prevTime);
            return secondsToTimeElapsed(seconds + 1);
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
      
      // If clock is not running, don't start timer
      return;
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
    if (currentPhase === 'ExtraTimeFirstHalf' || matchPeriod === 'Extra Time First Half') {
      // If we're just starting extra time, set time to 90:00
      if (prevMatchPeriod === 'Full Time Normal Time' && 
          (matchPeriod === 'Extra Time First Half' || currentPhase === 'ExtraTimeFirstHalf')) {
        setDisplayTime('90:00');
      }
      
      // Update time if we get a new time from events
      if (matchTimeElapsed !== lastTimeElapsed) {
        setDisplayTime(matchTimeElapsed);
        setLastTimeElapsed(matchTimeElapsed);
      }
      
      // Only start the timer if the clock is running
      if (isClockRunning) {
        const timer = setInterval(() => {
          setDisplayTime(prevTime => {
            const seconds = timeElapsedToSeconds(prevTime);
            return secondsToTimeElapsed(seconds + 1);
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
      
      // If clock is not running, don't start timer
      return;
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
      
      // Only start the timer if the clock is running
      if (isClockRunning) {
        const timer = setInterval(() => {
          setDisplayTime(prevTime => {
            const seconds = timeElapsedToSeconds(prevTime);
            return secondsToTimeElapsed(seconds + 1);
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
      
      // If clock is not running, don't start timer
      return;
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
        matchPeriod === '2nd Half Complete' || matchPeriod === 'Full Time' ||
        matchPeriod === '1st Half Complete') {
      // Preserve the final time
      if (prevMatchPeriod !== 'Match Complete' && prevMatchPeriod !== 'PostMatch' && 
          prevMatchPeriod !== '2nd Half Complete' && prevMatchPeriod !== 'Full Time' &&
          prevMatchPeriod !== '1st Half Complete') {
        setDisplayTime(matchTimeElapsed);
      }
      return; // Stop timer
    }
    
    // Default case - update time if we get a new time from events
    if (matchTimeElapsed !== lastTimeElapsed) {
      setDisplayTime(matchTimeElapsed);
      setLastTimeElapsed(matchTimeElapsed);
    }
  }, [matchTimeElapsed, lastTimeElapsed, matchPeriod, currentPhase, prevMatchPeriod, halfTimeEndTime, displayTime, isClockRunning]);

  const showStoppageTime = useMemo(() => {
    return stoppageTime !== null && 
           stoppageTime > 0 && 
           (currentPhase === 'FirstHalf' || 
            currentPhase === 'SecondHalf' || 
            currentPhase === 'ExtraTimeFirstHalf' || 
            currentPhase === 'ExtraTimeSecondHalf');
  }, [stoppageTime, currentPhase]);

  if (!homeTeam?.strip || !awayTeam?.strip || 
      !homeTeam?.strip?.color1 || !homeTeam?.strip?.color2 ||
      !awayTeam?.strip?.color1 || !awayTeam?.strip?.color2) {
    return (
      <div className="flex flex-col border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-center p-4">
          <span className="text-gray-500 dark:text-gray-400">Loading team data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between p-2 sm:p-4 min-h-[80px] overflow-hidden gap-2">
        {/* Home Team */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 max-w-[28%] md:max-w-[30%]">
          <div className="flex-shrink-0">
            <TeamJersey 
              color1={homeTeam.strip.color1} 
              color2={homeTeam.strip.color2} 
              type="home"
            />
          </div>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate min-w-0">
              {homeTeam.sourceName}
            </h2>
            <RedCards count={homeRedCards} />
          </div>
        </div>

        {/* Score and Match Time - Fixed Center */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
          <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tabular-nums bg-gray-100 dark:bg-gray-800 px-1 sm:px-2 md:px-4 py-1 md:py-2 rounded-lg shadow-sm">
            {displayHomeScore}
          </div>
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px] md:min-w-[80px]">
            <span className="text-xs sm:text-sm md:text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
              {displayTime}
              {showStoppageTime && (
                <span className="text-red-500 dark:text-red-400 ml-1">+{stoppageTime}'</span>
              )}
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center leading-tight max-w-[120px] truncate">
              {matchPeriod === 'Half Time' ? 'Half Time' : matchPeriod}
            </span>
          </div>
          <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tabular-nums bg-gray-100 dark:bg-gray-800 px-1 sm:px-2 md:px-4 py-1 md:py-2 rounded-lg shadow-sm">
            {displayAwayScore}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 max-w-[28%] md:max-w-[30%] justify-end">
          <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
            <RedCards count={awayRedCards} />
            <h2 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate min-w-0 text-right">
              {awayTeam.sourceName}
            </h2>
          </div>
          <div className="flex-shrink-0">
            <TeamJersey 
              color1={awayTeam.strip.color1} 
              color2={awayTeam.strip.color2} 
              type="away"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

MatchHeader.displayName = 'MatchHeader';