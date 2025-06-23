import { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface FixturesTableSkeletonProps {
  rowCount?: number;
  className?: string;
}

function FixturesTableSkeletonComponent({ rowCount = 10, className }: FixturesTableSkeletonProps) {
  return (
    <div className={cn("rounded-2xl border bg-white/80 dark:bg-gray-900/80 shadow-xl overflow-hidden relative", className)}>
      <div className="overflow-x-auto">
        <Table style={{ width: "100%" }}>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/90 to-gray-50/50 dark:from-gray-800/90 dark:to-gray-800/50">
              <TableHead className="w-[320px] sm:w-[400px] font-semibold text-xs sm:text-sm text-blue-600/50 dark:text-blue-400/50 sticky left-0 bg-gray-50/90 dark:bg-gray-800/90 z-20">Teams</TableHead>
              <TableHead className="w-[150px] lg:w-[180px] font-semibold text-xs sm:text-sm text-blue-600/50 dark:text-blue-400/50">Competition</TableHead>
              <TableHead className="hidden sm:table-cell w-[130px] lg:w-[160px] font-semibold text-xs sm:text-sm text-blue-600/50 dark:text-blue-400/50">Start</TableHead>
              <TableHead className="hidden md:table-cell w-[110px] lg:w-[160px] font-semibold text-xs sm:text-sm text-blue-600/50 dark:text-blue-400/50">Round</TableHead>
              <TableHead className="hidden md:table-cell w-[120px] lg:w-[150px] font-semibold text-xs sm:text-sm text-blue-600/50 dark:text-blue-400/50">Venue</TableHead>
              <TableHead className="w-[100px] sm:w-[120px] lg:w-[160px] text-right font-semibold text-xs sm:text-sm text-blue-600/50 dark:text-blue-400/50 sticky right-0 bg-gray-50/90 dark:bg-gray-800/90 z-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, index) => (
              <TableRow 
                key={index}
                className="animate-pulse border-b border-gray-100 dark:border-gray-800"
              >
                <TableCell className="sticky left-0 bg-white/80 dark:bg-gray-900/80 z-20">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                    <div className="flex flex-col space-y-1 sm:space-y-2">
                      <div className="h-3 sm:h-4 w-28 sm:w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-2 sm:h-3 w-24 sm:w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 w-5 h-5 sm:w-7 sm:h-7"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                </TableCell>
                
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                </TableCell>
                
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="p-0.5 sm:p-1 rounded-md bg-gray-200 dark:bg-gray-800 w-4 h-4 sm:w-5 sm:h-5"></div>
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                </TableCell>
                
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="h-3 sm:h-4 w-14 sm:w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                </TableCell>
                
                <TableCell className="text-right p-1 sm:p-2 sticky right-0 bg-white/80 dark:bg-gray-900/80 z-20">
                  <div className="inline-block h-6 sm:h-8 w-16 sm:w-20 rounded-full bg-gray-200 dark:bg-gray-800 ml-auto"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const FixturesTableSkeleton = memo(FixturesTableSkeletonComponent); 