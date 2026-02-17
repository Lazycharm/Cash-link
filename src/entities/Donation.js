/**
 * Donation Entity - Supabase Wrapper
 * Replaces Base44's @/entities/Donation
 */
import { supabase } from '@/lib/supabase';

export const Donation = {
  async create(donationData) {
    const { data, error } = await supabase
      .from('donations')
      .insert([{
        ...donationData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('donations').select('*');

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

  async get(donationId) {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(donationId, updates) {
    const { error } = await supabase
      .from('donations')
      .update(updates)
      .eq('id', donationId);

    if (error) throw error;
  },

  async delete(donationId) {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', donationId);

    if (error) throw error;
  },

  // Contribution methods
  async createContribution(contributionData) {
    const { data, error } = await supabase
      .from('donation_contributions')
      .insert([{
        ...contributionData,
        created_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getContributions(donationId) {
    const { data, error } = await supabase
      .from('donation_contributions')
      .select(`
        *,
        profiles:donor_id (
          full_name,
          profile_image
        )
      `)
      .eq('donation_id', donationId)
      .eq('status', 'completed')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateContribution(contributionId, updates) {
    const { error } = await supabase
      .from('donation_contributions')
      .update(updates)
      .eq('id', contributionId);

    if (error) throw error;
  }
};
