/**
 * MarketplaceItem Entity - Supabase Wrapper
 * Replaces Base44's @/entities/MarketplaceItem
 */
import { supabase } from '@/lib/supabase';

export const MarketplaceItem = {
  /**
   * Create a new marketplace item
   */
  async create(itemData) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert([{
        ...itemData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all marketplace items
   */
  async list() {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter marketplace items by conditions
   */
  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('marketplace_items').select('*');

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
   * Get a single marketplace item by ID
   */
  async get(itemId) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a marketplace item
   */
  async update(itemId, updates) {
    const { error } = await supabase
      .from('marketplace_items')
      .update(updates)
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Delete a marketplace item
   */
  async delete(itemId) {
    const { error } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }
};
