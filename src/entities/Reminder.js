/**
 * Reminder Entity - Supabase Wrapper
 * Handles Visa Expiry Reminders and Bill Reminders
 */
import { supabase } from '@/lib/supabase';

export const VisaReminder = {
  /**
   * Create a new visa expiry reminder
   */
  async create(reminderData) {
    const { data, error } = await supabase
      .from('visa_expiry_reminders')
      .insert([{
        ...reminderData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all visa reminders for a user
   */
  async list(userId) {
    const { data, error } = await supabase
      .from('visa_expiry_reminders')
      .select('*')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get active visa reminders for a user
   */
  async getActive(userId) {
    const { data, error } = await supabase
      .from('visa_expiry_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single reminder by ID
   */
  async get(reminderId) {
    const { data, error } = await supabase
      .from('visa_expiry_reminders')
      .select('*')
      .eq('id', reminderId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a reminder
   */
  async update(reminderId, updates) {
    const { data, error } = await supabase
      .from('visa_expiry_reminders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a reminder
   */
  async delete(reminderId) {
    const { error } = await supabase
      .from('visa_expiry_reminders')
      .delete()
      .eq('id', reminderId);

    if (error) throw error;
  },

  /**
   * Toggle active status
   */
  async toggleActive(reminderId, isActive) {
    return await this.update(reminderId, { is_active: isActive });
  }
};

export const BillReminder = {
  /**
   * Create a new bill reminder
   */
  async create(reminderData) {
    const { data, error } = await supabase
      .from('bill_reminders')
      .insert([{
        ...reminderData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all bill reminders for a user
   */
  async list(userId) {
    const { data, error } = await supabase
      .from('bill_reminders')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get active bill reminders for a user
   */
  async getActive(userId) {
    const { data, error } = await supabase
      .from('bill_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_paid', false)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single reminder by ID
   */
  async get(reminderId) {
    const { data, error } = await supabase
      .from('bill_reminders')
      .select('*')
      .eq('id', reminderId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a reminder
   */
  async update(reminderId, updates) {
    const { data, error } = await supabase
      .from('bill_reminders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a reminder
   */
  async delete(reminderId) {
    const { error } = await supabase
      .from('bill_reminders')
      .delete()
      .eq('id', reminderId);

    if (error) throw error;
  },

  /**
   * Toggle active status
   */
  async toggleActive(reminderId, isActive) {
    return await this.update(reminderId, { is_active: isActive });
  },

  /**
   * Mark bill as paid
   */
  async markAsPaid(reminderId) {
    return await this.update(reminderId, { is_paid: true, is_active: false });
  }
};
