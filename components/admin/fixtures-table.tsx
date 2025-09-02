import { useState } from 'react';
import { FixtureV2 } from '@/lib/api-v2';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, Clock } from 'lucide-react';

interface FixturesTableProps {
  fixtures: FixtureV2[];
  loading: boolean;
  selectedFixtures: Set<string>;
  onFixtureSelect: (fixtureId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export function FixturesTable({ 
  fixtures, 
  loading, 
  selectedFixtures,
  onFixtureSelect,
  onSelectAll
}: FixturesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No fixtures found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  const allSelected = fixtures.length > 0 && fixtures.every(fixture => selectedFixtures.has(String(fixture.id)));
  const someSelected = fixtures.some(fixture => selectedFixtures.has(String(fixture.id)));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all fixtures"
              className={cn(
                someSelected && !allSelected && "data-[state=checked]:bg-gray-400"
              )}
            />
          </TableHead>
          <TableHead>Match</TableHead>
          <TableHead>Competition</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fixtures.map((fixture) => {
          const fixtureIdStr = String(fixture.id);
          const isSelected = selectedFixtures.has(fixtureIdStr);
          return (
            <TableRow 
              key={fixture.id}
              className={cn(
                "transition-colors cursor-pointer",
                isSelected && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              )}
              onClick={() => onFixtureSelect(fixtureIdStr, !isSelected)}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onFixtureSelect(fixtureIdStr, !!checked)}
                  aria-label={`Select fixture ${fixture.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium text-gray-900 dark:text-white">
                  {fixture.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {fixture.homeCompetitor.name} vs {fixture.competitors.find(c => c.id !== fixture.homeCompetitor.id)?.name || 'Opponent'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-900 dark:text-white">
                  {fixture.competition.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(fixture.startDate)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  fixture.eventStatusType === 'Notstarted' ? 'secondary' : 
                  fixture.eventStatusType === 'Live' ? 'default' : 'outline'
                }>
                  <Clock className="mr-1 h-3 w-3" />
                  {fixture.eventStatusType}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}