/**
 * PromotionRequest Entity - Supabase Wrapper
 * Replaces Base44's @/entities/PromotionRequest
 */
import { supabase } from '@/lib/supabase';

export const PromotionRequest = {
  async create(requestData) {
    const { data, error } = await supabase
      .from('promotion_requests')
      .insert([{
        ...requestData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from('promotion_requests')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('promotion_requests').select('*');

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

  async get(requestId) {
    const { data, error } = await supabase
      .from('promotion_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(requestId, updates) {
    const { error } = await supabase
      .from('promotion_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) throw error;
  },

  async delete(requestId) {
    const { error } = await supabase
      .from('promotion_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  }
};
