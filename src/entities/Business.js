/**
 * Business Entity - Supabase Wrapper
 * Replaces Base44's @/entities/Business
 */
import { supabase } from '@/lib/supabase';

export const Business = {
  /**
   * Create a new business
   */
  async create(businessData) {
    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        ...businessData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all businesses
   */
  async list() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter businesses by conditions
   */
  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('businesses').select('*');

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
   * Get a single business by ID
   */
  async get(businessId) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a business
   */
  async update(businessId, updates) {
    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId);

    if (error) throw error;
  },

  /**
   * Delete a business
   */
  async delete(businessId) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;
  },

  /**
   * Increment view count
   */
  async incrementViews(businessId) {
    const { error } = await supabase.rpc('increment_business_views', {
      business_id: businessId
    });

    // If RPC doesn't exist, fall back to manual increment
    if (error) {
      const { data } = await supabase
        .from('businesses')
        .select('views_count')
        .eq('id', businessId)
        .single();

      if (data) {
        await supabase
          .from('businesses')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', businessId);
      }
    }
  }
};
