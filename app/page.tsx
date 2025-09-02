'use client'

import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserHeader } from '@/components/auth/user-header';
import { useAuth } from '@/components/auth/auth-provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUserMembership } from '@/hooks/use-user-membership';
import { useUserLeagues } from '@/hooks/use-user-leagues';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Calendar, Shield, Package, Trophy, ArrowRight, Star, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TbWorldWww } from 'react-icons/tb';

export default function Home() {
  const { user } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const { membership, loading: membershipLoading } = useUserMembership();
  const { leagues, loading: leaguesLoading } = useUserLeagues();
  const router = useRouter();

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

  const membershipStatus = membership?.expiry_date ? getMembershipStatus(membership.expiry_date) : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900">
        <UserHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
            <div className="w-full max-w-4xl">
              {/* Profile Header - Centered */}
              <div className="flex flex-col items-center mb-10">
                <Avatar className="h-20 w-20 mb-4">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </Avatar>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {profile?.full_name || 'User Profile'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                  {profile?.role && profile.role !== 'user' && (
                    <Badge variant="secondary" className="mt-2">
                      {profile.role.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Actions Navigation - Symmetric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {/* Live Fixtures Card */}
                <Card 
                  className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                  onClick={() => router.push('/feeds')}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-blue-500 text-white mb-3">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Live Fixtures</h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                        Watch live matches and real-time updates
                      </p>
                      <Button 
                        size="sm" 
                        className="bg-blue-500 hover:bg-blue-600 text-white border-0 w-full"
                      >
                        View Fixtures
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Panel Card - Only for admins */}
                {isAdmin ? (
                  <Card 
                    className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    onClick={() => router.push('/admin')}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-full bg-amber-500 text-white mb-3">
                          <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">Admin Panel</h3>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                          Manage users and system settings
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-amber-500 hover:bg-amber-600 text-white border-0 w-full"
                        >
                          Open Admin
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Psychoff Website Card for non-admins
                  <Card 
                    className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    onClick={() => window.open('https://www.psychoff.co.uk/psychoff-radar', '_blank')}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-full bg-purple-500 text-white mb-3">
                          <TbWorldWww className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Psychoff Radar</h3>
                        <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
                          Check our main website for discounts and news
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-purple-500 hover:bg-purple-600 text-white border-0 w-full"
                        >
                          Visit Website
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Membership Information Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">Membership Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Membership Status Card */}
                <Card className="border-0 shadow-sm bg-white dark:bg-gray-800/80">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col items-center">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-3">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Membership Status
                      </CardTitle>
                      {membershipLoading ? (
                        <div className="mt-2 h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      ) : membershipStatus ? (
                        <Badge variant={membershipStatus.variant} className="mt-2">
                          {membershipStatus.text}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-2">
                          No Active Membership
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Status</p>
                        {membershipLoading ? (
                          <div className="mt-1 h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto" />
                        ) : (
                          <p className="text-gray-900 dark:text-white capitalize mt-1">
                            {membership?.status || 'No membership'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Membership Dates Card */}
                <Card className="border-0 shadow-sm bg-white dark:bg-gray-800/80">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col items-center">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 mb-3">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Membership Dates
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {membershipLoading ? (
                      <div className="space-y-4">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </div>
                    ) : membership ? (
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/70 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">Start Date</span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatDate(membership.start_date)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/70 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">Expiry Date</span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatDate(membership.expiry_date)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No membership dates available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Products/Leagues Access Card */}
              <Card className="mt-5 border-0 shadow-sm bg-white dark:bg-gray-800/80">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                      <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isAdmin ? 'Admin Access' : 'Your Products'}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin ? 'You have full access to all leagues and content' : 'Leagues and content you have access to'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAdmin ? (
                    <div className="text-center py-8">
                      <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/50 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Shield className="h-10 w-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Full Administrative Access
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        As an administrator, you have complete access to all leagues, fixtures, and system features.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                          <Star className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                          <p className="text-xs font-medium text-green-700 dark:text-green-300">All Leagues</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">All Fixtures</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Admin Tools</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {leaguesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : leagues.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {leagues.map((access) => (
                            <div 
                              key={access.id}
                              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/70 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {access.league.display_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {access.league.country || 'Global'}
                                </p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                Active
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            You don't have access to any leagues yet
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                            Contact support to get access to leagues
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}