import { memo, useMemo, useState } from 'react';
import {
  Trophy,
  Calendar,
  Shield,
  Play,
  Clock,
  Users,
  Target,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { FixtureV2 } from '@/lib/api-v2';
import React from 'react';
import { ChannelSelectionDialog } from '@/components/channel-selection-dialog';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  OnChangeFn,
  ColumnSizingState,
} from "@tanstack/react-table";

// Export column config for parent to build the toggle menu
export const TABLE_COLUMNS = [
  { id: 'teams', label: 'Teams', canHide: false, icon: Users },
  { id: 'competition', label: 'Competition', canHide: true, icon: Trophy },
  { id: 'time', label: 'Time', canHide: true, icon: Clock },
  { id: 'round', label: 'Round', canHide: true, icon: Shield },
  { id: 'action', label: 'Action', canHide: false, icon: Target },
];

interface FixturesTableV2Props {
  fixtures: FixtureV2[];
  isLoading?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
}

// Extract team metadata with proper typing
function getMetadataValue(competitor: any, propertyName: string): string {
  if (!competitor?.metadataProperties) return '';

  // Handle array format (more common in real APIs)
  if (Array.isArray(competitor.metadataProperties)) {
    const prop = competitor.metadataProperties.find(
      (prop: any) => prop.name === propertyName
    );
    return prop?.value || '';
  }

  // Handle object format (fallback)
  return competitor.metadataProperties[propertyName] || '';
}

function FixturesTableV2Component({
  fixtures,
  isLoading,
  columnVisibility = {},
  onColumnVisibilityChange,
  columnSizing = {},
  onColumnSizingChange,
}: FixturesTableV2Props) {
  // State for channel selection dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | number>('');

  // Local state callback if no prop provided (though intended to be controlled)
  const [localColumnVisibility, setLocalColumnVisibility] = useState<VisibilityState>({});
  const [localColumnSizing, setLocalColumnSizing] = useState<ColumnSizingState>({});

  const finalColumnVisibility = onColumnVisibilityChange ? columnVisibility : localColumnVisibility;
  const finalSetColumnVisibility = onColumnVisibilityChange || setLocalColumnVisibility;

  const finalColumnSizing = onColumnSizingChange ? columnSizing : localColumnSizing;
  const finalSetColumnSizing = onColumnSizingChange || setLocalColumnSizing;

  const columns = useMemo<ColumnDef<FixtureV2>[]>(() => [
    {
      id: "teams",
      enableHiding: false, // Ensures this column is always visible/toggled
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Teams</span>
        </div>
      ),
      accessorFn: (row) => row.name, // Accessor for search/sorting later if needed
      cell: ({ row }) => {
        const fixture = row.original;
        const homeTeam = fixture.competitors?.find(c => c.id === fixture.homeCompetitor?.id);
        const awayTeam = fixture.competitors?.find(c => c.id !== fixture.homeCompetitor?.id);

        if (!homeTeam || !awayTeam) return null;

        const homeShortName = getMetadataValue(homeTeam, 'ShortName') || homeTeam.name;
        const awayShortName = getMetadataValue(awayTeam, 'ShortName') || awayTeam.name;
        const isLive = fixture.eventStatusType === 'InProgress' || fixture.eventStatusType === 'Live';
        const isCompleted = fixture.eventStatusType === 'Finished';

        return (
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Image
                  src="/favicon.ico"
                  alt="Team logo"
                  fill
                  sizes="32px"
                  className="object-contain p-1"
                  priority
                />
              </div>
              {isLive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {fixture.name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {homeShortName || homeTeam.name}
                </span>
                <span className="text-xs text-gray-400">vs</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {awayShortName || awayTeam.name}
                </span>
              </div>

              <div className="mt-1">
                {isLive && (
                  <Badge className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    LIVE
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Finished
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
      size: 300,
    },
    {
      id: "competition",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Competition</span>
        </div>
      ),
      cell: ({ row }) => {
        const fixture = row.original;
        return (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {fixture.competition.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {fixture.sport.name}
              </div>
            </div>
          </div>
        );
      },
      size: 200,
    },
    {
      id: "time",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Time</span>
        </div>
      ),
      cell: ({ row }) => {
        const fixture = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Date(fixture.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(fixture.startDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </div>
            </div>
          </div>
        );
      },
      size: 150,
    },
    {
      id: "round",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Round</span>
        </div>
      ),
      cell: ({ row }) => {
        const fixture = row.original;
        return (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
              {fixture.round?.name || 'Regular Season'}
            </span>
          </div>
        );
      },
      size: 150,
    },
    {
      id: "action",
      enableHiding: false, // Action column should always be visible
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-2">
          <span>Action</span>
          <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
      ),
      cell: ({ row }) => {
        const fixture = row.original;
        const isLive = fixture.eventStatusType === 'InProgress' || fixture.eventStatusType === 'Live';
        return (
          <div className="text-right">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setSelectedFixtureId(fixture.id);
                setIsDialogOpen(true);
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              {isLive ? 'Live' : 'View'}
            </Button>
          </div>
        );
      },
      size: 100,
    },
  ], []);

  const table = useReactTable({
    data: fixtures,
    columns,
    state: {
      columnVisibility: finalColumnVisibility,
      columnSizing: finalColumnSizing,
    },
    onColumnVisibilityChange: finalSetColumnVisibility,
    onColumnSizingChange: finalSetColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  });

  return (
    <div className="w-full space-y-4">
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="relative border-r border-gray-200 dark:border-gray-800 last:border-0"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity",
                          header.column.getIsResizing() && "bg-blue-500 opacity-100"
                        )}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Channel Selection Dialog */}
      <ChannelSelectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fixtureId={selectedFixtureId}
      />
    </div>
  );
}

// Memoize the component for performance
export const FixturesTableV2 = memo(FixturesTableV2Component);