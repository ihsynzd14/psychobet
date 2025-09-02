import { Button } from '@/components/ui/button';
import { Users, Trophy, Zap, X } from 'lucide-react';

interface FixturesSelectionSummaryProps {
  selectedUsersCount: number;
  selectedFixturesCount: number;
  onViewSelectedUsers: () => void;
  onViewSelectedFixtures: () => void;
  onGrantAccess: () => void;
  onRevokeAccess: () => void;
}

export function FixturesSelectionSummary({ 
  selectedUsersCount, 
  selectedFixturesCount, 
  onViewSelectedUsers, 
  onViewSelectedFixtures, 
  onGrantAccess, 
  onRevokeAccess 
}: FixturesSelectionSummaryProps) {
  if (selectedUsersCount === 0 && selectedFixturesCount === 0) {
    return null;
  }

  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedUsersCount} user{selectedUsersCount !== 1 ? 's' : ''} selected
            </span>
            {selectedUsersCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs dark:border-gray-600 dark:text-gray-300"
                onClick={onViewSelectedUsers}
              >
                View
              </Button>
            )}
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedFixturesCount} fixture{selectedFixturesCount !== 1 ? 's' : ''} selected
            </span>
            {selectedFixturesCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs dark:border-gray-600 dark:text-gray-300"
                onClick={onViewSelectedFixtures}
              >
                View
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onGrantAccess}
            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
            disabled={selectedUsersCount === 0 || selectedFixturesCount === 0}
          >
            <Zap className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Grant Access</span>
          </Button>
          <Button
            size="sm"
            onClick={onRevokeAccess}
            variant="destructive"
            className="h-8 px-3"
            disabled={selectedUsersCount === 0 || selectedFixturesCount === 0}
          >
            <X className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Revoke</span>
          </Button>
        </div>
      </div>
    </div>
  );
}