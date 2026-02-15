/**
 * ActivityLog Entity - Supabase Wrapper
 * Replaces Base44's @/entities/ActivityLog
 */
import { supabase } from '@/lib/supabase';

export const ActivityLog = {
  async create(logData) {
    const { data, error } = await supabase
      .from('activity_log')
      .insert([{
        ...logData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('activity_log').select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    if (orderBy) {
      const descending = orderBy.startsWith('-');
      const column = descending ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !descending });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(logId) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('id', logId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Log an activity
   */
  async log(action, entityType = null, entityId = null, details = null) {
    const { data: { user } } = await supabase.auth.getUser();
    
    return this.create({
      user_id: user?.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  }
};
