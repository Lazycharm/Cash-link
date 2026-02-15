/**
 * Approve Promotion - Frontend Function
 * Handles promotion approval directly without Edge Function
 */
import { supabase } from '@/lib/supabase';

export async function approvePromotion({ promotionRequestId }) {
  try {
    // Get the promotion request
    const { data: request, error: fetchError } = await supabase
      .from('promotion_requests')
      .select('*')
      .eq('id', promotionRequestId)
      .single();

    if (fetchError || !request) {
      return { data: null, error: { message: 'Promotion request not found' } };
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (request.duration_days || 7));

    // Update promotion request to approved
    const { error: updateError } = await supabase
      .from('promotion_requests')
      .update({
        status: 'approved'
      })
      .eq('id', promotionRequestId);

    if (updateError) {
      return { data: null, error: updateError };
    }

    // Map entity types to table names
    const tableMap = {
      'business': 'businesses',
      'job': 'jobs',
      'event': 'events',
      'marketplace_item': 'marketplace_items',
      'agent': 'profiles',
      'driver': 'profiles'
    };

    // Update the promoted entity's is_promoted status
    const tableName = tableMap[request.entity_type];
    if (tableName && request.entity_id) {
      await supabase
        .from(tableName)
        .update({ is_promoted: true })
        .eq('id', request.entity_id);
    }

    // Create notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: request.user_id,
        message: `Your promotion request has been approved! Your content will be featured until ${expiresAt.toLocaleDateString()}.`,
        type: 'success'
      });

    return { 
      data: { 
        success: true, 
        message: 'Promotion approved', 
        expiresAt: expiresAt.toISOString() 
      }, 
      error: null 
    };

  } catch (error) {
    console.error('Approve promotion error:', error);
    return { data: null, error: { message: error.message } };
  }
}
