/**
 * User Entity - Supabase Wrapper
 * Replaces Base44's @/entities/User
 */
import { supabase } from '@/lib/supabase';

export const User = {
  /**
   * Get the current authenticated user with profile data
   */
  async me() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    // Get extended profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Return basic user data if profile doesn't exist yet
      return {
        id: user.id,
        email: user.email,
        ...user.user_metadata
      };
    }

    return {
      id: user.id,
      email: user.email,
      ...profile
    };
  },

  /**
   * Login with OAuth redirect (Google)
   */
  async loginWithRedirect(redirectTo = '/home') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`
      }
    });

    if (error) throw error;
  },

  /**
   * Logout the current user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/';
  },

  /**
   * Update the current user's profile data
   */
  async updateMyUserData(updates) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
  },

  /**
   * Get all users (admin only)
   */
  async list() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter users by conditions
   */
  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('profiles').select('*');

    // Apply filters
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      const descending = orderBy.startsWith('-');
      const column = descending ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !descending });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single user by ID
   */
  async get(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a user by ID (admin only)
   */
  async update(userId, updates) {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Delete the current user's account
   * This will delete the user from auth.users, which will cascade delete the profile
   */
  async deleteAccount() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    // Get the session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // Delete user account using Supabase Edge Function
    // The edge function uses admin privileges to delete the user
    const { data, error } = await supabase.functions.invoke('delete-user-account', {
      body: { userId: user.id },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Error calling delete function:', error);
      throw new Error(error.message || 'Failed to delete account. Please contact support.');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    // Sign out after successful deletion
    await supabase.auth.signOut();
  }
};
