import { useState } from 'react';
import { UserDetails } from '@/lib/admin-service';
import { cn } from '@/lib/utils';
import { UserStatusBadge } from '@/components/admin/user-status-badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsersTableProps {
  users: UserDetails[];
  loading: boolean;
  selectedUsers: Set<string>;
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails?: (userId: string) => void;
}

export function UsersTable({ 
  users, 
  loading, 
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onViewDetails
}: UsersTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No users found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  const allSelected = users.length > 0 && users.every(user => selectedUsers.has(user.id));
  const someSelected = users.some(user => selectedUsers.has(user.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all users"
              className={cn(
                someSelected && !allSelected && "data-[state=checked]:bg-gray-400"
              )}
            />
          </TableHead>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Leagues</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelected = selectedUsers.has(user.id);
          return (
            <TableRow 
              key={user.id}
              className={cn(
                "transition-colors cursor-pointer",
                isSelected && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              )}
              onClick={() => onUserSelect(user.id, !isSelected)}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onUserSelect(user.id, !!checked)}
                  aria-label={`Select user ${user.email}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.full_name || 'Unnamed User'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <UserStatusBadge user={user} />
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.league_count} leagues
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(user.expiry_date)}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(user.id);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}