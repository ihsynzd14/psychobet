import React from 'react';
import { ExtraTimeCalculation } from './types';
import { Timer, History, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExtraTimeDisplayProps {
  calculations: ExtraTimeCalculation;
  currentPhase: string;
  isAdmin: boolean;
}

export const ExtraTimeDisplay: React.FC<ExtraTimeDisplayProps> = ({
  calculations,
  currentPhase,
  isAdmin,
}) => {


  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `${minutes}m`;
  };

  const getPhaseHistory = (phaseName: string) => {
    return calculations.history
      .filter((event) => event.phase === phaseName)
      .sort((a, b) => a.timeElapsed.localeCompare(b.timeElapsed));
  };

  const firstHalfHistory = getPhaseHistory('FirstHalf');
  const secondHalfHistory = getPhaseHistory('SecondHalf');

  const renderPhaseSection = (
    title: string,
    data: { total: number },
    history: any[],
    icon: React.ReactNode,
    colorClass: string
  ) => {
    // Show section if there is history, even if total is 0 (unlikely but safe)
    if (history.length === 0 && data.total === 0) return null;

    return (
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <Badge variant="outline" className={cn("font-mono text-sm px-2 py-0.5 border-none bg-opacity-10 dark:bg-opacity-20", colorClass)}>
            +{formatTime(data.total)}
          </Badge>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-950/50">
          <ScrollArea className="w-full rounded-md">
            {/* 
              We use a raw table element here instead of the Shadcn Table component.
              The Shadcn Table component wraps the table in a div with overflow-auto,
              which creates a new stacking context that prevents sticky headers from working
              relative to the outer ScrollArea.
            */}
            <table className="w-full caption-bottom text-sm text-left">
              <TableHeader className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                  <TableHead className="sticky top-0 z-20 w-[80px] bg-gray-50/95 dark:bg-gray-900/95 text-xs font-semibold text-gray-500 uppercase tracking-wider h-9 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    Time
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 text-xs font-semibold text-gray-500 uppercase tracking-wider h-9 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    Event
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider h-9 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    Add
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-xs text-gray-400">
                      No recorded stoppages
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((event: any) => (
                    <TableRow key={event.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/60 border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-700 dark:text-gray-300 py-2.5">
                        {event.timeElapsed}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400 font-medium py-2.5">
                        <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                          {event.description}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-orange-600 dark:text-orange-400 py-2.5">
                        +{formatTime(event.duration)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
          </ScrollArea>
        </Card>
      </div>
    );
  };

  const hasData = calculations.firstHalf.total > 0 || calculations.secondHalf.total > 0 || firstHalfHistory.length > 0 || secondHalfHistory.length > 0;

  return (
    <div className="w-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50 rounded-xl">
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-xl sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Extra Time
              </h2>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px] p-3 border-red-200 dark:border-red-900/30 bg-white dark:bg-gray-950">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <Info className="w-3 h-3" />
                        WARNING
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                        The calculated stoppage/added time is based entirely on data provided by the on-field scout and may be significantly inaccurate.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1">
              Feature (Beta)
            </p>
          </div>
        </div>
        {hasData && (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-[10px] uppercase tracking-wider">
            Live Feed
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <History className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">No Events Detected</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 max-w-[200px] mx-auto">
                Game stoppages will appear here automatically as they occur.
              </p>
            </div>
          </div>
        ) : (
          <>
            {renderPhaseSection(
              'First Half',
              calculations.firstHalf,
              firstHalfHistory,
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />,
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
            )}

            {renderPhaseSection(
              'Second Half',
              calculations.secondHalf,
              secondHalfHistory,
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />,
              "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            )}
          </>
        )}
      </div>
    </div>
  );
};