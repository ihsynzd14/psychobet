import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';

interface FixturesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  loading?: boolean;
}

export function FixturesPagination({ 
  currentPage, 
  totalPages, 
  onPreviousPage, 
  onNextPage,
  loading = false
}: FixturesPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Create debounced handlers to prevent rapid clicking issues
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  const handlePreviousPage = useCallback(() => {
    if (isChangingPage || currentPage <= 1 || loading) return;
    
    setIsChangingPage(true);
    onPreviousPage();
    
    // Reset the flag after a short delay to allow next click
    setTimeout(() => setIsChangingPage(false), 300);
  }, [isChangingPage, currentPage, loading, onPreviousPage]);

  const handleNextPage = useCallback(() => {
    if (isChangingPage || currentPage >= totalPages || loading) return;
    
    setIsChangingPage(true);
    onNextPage();
    
    // Reset the flag after a short delay to allow next click
    setTimeout(() => setIsChangingPage(false), 300);
  }, [isChangingPage, currentPage, totalPages, loading, onNextPage]);

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-2 flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousPage}
        disabled={currentPage <= 1 || loading || isChangingPage}
        className="h-8 px-3 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Previous
      </Button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages || loading || isChangingPage}
        className="h-8 px-3 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Next
      </Button>
    </div>
  );
}