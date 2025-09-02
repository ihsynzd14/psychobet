import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersTable } from '@/components/admin/users-table';
import { SearchInput } from '@/components/admin/search-input';
import { Users } from 'lucide-react';
import { UserDetails } from '@/lib/admin-service';

interface FixturesUsersSectionProps {
  users: UserDetails[];
  loadingUsers: boolean;
  selectedUsers: Set<string>;
  userSearchTerm: string;
  onUserSearch: (value: string) => void;
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAllUsers: (selected: boolean) => void;
  onViewUserDetails?: (userId: string) => void;
}

export function FixturesUsersSection({ 
  users, 
  loadingUsers, 
  selectedUsers, 
  userSearchTerm, 
  onUserSearch, 
  onUserSelect, 
  onSelectAllUsers,
  onViewUserDetails
}: FixturesUsersSectionProps) {
  return (
    <div className="w-2/5 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden">
      <Card className="flex-1 flex flex-col min-h-0 dark:bg-gray-800/80 dark:border-gray-700 rounded-none border-0">
        <CardHeader className="flex-shrink-0 p-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
            <Users className="h-5 w-5" />
            Users
          </CardTitle>
          <CardDescription className="dark:text-gray-400 text-sm">
            Select users to manage fixture access
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <SearchInput
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={onUserSearch}
            />
          </div>
          
          {/* Users Table */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <UsersTable
              users={users}
              loading={loadingUsers}
              selectedUsers={selectedUsers}
              onUserSelect={onUserSelect}
              onSelectAll={onSelectAllUsers}
              onViewDetails={onViewUserDetails}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}