/**
 * LostItem Entity - Supabase Wrapper
 * Replaces Base44's @/entities/LostItem
 */
import { supabase } from '@/lib/supabase';

export const LostItem = {
  async create(itemData) {
    const { data, error } = await supabase
      .from('lost_items')
      .insert([{
        ...itemData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from('lost_items')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('lost_items').select('*');

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

  async get(itemId) {
    const { data, error } = await supabase
      .from('lost_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(itemId, updates) {
    const { error } = await supabase
      .from('lost_items')
      .update(updates)
      .eq('id', itemId);

    if (error) throw error;
  },

  async delete(itemId) {
    const { error } = await supabase
      .from('lost_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }
};
