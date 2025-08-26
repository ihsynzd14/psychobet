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

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('user_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
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