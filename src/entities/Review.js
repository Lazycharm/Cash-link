/**
 * Review Entity - Supabase Wrapper
 * Handles reviews for agents, drivers, and businesses
 */
import { supabase } from '@/lib/supabase';

export const Review = {
  /**
   * Create a new review
   */
  async create(reviewData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to create a review');

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...reviewData,
        reviewer_id: user.id,
        created_date: new Date().toISOString()
      }])
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all reviews for a specific user/professional
   */
  async getForUser(userId, entityType = null) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, avatar_url)
      `)
      .eq('reviewed_user_id', userId)
      .eq('status', 'active')
      .order('created_date', { ascending: false });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get all reviews for a specific business
   */
  async getForBusiness(businessId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, avatar_url)
      `)
      .eq('entity_id', businessId)
      .eq('entity_type', 'business')
      .eq('status', 'active')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get review stats for a user
   */
  async getStats(userId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    const reviews = data || [];
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      distribution[r.rating]++;
    });

    return {
      totalReviews,
      avgRating: parseFloat(avgRating),
      distribution
    };
  },

  /**
   * Check if user can review another user (has a completed transaction)
   */
  async canReview(reviewedUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { canReview: false, reason: 'Not logged in' };
    if (user.id === reviewedUserId) return { canReview: false, reason: 'Cannot review yourself' };

    // Check for completed transaction
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .or(`customer_id.eq.${user.id},agent_id.eq.${user.id}`)
      .or(`customer_id.eq.${reviewedUserId},agent_id.eq.${reviewedUserId}`)
      .eq('status', 'completed')
      .limit(1);

    // Check for existing review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewed_user_id', reviewedUserId)
      .limit(1);

    if (existingReview && existingReview.length > 0) {
      return { canReview: false, reason: 'Already reviewed' };
    }

    return { 
      canReview: true, 
      hasTransaction: transactions && transactions.length > 0,
      transactionId: transactions?.[0]?.id
    };
  },

  /**
   * Get reviews written by the current user
   */
  async getMyReviews() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewed_user:profiles!reviewed_user_id(id, full_name, avatar_url, role)
      `)
      .eq('reviewer_id', user.id)
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update a review (only owner can update)
   */
  async update(reviewId, updates) {
    const { error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId);

    if (error) throw error;
  },

  /**
   * Delete a review (only owner can delete)
   */
  async delete(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  /**
   * Report a review
   */
  async report(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'reported' })
      .eq('id', reviewId);

    if (error) throw error;
  }
};
