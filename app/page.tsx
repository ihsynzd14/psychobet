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
      <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 flex flex-col">
        <UserHeader />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl h-full">
            <div className="h-full flex flex-col gap-4">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-gray-100 dark:ring-gray-800">
                    <div className="flex h-full w-full items-center justify-center bg-blue-600 dark:bg-blue-500">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {profile?.full_name || 'User Profile'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  {profile?.role && profile.role !== 'user' && (
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {profile.role.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                {/* Live Fixtures Card */}
                <Card 
                  className="group border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-900 cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={() => router.push('/feeds')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Live Fixtures</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 leading-relaxed">
                          Watch live matches and real-time updates
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-xs group-hover:gap-2 transition-all">
                          View Fixtures
                          <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Panel Card - Only for admins */}
                {isAdmin ? (
                  <Card 
                    className="group border-2 border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-gray-900 cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => router.push('/admin')}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Admin Panel</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 leading-relaxed">
                            Manage users and system settings
                          </p>
                          <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold text-xs group-hover:gap-2 transition-all">
                            Open Admin
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Psychoff Website Card for non-admins
                  <Card 
                    className="group border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-gray-900 cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => window.open('https://www.psychoff.co.uk/psychoff-radar', '_blank')}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                          <TbWorldWww className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Psychoff Radar</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 leading-relaxed">
                            Check our main website for discounts and news
                          </p>
                          <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold text-xs group-hover:gap-2 transition-all">
                            Visit Website
                            <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Membership Information Section */}
              <div className="flex-1 min-h-0 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex-shrink-0">Membership Overview</h2>
              
              <div className="grid grid-cols-1 gap-4 flex-shrink-0">
                {/* Membership Status Card */}
                <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          Membership Status
                        </CardTitle>
                        {membershipLoading ? (
                          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        ) : membershipStatus ? (
                          <Badge variant={membershipStatus.variant} className="text-xs px-2 py-0.5">
                            {membershipStatus.text}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            No Active Membership
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Status</p>
                      {membershipLoading ? (
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : (
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                          {membership?.status || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                      {membershipLoading ? (
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : (
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {membership ? formatDate(membership.start_date) : 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expiry Date</p>
                      {membershipLoading ? (
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : (
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {membership ? formatDate(membership.expiry_date) : 'N/A'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Products/Leagues Access Card */}
              <Card className="mt-4 border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-[400px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                      <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                        {isAdmin ? 'Admin Access' : 'Your Products'}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {isAdmin ? 'Full access to all leagues' : 'Leagues you have access to'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto">
                  {isAdmin ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-600 dark:bg-green-500">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              Full Administrative Access
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              Complete system access
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 w-fit mx-auto mb-2">
                            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">All Leagues</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 w-fit mx-auto mb-2">
                            <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">All Fixtures</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 w-fit mx-auto mb-2">
                            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Admin Tools</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {leaguesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : leagues.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {leagues.map((access) => (
                            <div
                              key={access.id}
                              className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-500 hover:-translate-y-1"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                                  <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {access.league.display_name}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {access.league.country || 'Global'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Active
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 w-fit mx-auto mb-3">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                            No leagues available
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Contact support to get access
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}