import { createClient } from '@/lib/supabase/server';

// Re-export types from the main admin service
export type {
  Profile,
  League,
  UserMembership,
  UserLeagueAccess,
  UserDetails,
  ActivityLog
} from './admin-service';

// Server-side admin service for use in Server Components
export class AdminServiceServer {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // ==========================================
  // USER MANAGEMENT (Server-side)
  // ==========================================

  async getAllUsers(page = 1, limit = 20, search?: string) {
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
    const transformedUsers = (data || []).map((profile: any) => {
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
        league_count: 0 // Will be populated separately if needed
      };
    });

    return {
      users: transformedUsers,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getUserById(id: string) {
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

  async getDashboardStats() {
    // Get total users
    const { count: totalUsers } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (with active memberships)
    const { count: activeUsers } = await this.supabase
      .from('user_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get users expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { count: expiringUsers } = await this.supabase
      .from('user_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    // Mock revenue calculation (since pricing is handled by Wix)
    const totalRevenue = (activeUsers || 0) * 29.99; // Approximate

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
      totalRevenue,
      newUsersThisMonth: newUsersThisMonth || 0
    };
  }

  async isAdmin(): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return false;

    const { data } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role === 'admin' || data?.role === 'super_admin';
  }
}

// Export convenience functions for use in server components
export const adminServiceServer = new AdminServiceServer();