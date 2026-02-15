/**
 * Notify Admin on Subscription Request - Frontend Function
 * Calls the Supabase Edge Function to notify admins of subscription requests
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function notifyAdminOnSubscriptionRequest({ subscriptionRequestId, userDetails, packageDetails }) {
  return callEdgeFunction('notify-admin-subscription-request', { 
    subscriptionRequestId, 
    userDetails, 
    packageDetails 
  });
}
