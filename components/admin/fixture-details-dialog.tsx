import { useState, useEffect } from 'react';
import { adminService, UserFixtureAccessWithDetails } from '@/lib/admin-service';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FixtureDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  fixturesWithAccess: UserFixtureAccessWithDetails[];
  loading: boolean;
  onRemoveUserAccess: (userId: string, fixtureId: string) => Promise<void>;
  removingUserId: string | null;
}

export function FixtureDetailsDialog({ 
  open, 
  onOpenChange, 
  userId,
  fixturesWithAccess,
  loading,
  onRemoveUserAccess,
  removingUserId
}: FixtureDetailsDialogProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Fixtures Accessible by User</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading fixtures with access...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Fixture Details</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Granted At</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixturesWithAccess.map((fixtureAccess, index) => {
                  const fixture = fixtureAccess.fixture_details;
                  return (
                    <TableRow key={fixtureAccess.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {fixture?.name || fixtureAccess.fixture_name || fixtureAccess.fixture_id}
                        </div>
                        {fixture?.round?.name && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {fixture.round.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {fixture?.competition?.name || 'Unknown Competition'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {fixture?.startDate ? formatDate(fixture.startDate) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {fixture?.venue?.name || 'TBD'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(fixtureAccess.granted_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveUserAccess(userId || '', fixtureAccess.fixture_id)}
                          disabled={removingUserId === userId || !userId}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          {removingUserId === userId ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {fixturesWithAccess.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No fixtures accessible by this user
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}