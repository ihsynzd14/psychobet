import React from 'react';
import { ExtraTimeCalculation } from './types';

interface ExtraTimeDisplayProps {
  calculations: ExtraTimeCalculation;
  currentPhase: string;
  isAdmin: boolean;
}

export const ExtraTimeDisplay: React.FC<ExtraTimeDisplayProps> = ({
  calculations,
  currentPhase,
  isAdmin
}) => {
  const currentPhaseCalculations = currentPhase === 'FirstHalf' 
    ? calculations.firstHalf 
    : calculations.secondHalf;

  if (!isAdmin || currentPhaseCalculations.total === 0) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhaseHistory = calculations.history.filter(event => event.phase === currentPhase);

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
        Extra Time: {formatTime(currentPhaseCalculations.total)}
      </div>
      {/* Debug history for admins */}
      {isAdmin && currentPhaseHistory.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1 max-h-32 overflow-y-auto">
          {currentPhaseHistory.map((event: any, index: number) => (
            <div key={event.id} className="flex justify-between items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="truncate flex-1 text-left">{event.description}</span>
              <span className="font-medium text-orange-500 dark:text-orange-400 ml-2">
                {formatTime(event.duration)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};