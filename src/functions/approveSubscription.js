/**
 * Approve Subscription - Frontend Function
 * Calls the Supabase Edge Function to approve subscription requests
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function approveSubscription({ subscriptionRequestId }) {
  return callEdgeFunction('approve-subscription', { 
    subscriptionRequestId 
  });
}
