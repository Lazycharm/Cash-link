/**
 * Job Entity - Supabase Wrapper
 * Replaces Base44's @/entities/Job
 */
import { supabase } from '@/lib/supabase';

export const Job = {
  /**
   * Create a new job
   */
  async create(jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        ...jobData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all jobs
   */
  async list() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter jobs by conditions
   */
  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('jobs').select('*');

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
   * Get a single job by ID
   */
  async get(jobId) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a job
   */
  async update(jobId, updates) {
    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  },

  /**
   * Delete a job
   */
  async delete(jobId) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }
};
