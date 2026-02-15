/**
 * Notification Entity - Supabase Wrapper
 * Replaces Base44's @/entities/Notification
 */
import { supabase } from '@/lib/supabase';

export const Notification = {
  /**
   * Create a new notification
   */
  async create(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notificationData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all notifications for a user
   */
  async list() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter notifications by conditions
   */
  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('notifications').select('*');

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
   * Get a single notification by ID
   */
  async get(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a notification (e.g., mark as read)
   */
  async update(notificationId, updates) {
    const { error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Delete a notification
   */
  async delete(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }
};
