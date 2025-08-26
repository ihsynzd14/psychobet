'use client'

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminService, UserDetails } from '@/lib/admin-service';
import { UserEditModal } from '@/components/admin/user-edit-modal';
import {
  Search,
  MoreHorizontal,
  Plus,
  Edit3,
  Trash2,
  Crown,
  Users,
  Filter,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface UsersPageState {
  users: UserDetails[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  deleteUser: UserDetails | null;
  editUser: UserDetails | null;
  deleting: boolean;
}

function UserStatusBadge({ user }: { user: UserDetails }) {
  const getStatusConfig = () => {
    switch (user.membership_health) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Active',
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'expiring_soon':
        return {
          variant: 'secondary' as const,
          icon: AlertTriangle,
          text: 'Expiring Soon',
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
        };
      case 'expired':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          text: 'Expired',
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: XCircle,
          text: 'No Membership',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
}

function UserRoleBadge({ role }: { role: string }) {
  const roleConfig = {
    admin: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: Crown },
    super_admin: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: Crown },
    user: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Users }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={config.color}>
      <IconComponent className="h-3 w-3 mr-1" />
      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
}

function UserActionsMenu({ 
  user, 
  onEdit, 
  onDelete 
}: { 
  user: UserDetails; 
  onEdit: (user: UserDetails) => void;
  onDelete: (user: UserDetails) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(user)}
          className="text-red-600 dark:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UsersTable({ 
  users, 
  loading, 
  onEdit, 
  onDelete 
}: { 
  users: UserDetails[];
  loading: boolean;
  onEdit: (user: UserDetails) => void;
  onDelete: (user: UserDetails) => void;
}) {
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
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8" />
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
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Try adjusting your search criteria or add a new user.
        </p>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Membership</TableHead>
          <TableHead>Leagues</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
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
              <UserRoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <UserStatusBadge user={user} />
              </div>
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
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(user.user_created_at)}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <UserActionsMenu 
                user={user} 
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function UsersPage() {
  const [state, setState] = useState<UsersPageState>({
    users: [],
    loading: true,
    error: null,
    searchTerm: '',
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    deleteUser: null,
    editUser: null,
    deleting: false
  });

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await adminService.getAllUsers(page, 20, search || undefined);
      
      setState(prev => ({
        ...prev,
        users: result.users,
        currentPage: page,
        totalPages: result.totalPages,
        totalUsers: result.total,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load users',
        loading: false
      }));
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, state.searchTerm);
  }, [fetchUsers, state.searchTerm]);

  const handleSearch = (value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  };

  const handleEdit = (user: UserDetails) => {
    setState(prev => ({ ...prev, editUser: user }));
  };

  const handleDelete = (user: UserDetails) => {
    setState(prev => ({ ...prev, deleteUser: user }));
  };

  const confirmDelete = async () => {
    if (!state.deleteUser) return;

    try {
      setState(prev => ({ ...prev, deleting: true }));
      
      await adminService.deleteUser(state.deleteUser.id);
      await adminService.logActivity(
        'user_deleted',
        `Deleted user: ${state.deleteUser.email}`,
        state.deleteUser.id
      );
      
      toast.success('User deleted successfully');
      setState(prev => ({ ...prev, deleteUser: null, deleting: false }));
      fetchUsers(state.currentPage, state.searchTerm);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      setState(prev => ({ ...prev, deleting: false }));
    }
  };

  const cancelDelete = () => {
    setState(prev => ({ ...prev, deleteUser: null }));
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Users Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage user accounts, memberships, and permissions
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Users</CardTitle>
              <CardDescription>
                Find users by email or name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by email or name..."
                    value={state.searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => fetchUsers(state.currentPage, state.searchTerm)}
                  disabled={state.loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Users
                  </CardTitle>
                  <CardDescription>
                    {state.loading ? 'Loading...' : `${state.totalUsers} total users`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <UsersTable
                users={state.users}
                loading={state.loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {/* Pagination */}
          {state.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => fetchUsers(state.currentPage - 1, state.searchTerm)}
                disabled={state.currentPage <= 1 || state.loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {state.currentPage} of {state.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchUsers(state.currentPage + 1, state.searchTerm)}
                disabled={state.currentPage >= state.totalPages || state.loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        <UserEditModal
          user={state.editUser}
          open={!!state.editUser}
          onOpenChange={(open) => {
            if (!open) {
              setState(prev => ({ ...prev, editUser: null }));
            }
          }}
          onUserUpdated={() => {
            fetchUsers(state.currentPage, state.searchTerm);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!state.deleteUser} onOpenChange={cancelDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{state.deleteUser?.email}</strong>? 
                This action cannot be undone and will remove all user data including memberships and league access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={state.deleting}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {state.deleting ? 'Deleting...' : 'Delete User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}