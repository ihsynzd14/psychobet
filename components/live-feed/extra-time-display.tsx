import React from 'react';
import { ExtraTimeCalculation } from './types';
import { Clock } from 'lucide-react';

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
  if (!isAdmin) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `${minutes}m`;
  };

  const firstHalfHistory = calculations.history.filter(event => event.phase === 'FirstHalf');
  const secondHalfHistory = calculations.history.filter(event => event.phase === 'SecondHalf');

  const renderPhaseSection = (title: string, data: any, history: any[]) => {
    if (data.total === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-t">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {formatTime(data.total)}
          </span>
        </div>

        {/* Compact event table */}
        {history.length > 0 && (
          <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">Time</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">Event</th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-600 dark:text-gray-400">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((event: any) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-2 py-1.5 text-gray-900 dark:text-gray-300 font-mono text-[11px] whitespace-nowrap">
                      {event.timeElapsed}
                    </td>
                    <td className="px-2 py-1.5 text-gray-700 dark:text-gray-400">
                      {event.description}
                    </td>
                    <td className="px-2 py-1.5 text-right text-orange-600 dark:text-orange-400 font-medium whitespace-nowrap">
                      +{formatTime(event.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
      {/* Header explaining the feature */}
      <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Expected Extra Time
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Calculated based on match stoppages (substitutions, injuries, VAR checks, incidents, and red cards)
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderPhaseSection('First Half', calculations.firstHalf, firstHalfHistory)}
        {renderPhaseSection('Second Half', calculations.secondHalf, secondHalfHistory)}

        {calculations.firstHalf.total === 0 && calculations.secondHalf.total === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 py-12">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No extra time events recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};