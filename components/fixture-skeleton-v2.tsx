import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FixtureSkeletonV2Props {
  className?: string;
}

export function FixtureSkeletonV2({ className }: FixtureSkeletonV2Props) {
  return (
    <Card className={cn("overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm h-full", className)}>
      <div className="p-4 sm:p-5 animate-pulse">
        {/* Competition & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-800 w-7 h-7"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
        </div>
        
        {/* Teams */}
        <div className="space-y-3 mb-4">
          {/* Home Team */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
          </div>
          
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
          </div>
        </div>
        
        {/* Match Info */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
        </div>
      </div>
    </Card>
  );
} 