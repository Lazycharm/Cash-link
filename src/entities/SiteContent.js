/**
 * SiteContent Entity - Supabase Wrapper
 * Replaces Base44's @/entities/SiteContent
 */
import { supabase } from '@/lib/supabase';

export const SiteContent = {
  async create(contentData) {
    const { data, error } = await supabase
      .from('site_content')
      .insert([{
        ...contentData,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async filter(conditions, orderBy = 'key', limit = null) {
    let query = supabase.from('site_content').select('*');

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

  async get(contentId) {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) throw error;
    return data;
  },

  async getByKey(key) {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(contentId, updates) {
    const { error } = await supabase
      .from('site_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (error) throw error;
  },

  async upsertByKey(key, content, contentType = 'text') {
    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        key,
        content,
        content_type: contentType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
