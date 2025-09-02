'use client'

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/lib/admin-service';
import {
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  expiringUsers: number;
  newUsersThisMonth: number;
}

interface RecentActivity {
  id: string;
  action_type: string;
  action_description: string;
  created_at: string;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'blue',
  trend 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:shadow-gray-900/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
          {trend && (
            <Badge variant="secondary" className="text-xs dark:bg-gray-700/70 dark:text-gray-300">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Common administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button asChild variant="default" className="h-10 w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            <Link href="/admin/users/new" className="flex items-center justify-center">
              <Users className="mr-2 h-4 w-4" />
              Add New User
            </Link>
          </Button>
          <Button asChild variant="default" className="h-10 w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            <Link href="/admin/users" className="flex items-center justify-center">
              <UserCheck className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="default" className="h-10 w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            <Link href="/admin/fixtures" className="flex items-center justify-center">
              <Trophy className="mr-2 h-4 w-4" />
              Manage Fixtures
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard({ activities, loading }: { activities: RecentActivity[]; loading: boolean }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_created':
        return <Users className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'membership_updated':
        return <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'league_granted':
        return <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'fixture_access_granted':
        return <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Latest administrative actions
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="dark:text-gray-200 dark:hover:bg-gray-700">
            <Link href="/admin/logs">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full dark:bg-gray-700" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 dark:bg-gray-700" />
                  <Skeleton className="h-3 w-1/2 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.action_description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardStats, activityLogs] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getActivityLogs(1, 10)
        ]);
        
        setStats(dashboardStats);
        setActivities(activityLogs.logs);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <ProtectedRoute >
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome to the admin panel. Manage users, memberships, and content access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={loading ? 0 : stats?.totalUsers || 0}
              description="All registered users"
              icon={Users}
              color="blue"
              trend={stats ? `+${stats.newUsersThisMonth} this month` : undefined}
            />
            <StatCard
              title="Active Users"
              value={loading ? 0 : stats?.activeUsers || 0}
              description="Users with active memberships"
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Expiring Soon"
              value={loading ? 0 : stats?.expiringUsers || 0}
              description="Users expiring in 30 days"
              icon={AlertTriangle}
              color="orange"
            />
            <StatCard
              title="Growth Rate"
              value={loading ? '0%' : stats ? `${Math.round((stats.newUsersThisMonth / stats.totalUsers) * 100) || 0}%` : '0%'}
              description="New users this month"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <QuickActions />
              <RecentActivityCard activities={activities} loading={loading} />
            </div>
            
            <div className="space-y-6">
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Trophy className="h-5 w-5" />
                    Fixture Access Management
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Manage user access to specific fixtures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Use the fixture access manager to grant or revoke access to specific matches for individual users or groups.
                    </p>
                    <Button asChild className="w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                      <Link href="/admin/fixtures">
                        Manage Fixture Access
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-800/80 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                      <Badge variant="secondary" className="dark:bg-green-900/30 dark:text-green-400">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">API</span>
                      <Badge variant="secondary" className="dark:bg-green-900/30 dark:text-green-400">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                      <Badge variant="secondary" className="dark:bg-green-900/30 dark:text-green-400">
                        Operational
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}