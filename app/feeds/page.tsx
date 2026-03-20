'use client';

import { useCallback, useMemo, useState, useTransition, useRef, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Trophy,
  RefreshCcw,
  ArrowLeft,
  Info,
  AlertTriangle,
  ChevronDown,
  ListFilter,
  Search,
  X,
  User2Icon,
  Home,
  User,
  LogOut,
  Database,
  Hash,
  Settings2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChannelStatusIndicator } from '@/components/channel-status-indicator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FixturesTableV2, TABLE_COLUMNS } from '@/components/fixtures-table-v2';
import { FixturesTableSkeleton } from '@/components/fixtures-table-skeleton';
import { PaginationV2 } from '@/components/pagination-v2';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/components/auth/auth-provider';
import { useUserMembership } from '@/hooks/use-user-membership';
import { MembershipExpiredGate } from '@/components/membership-expired-gate';
import { Avatar } from '@/components/ui/avatar';
import { apiV2, type FixturesResponse, type FixturesByIdsResponse, type FixtureNameIndexResponse } from '@/lib/api-v2';
import { cn, normalizeSearchTerm } from '@/lib/utils';
import { toast } from 'sonner';
import { TbPremiumRights, TbVip } from 'react-icons/tb';
import { VisibilityState, ColumnSizingState } from '@tanstack/react-table';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';

// Available page size options
const PAGE_SIZE_OPTIONS = [25, 50, 100, 150];

// LocalStorage keys for persisting table preferences
const STORAGE_KEY_COLUMN_VISIBILITY = 'fixtures-table-column-visibility';
const STORAGE_KEY_COLUMN_SIZING = 'fixtures-table-column-sizing';

// API mode options
type ApiMode = 'competitions' | 'by-ids';

export default function FeedTableV2() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { isExpired, loading: membershipLoading } = useUserMembership();
  const fixturesContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // Default page size
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [apiMode, setApiMode] = useState<ApiMode>('competitions');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMN_VISIBILITY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse column visibility from localStorage:', e);
        }
      }
    }
    return {};
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMN_SIZING);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse column sizing from localStorage:', e);
        }
      }
    }
    return {};
  });

  // Debounce search input for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset to first page when search changes
      if (search !== debouncedSearch) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Persist column visibility to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COLUMN_VISIBILITY, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  // Persist column sizing to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COLUMN_SIZING, JSON.stringify(columnSizing));
    }
  }, [columnSizing]);

  // Prefetch next page for smoother pagination (only when NOT searching)
  const prefetchNextPage = useCallback((page: number, size: number, mode: ApiMode) => {
    if (page < 1) return;

    // Only prefetch if we're not already loading this page
    const queryKey = ['fixturesV2', page, size, mode];
    if (!queryClient.getQueryData(queryKey)) {
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          if (mode === 'by-ids') {
            return await apiV2.getFixturesByIds(undefined, size);
          } else {
            return await apiV2.getFixturesByCompetitions(page, size);
          }
        },
        staleTime: 30000,
      });
    }
  }, [queryClient]);

  // ============================================================
  // FIXTURE NAME INDEX for client-side search
  // Uses the SAME access control as getFixturesByCompetitions
  // (admin/league/full-bundle checks happen inside getFixtureNameIndex)
  // ============================================================
  const {
    data: nameIndex,
    isLoading: isNameIndexLoading,
  } = useQuery<FixtureNameIndexResponse>({
    queryKey: ['fixtureNameIndex'],
    queryFn: () => apiV2.getFixtureNameIndex(),
    staleTime: 60000,      // Refresh every 60s (matches existing auto-refresh interval)
    refetchInterval: 60000, // Keep in sync with fixture data
    enabled: apiMode === 'competitions', // Only load for competitions mode
  });

  // Client-side search: filter the name index to get matching fixture IDs
  const searchFilteredIds = useMemo(() => {
    if (!debouncedSearch || !nameIndex?.items?.length) return null;
    const normalized = normalizeSearchTerm(debouncedSearch);
    if (!normalized) return null;
    return nameIndex.items
      .filter(f => normalizeSearchTerm(f.name).includes(normalized))
      .map(f => Number(f.id));
  }, [debouncedSearch, nameIndex]);

  // Are we in "search mode"? (user typed something and we have results to filter)
  const isSearchActive = apiMode === 'competitions' && debouncedSearch.length > 0;

  // When searching, compute which IDs to show on the current page (client-side pagination of filtered IDs)
  const searchPageIds = useMemo(() => {
    if (!isSearchActive || !searchFilteredIds) return null;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return searchFilteredIds.slice(start, end);
  }, [isSearchActive, searchFilteredIds, currentPage, pageSize]);

  // Main query to fetch fixtures with pagination and improved caching
  // When NOT searching: uses server-side pagination (no search param sent - fast path)
  // When searching: fetches only the matching IDs for the current page
  const {
    data: fixturesData,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery<FixturesResponse | FixturesByIdsResponse>({
    queryKey: isSearchActive
      ? ['fixturesV2-search', searchPageIds, apiMode]
      : ['fixturesV2', currentPage, pageSize, apiMode],
    queryFn: async () => {
      if (apiMode === 'by-ids') {
        return await apiV2.getFixturesByIds(undefined, pageSize);
      }

      // Search mode: fetch only the specific matching fixture IDs for this page
      if (isSearchActive && searchPageIds && searchPageIds.length > 0) {
        return await apiV2.getFixturesByIds(searchPageIds, searchPageIds.length);
      }

      // Search mode but no results
      if (isSearchActive && searchFilteredIds !== null && searchFilteredIds.length === 0) {
        return {
          page: 1,
          pageSize: 0,
          totalItems: 0,
          items: [],
          self: '',
          first: '',
          last: '',
        } as FixturesResponse;
      }

      // Normal mode: server-side pagination, no search param
      return await apiV2.getFixturesByCompetitions(currentPage, pageSize);
    },
    refetchInterval: 60000, // Auto-refresh every minute
    staleTime: 30000,      // Consider data fresh for 30 seconds
    placeholderData: keepPreviousData, // Use the imported helper function from react-query
  });

  // Handle prefetching next page - only when NOT searching (search uses client-side pagination)
  useEffect(() => {
    if (fixturesData && apiMode === 'competitions' && !isSearchActive) {
      const totalPagesCount = Math.ceil((fixturesData?.totalItems ?? 0) / pageSize);
      if (currentPage < totalPagesCount) {
        prefetchNextPage(currentPage + 1, pageSize, apiMode);
      }
    }
  }, [fixturesData, currentPage, pageSize, prefetchNextPage, apiMode, isSearchActive]);

  // Handle refresh with smooth transition
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Calculate total pages based on total items and page size
  // In search mode, total comes from the client-side filtered IDs count
  const totalPages = useMemo(() => {
    if (isSearchActive && searchFilteredIds !== null) {
      return Math.ceil(searchFilteredIds.length / pageSize);
    }
    return Math.ceil((fixturesData?.totalItems ?? 0) / pageSize);
  }, [fixturesData?.totalItems, pageSize, isSearchActive, searchFilteredIds]);

  // Handle page change with transition to avoid blocking UI
  const handlePageChange = useCallback((page: number) => {
    // Start a transition to avoid blocking UI during state update
    startTransition(() => {
      setCurrentPage(page);
      // Smooth scroll to top of container with RAF for better performance
      if (fixturesContainerRef.current) {
        requestAnimationFrame(() => {
          fixturesContainerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
    });
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((size: number) => {
    startTransition(() => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    });
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearch('');
  }, []);

  // Handle API mode change
  const handleApiModeChange = useCallback((mode: ApiMode) => {
    startTransition(() => {
      setApiMode(mode);
      setCurrentPage(1); // Reset to first page when changing API mode
      if (mode === 'by-ids') {
        setSearch(''); // Clear search when switching to by-ids mode
      }
    });
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  }, [signOut]);

  // Handle navigation to home
  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Animation variants - more performant versions
  const pageTransitionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  // Get loading skeletons when loading
  const renderLoadingState = () => (
    <FixturesTableSkeleton rowCount={6} />
  );

  // Render error state
  const renderErrorState = () => (
    <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
      <CardContent className="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center p-1.5 sm:p-2 mb-2 sm:mb-3 rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-5 sm:h-7 w-5 sm:w-7 text-red-500" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400 mb-1 sm:mb-2">Unable to Load Fixtures</h2>
        <p className="text-sm text-red-600 dark:text-red-300 mb-3 max-w-md">
          There was an error loading the fixture data. Please try refreshing the page.
        </p>
        <Button onClick={handleRefresh} className="bg-red-500 hover:bg-red-600 text-white text-sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );

  // Render empty state - different messages based on API mode
  const renderEmptyState = () => (
    <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/10 h-[60vh] flex flex-col shadow-none">
      <CardContent className="flex flex-col items-center justify-center flex-1 p-0 text-center">
        <div className="flex flex-col items-center justify-center w-full h-full py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
          </motion.div>

          {apiMode === 'competitions' && debouncedSearch ? (
            // Search results empty state for competitions mode
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                No Results Found
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md px-4">
                No fixtures match "{debouncedSearch}". Try a different search term.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleSearchClear}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </motion.div>
          ) : apiMode === 'by-ids' ? (
            // Empty state for by-ids mode
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-4 flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
                <TbPremiumRights className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                No Special Fixtures Available
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md px-4">
                You don't have access to any special fixtures. Contact ersenguvenuk@gmail.com to get access to special fixtures.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-2.5 rounded-lg flex items-center"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>

              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {apiMode === 'by-ids' && 'fixtureIds' in (fixturesData || {}) && (fixturesData as FixturesByIdsResponse).fixtureIds.length > 0
                    ? `Special fixture IDs: ${(fixturesData as FixturesByIdsResponse).fixtureIds.join(', ')}`
                    : 'No special fixtures assigned to this user'
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            // Empty state for competitions mode (no search)
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-4 flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                No Fixtures Available
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md px-4">
                You don't have access to any competitions or there are no fixtures available. Try switching to Special Fixtures mode or contact ersenguvenuk@gmail.com.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-2.5 rounded-lg flex items-center"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>

              <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-500">
                <div className="flex h-2 w-2 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <span>We're checking for new fixtures every minute</span>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Determine if we have fixtures to display
  const hasFixtures = Boolean(fixturesData?.items?.length);



  return (
    <ProtectedRoute>
      {membershipLoading ? (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
          </div>
        </div>
      ) : isExpired ? (
        <MembershipExpiredGate />
      ) : (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
          {/* Header with backdrop blur for better performance and visual aesthetics */}
          <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm will-change-transform">
            <div className="w-full px-4 sm:px-8 md:px-12 mx-auto flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Live Fixtures
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Psychoff Radar Feed System
                    </p>
                  </div>
                </div>
              </div>

              {/* Search input and API mode toggle */}
              <div className="flex-1 flex items-center gap-3 max-w-2xl mx-4 sm:mx-8">
                {/* API Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 min-w-fit">
                  <Button
                    variant={apiMode === 'competitions' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleApiModeChange('competitions')}
                    className={cn(
                      "h-7 px-2 sm:px-3 text-xs sm:text-sm rounded-md transition-all",
                      apiMode === 'competitions'
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                    disabled={isPending || isLoading}
                  >
                    <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="hidden sm:inline">Your Fixtures</span>
                    <span className="sm:hidden">Fixtures</span>
                  </Button>
                  <Button
                    variant={apiMode === 'by-ids' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleApiModeChange('by-ids')}
                    className={cn(
                      "h-7 px-2 sm:px-3 text-xs sm:text-sm rounded-md transition-all",
                      apiMode === 'by-ids'
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                    disabled={isPending || isLoading}
                  >
                    <TbPremiumRights className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="hidden sm:inline">Special Fixtures</span>
                    <span className="sm:hidden">Special</span>
                  </Button>
                </div>

                {/* Search input - only show for competitions mode */}
                {apiMode === 'competitions' && (
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search teams..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 pr-10 h-8 sm:h-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 text-sm"
                    />
                    {search && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSearchClear}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                        <span className="sr-only">Clear search</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Page size selector with optimized rendering */}
                <DropdownMenu>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-9 gap-1 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-3"
                            disabled={isPending || isLoading}
                          >
                            <ListFilter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            <span className="hidden sm:inline">{pageSize} per page</span>
                            <span className="sm:hidden">{pageSize}</span>
                            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Items per page</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="min-w-[100px] sm:min-w-[120px]">
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <DropdownMenuItem
                        key={size}
                        className={cn(
                          "flex items-center justify-between text-xs sm:text-sm",
                          pageSize === size && "font-medium text-blue-600 dark:text-blue-400"
                        )}
                        onClick={() => handlePageSizeChange(size)}
                      >
                        {size} items
                        {pageSize === size && (
                          <span className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isFetching}
                  className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-3"
                >
                  {isRefreshing || isFetching ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <ChannelStatusIndicator />

                <ThemeToggle />

                {/* User Menu */}
                {user && (
                  <DropdownMenu>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 w-8 h-8 sm:w-9 sm:h-9 ring-1 ring-gray-200 dark:ring-gray-700"
                            >
                              <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                </div>
                              </Avatar>
                              <span className="sr-only">User menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Account menu</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                              <User className="h-4 w-4" />
                            </div>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <DropdownMenuItem onClick={handleGoHome} className="text-sm">
                          <User2Icon className="mr-2 h-4 w-4" />
                          <span>Profile Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut} className="text-sm text-red-600 dark:text-red-400">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Stats bar with loading indicator - optimized rendering */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-1.5 sm:py-2 will-change-transform">
            <div className="px-4 sm:px-8 md:px-12 mx-auto flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-3 sm:gap-6">
                <Badge
                  variant="outline"
                  className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                >
                  {isSearchActive && searchFilteredIds !== null
                    ? searchFilteredIds.length
                    : (fixturesData?.totalItems ?? 0)
                  } {
                    apiMode === 'by-ids'
                      ? 'Fixtures by IDs'
                      : debouncedSearch
                        ? 'Results'
                        : 'Total Fixtures'
                  }
                </Badge>

                {apiMode === 'competitions' && debouncedSearch && (
                  <Badge
                    variant="secondary"
                    className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  >
                    Search: "{debouncedSearch}"
                  </Badge>
                )}

                <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  <div className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span>
                  </div>
                  <span>Auto-refreshes every minute</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs sm:h-8">
                      <Settings2 className="mr-2 h-3.5 w-3.5" />
                      Columns
                      <ChevronDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {TABLE_COLUMNS.filter((col) => col.canHide).map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={columnVisibility[column.id] !== false}
                          onCheckedChange={(value) =>
                            setColumnVisibility((prev) => ({
                              ...prev,
                              [column.id]: !!value,
                            }))
                          }
                        >
                          <div className="flex items-center gap-2">
                            <column.icon className="h-4 w-4 text-gray-500" />
                            <span>{column.label}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Page {currentPage} of {totalPages || 1}</span>
                  {isPending && (
                    <span className="ml-2 text-amber-500 animate-pulse">
                      <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline mr-1 animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content with optimized rendering */}
          <main className="flex-1 overflow-hidden">
            <div
              id="fixtures-container"
              ref={fixturesContainerRef}
              className="h-full overflow-auto pb-10 overscroll-y-contain flex flex-col"
            >
              <div className="w-full px-12 mx-auto py-6">
                <AnimatePresence mode="wait" initial={false}>
                  {isLoading ? (
                    // Loading state
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderLoadingState()}
                    </motion.div>
                  ) : isError ? (
                    // Error state
                    <motion.div
                      key="error"
                      variants={pageTransitionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {renderErrorState()}
                    </motion.div>
                  ) : !hasFixtures ? (
                    // Empty state
                    <motion.div
                      key="empty"
                      variants={pageTransitionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {renderEmptyState()}
                    </motion.div>
                  ) : (
                    // Success state with fixtures
                    <motion.div
                      key={`fixtures-page-${currentPage}-${pageSize}-${debouncedSearch}`}
                      variants={pageTransitionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <FixturesTableV2
                        fixtures={fixturesData?.items ?? []}
                        columnVisibility={columnVisibility}
                        onColumnVisibilityChange={setColumnVisibility}
                        columnSizing={columnSizing}
                        onColumnSizingChange={setColumnSizing}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination - only show when we have fixtures and aren't in initial loading, and only for competitions mode */}
                {hasFixtures && apiMode === 'competitions' && (
                  <PaginationV2
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                    isLoading={isPending}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </ProtectedRoute >
  );
} 