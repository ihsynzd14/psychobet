import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixturesTable } from '@/components/admin/fixtures-table';
import { SearchInput } from '@/components/admin/search-input';
import { FixturesPagination } from '@/components/admin/fixtures-pagination';
import { Trophy, RefreshCw } from 'lucide-react';
import { FixtureV2 } from '@/lib/api-v2';

interface FixturesSectionProps {
  fixtures: FixtureV2[];
  loadingFixtures: boolean;
  selectedFixtures: Set<string>;
  fixtureSearchTerm: string;
  currentPage: number;
  totalPages: number;
  loadingFixturesFlag: boolean;
  onFixtureSearch: (value: string) => void;
  onFixtureSelect: (fixtureId: string, selected: boolean) => void;
  onSelectAllFixtures: (selected: boolean) => void;
  onRefresh: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function FixturesSection({ 
  fixtures, 
  loadingFixtures, 
  selectedFixtures, 
  fixtureSearchTerm, 
  currentPage, 
  totalPages, 
  loadingFixturesFlag,
  onFixtureSearch, 
  onFixtureSelect, 
  onSelectAllFixtures, 
  onRefresh, 
  onPreviousPage, 
  onNextPage 
}: FixturesSectionProps) {
  return (
    <div className="w-3/5 flex flex-col overflow-hidden">
      <Card className="flex-1 flex flex-col min-h-0 dark:bg-gray-800/80 dark:border-gray-700 rounded-none border-0 border-l-0">
        <CardHeader className="flex-shrink-0 p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                <Trophy className="h-5 w-5" />
                Fixtures
              </CardTitle>
              <CardDescription className="dark:text-gray-400 text-sm">
                Select fixtures to grant or revoke access
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loadingFixturesFlag}
                className="h-8 px-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${loadingFixturesFlag ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
          {/* Search and Actions */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <div className="relative flex-1">
              <SearchInput
                placeholder="Search fixtures..."
                value={fixtureSearchTerm}
                onChange={onFixtureSearch}
              />
            </div>
          </div>
          
          {/* Fixtures Table */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <FixturesTable
              fixtures={fixtures}
              loading={loadingFixtures}
              selectedFixtures={selectedFixtures}
              onFixtureSelect={onFixtureSelect}
              onSelectAll={onSelectAllFixtures}
            />
          </div>
          
          <FixturesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
            loading={loadingFixturesFlag}
          />
        </CardContent>
      </Card>
    </div>
  );
}