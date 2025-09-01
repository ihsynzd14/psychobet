import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

// Admin service that uses service role to bypass RLS
export class AdminServiceBypass {
  private supabase;

  constructor() {
    // Use service role key that bypasses RLS
    const serviceRoleKey = config.supabase.serviceRoleKey;
    
    this.supabase = createClient(
      config.supabase.url,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  // Simple role check that bypasses RLS
  async isUserAdmin(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return data?.role === 'admin' || data?.role === 'super_admin';
  }

  // Get user role without RLS issues
  async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }

    return data?.role || null;
  }

  // Set user role (admin operation)
  async setUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<boolean> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error setting user role:', error);
      return false;
    }

    return true;
  }

  // Get all users (admin operation)
  async getAllUsers(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }

    return data || [];
  }
}

export const adminServiceBypass = new AdminServiceBypass();