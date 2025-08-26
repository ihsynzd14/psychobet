import { createClient } from '@/lib/supabase/client';

// Types based on our database schema
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  display_name: string;
  country?: string;
  logo_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  start_date: string;
  expiry_date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserLeagueAccess {
  id: string;
  user_id: string;
  league_id: string;
  membership_id?: string;
  granted_at: string;
  granted_by?: string;
  league?: League;
}

export interface UserDetails {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  user_created_at: string;
  membership_id?: string;
  membership_status?: string;
  start_date?: string;
  expiry_date?: string;
  membership_health: 'active' | 'expiring_soon' | 'expired';
  league_count: number;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action_type: string;
  action_description: string;
  target_user_id?: string;
  metadata: Record<string, any>;
  performed_by: string;
  created_at: string;
}

// Admin service class for database operations
export class AdminService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  async getAllUsers(page = 1, limit = 20, search?: string): Promise<{
    users: UserDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let query = this.supabase
      .from('user_details')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('user_created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      users: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getUserById(id: string): Promise<UserDetails | null> {
    const { data, error } = await this.supabase
      .from('user_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name?: string;
    role?: 'user' | 'admin';
  }): Promise<{ user: any; error: any }> {
    // Create auth user
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name
      }
    });

    if (authError) return { user: null, error: authError };

    // Update profile with role
    if (userData.role && userData.role !== 'user') {
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({ role: userData.role })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile role:', profileError);
      }
    }

    return { user: authData.user, error: null };
  }

  async updateUser(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    // First remove user data
    await this.supabase.from('user_league_access').delete().eq('user_id', id);
    await this.supabase.from('user_memberships').delete().eq('user_id', id);
    await this.supabase.from('profiles').delete().eq('id', id);
    
    // Then delete auth user
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  // ==========================================
  // MEMBERSHIP MANAGEMENT
  // ==========================================

  async createUserMembership(membershipData: {
    user_id: string;
    start_date: string;
    expiry_date: string;
    status?: 'active' | 'expired' | 'suspended' | 'cancelled';
  }): Promise<UserMembership> {
    const currentUser = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('user_memberships')
      .insert({
        ...membershipData,
        created_by: currentUser?.id
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserMembership(id: string, updates: Partial<UserMembership>): Promise<UserMembership> {
    const { data, error } = await this.supabase
      .from('user_memberships')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getUserMemberships(userId: string): Promise<UserMembership[]> {
    const { data, error } = await this.supabase
      .from('user_memberships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // LEAGUE MANAGEMENT
  // ==========================================

  async getAllLeagues(): Promise<League[]> {
    const { data, error } = await this.supabase
      .from('leagues')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUserLeagueAccess(userId: string): Promise<UserLeagueAccess[]> {
    const { data, error } = await this.supabase
      .from('user_league_access')
      .select(`
        *,
        league:leagues(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async grantLeagueAccess(userId: string, leagueIds: string[], membershipId?: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    
    const accessRecords = leagueIds.map(leagueId => ({
      user_id: userId,
      league_id: leagueId,
      membership_id: membershipId,
      granted_by: currentUser?.id
    }));

    const { error } = await this.supabase
      .from('user_league_access')
      .upsert(accessRecords, { onConflict: 'user_id,league_id' });

    if (error) throw error;
  }

  async revokeLeagueAccess(userId: string, leagueIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('user_league_access')
      .delete()
      .eq('user_id', userId)
      .in('league_id', leagueIds);

    if (error) throw error;
  }

  async replaceUserLeagueAccess(userId: string, leagueIds: string[], membershipId?: string): Promise<void> {
    // First remove all existing access
    await this.supabase
      .from('user_league_access')
      .delete()
      .eq('user_id', userId);

    // Then grant new access
    if (leagueIds.length > 0) {
      await this.grantLeagueAccess(userId, leagueIds, membershipId);
    }
  }

  // ==========================================
  // ACTIVITY LOGGING
  // ==========================================

  async logActivity(
    actionType: string,
    actionDescription: string,
    targetUserId?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const currentUser = await this.getCurrentUser();
    
    const { error } = await this.supabase
      .from('activity_logs')
      .insert({
        action_type: actionType,
        action_description: actionDescription,
        target_user_id: targetUserId,
        metadata,
        performed_by: currentUser?.id
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getActivityLogs(page = 1, limit = 50): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { data, error, count } = await this.supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      logs: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    expiringUsers: number;
    totalRevenue: number;
    newUsersThisMonth: number;
  }> {
    const usersResult = await this.supabase
      .from('user_details')
      .select('membership_health', { count: 'exact' });

    const totalUsers = usersResult.count || 0;
    const activeUsers = usersResult.data?.filter((u: any) => u.membership_health === 'active').length || 0;
    const expiringUsers = usersResult.data?.filter((u: any) => u.membership_health === 'expiring_soon').length || 0;

    // Revenue calculation removed since we don't have pricing in the system
    const totalRevenue = 0;

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    
    const { count: newUsersThisMonth } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return {
      totalUsers,
      activeUsers,
      expiringUsers,
      totalRevenue,
      newUsersThisMonth: newUsersThisMonth || 0
    };
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  private async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const { data } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role === 'admin' || data?.role === 'super_admin';
  }
}

// Export convenience functions for use in components
export const adminService = new AdminService();