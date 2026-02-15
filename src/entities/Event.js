/**
 * Event Entity - Supabase Wrapper
 * Replaces Base44's @/entities/Event
 */
import { supabase } from '@/lib/supabase';

export const Event = {
  /**
   * Create a new event
   */
  async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all events
   */
  async list() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_datetime', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter events by conditions
   */
  async filter(conditions, orderBy = 'start_datetime', limit = null) {
    let query = supabase.from('events').select('*');

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
   * Get a single event by ID
   */
  async get(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an event
   */
  async update(eventId, updates) {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId);

    if (error) throw error;
  },

  /**
   * Delete an event
   */
  async delete(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }
};
