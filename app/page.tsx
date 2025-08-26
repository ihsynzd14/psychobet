'use client'

import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserHeader } from '@/components/auth/user-header';
import { useAuth } from '@/components/auth/auth-provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Calendar, Shield, Package, Trophy, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const router = useRouter();

  // Mock data for demonstration - replace with actual Supabase data later
  const membershipData = {
    startDate: '2024-01-15',
    expiryDate: '2024-12-15',
    status: 'active', // active, expired, suspended
    leagues: [], // Will be populated from Supabase later
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMembershipStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return { status: 'expired', variant: 'destructive' as const, text: 'Expired' };
    if (daysRemaining <= 30) return { status: 'expiring', variant: 'secondary' as const, text: `${daysRemaining} days left` };
    return { status: 'active', variant: 'default' as const, text: 'Active' };
  };

  const membershipStatus = getMembershipStatus(membershipData.expiryDate);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <UserHeader />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <div className="flex h-full w-full items-center justify-center bg-gray-300 dark:bg-gray-600">
                  <User className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                </div>
              </Avatar>
              <div>
                <h1 className="text-3xl font-light text-gray-900 dark:text-white">
                  Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Navigation */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {/* Live Fixtures Card - Enhanced */}
            <Card 
              className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-20"
              onClick={() => router.push('/feeds')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-blue-500 text-white">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Live Fixtures</h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                      Watch live matches and real-time updates
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                    >
                      View Fixtures
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel Card - Only for admins */}
            {isAdmin && (
              <Card 
                className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-20"
                onClick={() => router.push('/admin')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-amber-500 text-white">
                          <Shield className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Admin Panel</h3>
                      </div>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                        Manage users and system settings
                      </p>
                      <Button 
                        size="sm" 
                        className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                      >
                        Open Admin
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Membership Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Membership Information</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Membership Status Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Membership Status
                  </CardTitle>
                  <Badge variant={membershipStatus.variant}>
                    {membershipStatus.text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Status</p>
                    <p className="text-gray-900 dark:text-white capitalize">{membershipData.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Dates Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Membership Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Start Date</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(membershipData.startDate)}</span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Expiry Date</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(membershipData.expiryDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products/Leagues Access Card */}
          <Card className="mt-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Your Products
              </CardTitle>
              <CardDescription>
                Leagues and content you have access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your league access will be displayed here
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                  This will be implemented when Supabase integration is complete
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}