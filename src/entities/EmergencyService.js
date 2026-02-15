/**
 * EmergencyService Entity - Supabase Wrapper
 * Replaces Base44's @/entities/EmergencyService
 */
import { supabase } from '@/lib/supabase';

export const EmergencyService = {
  async create(serviceData) {
    const { data, error } = await supabase
      .from('emergency_services')
      .insert([{
        ...serviceData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from('emergency_services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async filter(conditions, orderBy = 'name', limit = null) {
    let query = supabase.from('emergency_services').select('*');

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

  async get(serviceId) {
    const { data, error } = await supabase
      .from('emergency_services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(serviceId, updates) {
    const { error } = await supabase
      .from('emergency_services')
      .update(updates)
      .eq('id', serviceId);

    if (error) throw error;
  },

  async delete(serviceId) {
    const { error } = await supabase
      .from('emergency_services')
      .delete()
      .eq('id', serviceId);

    if (error) throw error;
  }
};
