import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationV2Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  isLoading?: boolean;
}

export function PaginationV2({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className, 
  isLoading = false 
}: PaginationV2Props) {
  // Keep track of previous props to detect changes
  const prevTotalPagesRef = useRef<number>(totalPages);

  // Reset to page 1 if totalPages changes and current page is out of bounds
  useEffect(() => {
    if (prevTotalPagesRef.current !== totalPages) {
      prevTotalPagesRef.current = totalPages;
      if (currentPage > totalPages && totalPages > 0) {
        onPageChange(1);
      }
    }
  }, [totalPages, currentPage, onPageChange]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || isLoading) return;
    onPageChange(page);
  }, [onPageChange, totalPages, isLoading]);

  // Generate page numbers to display
  const getPageNumbers = useCallback(() => {
    // Safety check for invalid total pages
    if (totalPages <= 0) return [1];
    
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Determine visible range based on current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    
    // Special handling for when currentPage is near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
      endPage = totalPages - 1;
    }
    
    // If we're not starting from 2, add ellipsis
    if (startPage > 2) {
      pages.push(-1); // represent ellipsis
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // If we're not ending at totalPages-1, add ellipsis
    if (endPage < totalPages - 1) {
      pages.push(-1); // represent ellipsis
    }
    
    // Always add the last page if totalPages > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const pages = getPageNumbers();

  // If there's only one page or none, don't show pagination
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn("flex items-center justify-center gap-1 mt-6", className)}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {pages.map((page, i) => 
        page === -1 ? (
          <span 
            key={`ellipsis-${i}`} 
            className="flex items-center justify-center w-8 h-8 text-gray-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <motion.button
            key={`page-${page}`}
            whileHover={{ scale: isLoading ? 1 : 1.08 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            onClick={() => handlePageChange(page)}
            disabled={isLoading}
            className={cn(
              "w-8 h-8 rounded-md text-sm font-medium transition-colors relative",
              page === currentPage 
                ? "bg-blue-500 text-white shadow-sm" 
                : "bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading && page === currentPage ? (
              <Loader2 className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
            ) : (
              page
            )}
          </motion.button>
        )
      )}
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </motion.div>
  );
}