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
import { User, Calendar, Shield, Package, Trophy, ArrowRight, Star, ExternalLink, Activity, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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
      month: 'short',
      day: '2-digit',
    });
  };

  const getMembershipStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return {
      status: 'expired',
      variant: 'destructive' as const,
      text: 'Expired',
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    };
    if (daysRemaining <= 30) return {
      status: 'expiring',
      variant: 'secondary' as const,
      text: `${daysRemaining}d left`,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    };
    return {
      status: 'active',
      variant: 'default' as const,
      text: 'Active',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30'
    };
  };

  const membershipStatus = membership?.expiry_date ? getMembershipStatus(membership.expiry_date) : null;
  const StatusIcon = membershipStatus?.icon || Activity;

  const getDaysProgress = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const start = new Date(membership?.start_date || now);
    const totalDuration = expiry.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    return progress;
  };

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
        <UserHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl h-full">
            <div className="h-full flex flex-col gap-5">

              {/* Profile Section - Technical Header */}
              <div className="bg-white dark:bg-slate-900 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className="w-full h-full border-2 border-current rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                </div>
                <div className="p-6 flex items-center gap-5 relative">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-blue-500/20 dark:ring-blue-400/20">
                      <div className="flex h-full w-full items-center justify-center bg-blue-600 dark:bg-blue-500">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {profile?.full_name || 'User Profile'}
                      </h1>
                      {profile?.role && profile.role !== 'user' && (
                        <Badge className="text-xs font-mono px-2 py-0.5 bg-blue-500 text-white border-0">
                          {profile.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {user?.email}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Technical Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Live Fixtures Card */}
                <div
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                  onClick={() => router.push('/feeds')}
                  style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 dark:bg-blue-400 group-hover:w-1.5 transition-all duration-300"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                    <Trophy className="h-full w-full text-blue-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                          <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                          Live Fixtures
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                          Real-time match updates and live scores
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all">
                          <span className="font-mono">VIEW_FIXTURES →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Panel / Psychoff Website Card */}
                {isAdmin ? (
                  <div
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                    onClick={() => router.push('/admin')}
                    style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 dark:bg-amber-400 group-hover:w-1.5 transition-all duration-300"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                      <Shield className="h-full w-full text-amber-500" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
                            <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                            Admin Panel
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                            System administration and user management
                          </p>
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm group-hover:gap-3 transition-all">
                            <span className="font-mono">OPEN_ADMIN →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                    onClick={() => window.open('https://www.psychoff.co.uk/psychoff-radar', '_blank')}
                    style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 dark:bg-purple-400 group-hover:w-1.5 transition-all duration-300"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                      <TbWorldWww className="h-full w-full text-purple-500" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 group-hover:bg-purple-500 group-hover:border-purple-500 transition-all duration-300">
                            <TbWorldWww className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                            Psychoff Radar
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                            Exclusive discounts and latest news
                          </p>
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all">
                            <span className="font-mono">VISIT_WEBSITE →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Membership Section */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-blue-500 dark:bg-blue-400"></div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Membership Overview
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 flex-shrink-0">
                  {/* Membership Status Card */}
                  <div
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
                    style={{ animation: 'fadeInUp 0.4s ease-out 0.3s both' }}
                  >
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                              Membership Status
                            </h3>
                            {membershipLoading ? (
                              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            ) : membershipStatus ? (
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${membershipStatus.bg} ${membershipStatus.borderColor} border`}>
                                <StatusIcon className={`h-3.5 w-3.5 ${membershipStatus.color}`} />
                                <span className={`text-xs font-mono font-bold ${membershipStatus.color}`}>
                                  {membershipStatus.text}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs font-mono px-2 py-0.5">
                                NO_ACTIVE_MEMBERSHIP
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Circular Progress Indicator */}
                        {!membershipLoading && membership?.expiry_date && (
                          <div className="hidden sm:flex items-center gap-3">
                            <div className="relative w-16 h-16">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-slate-200 dark:text-slate-800"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={175.93}
                                  strokeDashoffset={175.93 - (175.93 * getDaysProgress(membership.expiry_date)) / 100}
                                  strokeLinecap="round"
                                  className={membershipStatus?.color || 'text-blue-500'}
                                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                  {Math.round(getDaysProgress(membership.expiry_date))}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500/0 group-hover:bg-blue-500/30 transition-all"></div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono uppercase tracking-wider">Status</p>
                        {membershipLoading ? (
                          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                            {membership?.status || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500/0 group-hover:bg-blue-500/30 transition-all"></div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono uppercase tracking-wider">Start Date</p>
                        {membershipLoading ? (
                          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {membership ? formatDate(membership.start_date) : 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500/0 group-hover:bg-blue-500/30 transition-all"></div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono uppercase tracking-wider">Expiry Date</p>
                        {membershipLoading ? (
                          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {membership ? formatDate(membership.expiry_date) : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products/Leagues Access Card */}
                <div
                  className="mt-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                  style={{ animation: 'fadeInUp 0.4s ease-out 0.4s both' }}
                >
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                          <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
                          {isAdmin ? 'Admin Access' : 'Your Products'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {isAdmin ? 'FULL_SYSTEM_ACCESS' : 'ACTIVE_LEAGUES'}
                        </p>
                      </div>
                      {!isAdmin && leagues.length > 0 && (
                        <Badge className="text-xs font-mono px-2 py-0.5 bg-purple-500 text-white border-0">
                          {leagues.length} {leagues.length === 1 ? 'LEAGUE' : 'LEAGUES'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto p-5">
                    {isAdmin ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                            <Shield className="h-full w-full text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-4 relative">
                            <div className="p-3 rounded-lg bg-emerald-500 dark:bg-emerald-400">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                Full Administrative Access
                              </h4>
                              <p className="text-slate-600 dark:text-slate-400 text-sm font-mono">
                                SYSTEM_LEVEL_PERMISSIONS
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center group hover:border-emerald-500/30 transition-colors">
                            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 w-fit mx-auto mb-3 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                              <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">ALL_LEAGUES</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center group hover:border-blue-500/30 transition-colors">
                            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 w-fit mx-auto mb-3 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">ALL_FIXTURES</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center group hover:border-purple-500/30 transition-colors">
                            <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950 w-fit mx-auto mb-3 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">ADMIN_TOOLS</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {leaguesLoading ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="h-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg animate-pulse"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        ) : leagues.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {leagues.map((access, index) => (
                              <div
                                key={access.id}
                                className="group relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-purple-500/50 hover:-translate-y-0.5 overflow-hidden"
                                style={{ animation: `fadeInUp 0.4s ease-out ${0.5 + index * 0.05}s both` }}
                              >
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/0 group-hover:bg-purple-500 transition-all duration-300"></div>
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 group-hover:bg-purple-500 group-hover:border-purple-500 transition-all duration-300">
                                    <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-0.5">
                                      {access.league.display_name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                                      {access.league.country || 'GLOBAL'}
                                    </p>
                                  </div>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">ACTIVE</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
                              <Package className="h-10 w-10 text-slate-400" />
                            </div>
                            <h4 className="text-slate-900 dark:text-white font-bold text-base mb-2">
                              No Leagues Available
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-mono mb-4">
                              CONTACT_SUPPORT_FOR_ACCESS
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-mono text-xs"
                              onClick={() => window.open('https://www.psychoff.co.uk/psychoff-radar', '_blank')}
                            >
                              GET_ACCESS →
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}
