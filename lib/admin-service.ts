import { createClient } from '@/lib/supabase/client';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

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
  id: string; // Changed to string to handle both UUID and numeric IDs
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
    // Build the query using actual tables instead of the view
    let query = this.supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        user_memberships!user_memberships_user_id_fkey (
          id,
          status,
          start_date,
          expiry_date
        )
      `, { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Transform the data to match UserDetails interface
    const transformedUsers: UserDetails[] = (data || []).map((profile: any) => {
      const membership = profile.user_memberships?.[0]; // Get active membership
      const expiryDate = membership?.expiry_date ? new Date(membership.expiry_date) : null;
      const today = new Date();
      
      let membershipHealth: 'active' | 'expiring_soon' | 'expired' = 'expired';
      if (membership?.status === 'active' && expiryDate) {
        if (expiryDate < today) {
          membershipHealth = 'expired';
        } else if (expiryDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
          membershipHealth = 'expiring_soon';
        } else {
          membershipHealth = 'active';
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        user_created_at: profile.created_at,
        membership_id: membership?.id,
        membership_status: membership?.status,
        start_date: membership?.start_date,
        expiry_date: membership?.expiry_date,
        membership_health: membershipHealth,
        league_count: 0 // Will be populated separately if needed
      };
    });

    // Get league counts for each user
    if (transformedUsers.length > 0) {
      const userIds = transformedUsers.map(u => u.id);
      const { data: leagueCounts } = await this.supabase
        .from('user_league_access')
        .select('user_id')
        .in('user_id', userIds);

      const leagueCountMap = (leagueCounts || []).reduce((acc: Record<string, number>, item: any) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + 1;
        return acc;
      }, {});

      transformedUsers.forEach(user => {
        user.league_count = leagueCountMap[user.id] || 0;
      });
    }

    return {
      users: transformedUsers,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getUserById(id: string): Promise<UserDetails | null> {
    // Get user profile and membership data
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        user_memberships!user_memberships_user_id_fkey (
          id,
          status,
          start_date,
          expiry_date
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!profile) return null;

    // Get league count
    const { count: leagueCount } = await this.supabase
      .from('user_league_access')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    // Transform the data
    const membership = profile.user_memberships?.[0];
    const expiryDate = membership?.expiry_date ? new Date(membership.expiry_date) : null;
    const today = new Date();
    
    let membershipHealth: 'active' | 'expiring_soon' | 'expired' = 'expired';
    if (membership?.status === 'active' && expiryDate) {
      if (expiryDate < today) {
        membershipHealth = 'expired';
      } else if (expiryDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        membershipHealth = 'expiring_soon';
      } else {
        membershipHealth = 'active';
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      user_created_at: profile.created_at,
      membership_id: membership?.id,
      membership_status: membership?.status,
      start_date: membership?.start_date,
      expiry_date: membership?.expiry_date,
      membership_health: membershipHealth,
      league_count: leagueCount || 0
    };
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name?: string;
    role?: 'user' | 'admin';
  }): Promise<{ user: any; error: any }> {
    // Create a service client with service role key for admin operations
    const serviceRoleKey = config.supabase.serviceRoleKey;
    
    if (!serviceRoleKey || serviceRoleKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3JtYm5wa2R2Y3dsZ3lkd2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjQwMjYsImV4cCI6MjA3MTc0MDAyNn0.7pdwzCC0AxCbDKUAYDsxbEv8q7LbrK3OvHZwi0ZjYHo') {
      return { 
        user: null, 
        error: { 
          message: 'Service role key not configured properly. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables with the actual service role key from your Supabase dashboard.' 
        } 
      };
    }

    const serviceClient = createServiceClient(
      config.supabase.url,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create auth user using service client
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name
      }
    });

    if (authError) return { user: null, error: authError };

    // Update profile with role using service client to bypass RLS
    if (userData.role && userData.role !== 'user') {
      const { error: profileError } = await serviceClient
        .from('profiles')
        .update({ role: userData.role })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile role:', profileError);
        // Don't fail the entire operation if role update fails
        // The user was created successfully
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
    // Create a service client with service role key for admin operations
    const serviceRoleKey = config.supabase.serviceRoleKey;
    
    if (!serviceRoleKey || serviceRoleKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3JtYm5wa2R2Y3dsZ3lkd2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjQwMjYsImV4cCI6MjA3MTc0MDAyNn0.7pdwzCC0AxCbDKUAYDsxbEv8q7LbrK3OvHZwi0ZjYHo') {
      throw new Error('Service role key not configured properly. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables with the actual service role key from your Supabase dashboard.');
    }

    const serviceClient = createServiceClient(
      config.supabase.url,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First remove user data using service client to bypass RLS
    await serviceClient.from('user_league_access').delete().eq('user_id', id);
    await serviceClient.from('user_memberships').delete().eq('user_id', id);
    await serviceClient.from('profiles').delete().eq('id', id);
    
    // Then delete auth user using service client
    const { error } = await serviceClient.auth.admin.deleteUser(id);
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
    newUsersThisMonth: number;
  }> {
    // Get total users
    const { count: totalUsers } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (with active memberships)
    const { count: activeUsers } = await this.supabase
      .from('user_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    // Get users expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { count: expiringUsers } = await this.supabase
      .from('user_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    
    const { count: newUsersThisMonth } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      expiringUsers: expiringUsers || 0,
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