/**
 * AppSettings Entity - Supabase Wrapper
 * Replaces Base44's @/entities/AppSettings
 */
import { supabase } from '@/lib/supabase';

export const AppSettings = {
  /**
   * Get all app settings (singleton pattern - returns array with single item)
   */
  async list() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get the app settings
   */
  async get() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create app settings (if none exist)
   */
  async create(settingsData = {}) {
    const defaultSettings = {
      subscription_prices: { monthly: 30, quarterly: 80, yearly: 300 },
      subscriptions_enabled: true,
      promotion_price: 10,
      promotion_packages: [],
      promotion_enabled: true,
      admin_whatsapp: '',
      admin_email: '',
      career_build_url: 'https://carreerbuild.com',
      features_enabled: {},
      maintenance_mode: false,
      app_version: '1.0.0',
      ...settingsData
    };

    const { data, error } = await supabase
      .from('app_settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update app settings
   */
  async update(settingsId, updates) {
    const { data, error } = await supabase
      .from('app_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingsId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create initial settings if they don't exist
   */
  async ensureExists() {
    const existing = await this.get();
    if (!existing) {
      return await this.create();
    }
    return existing;
  }
};
