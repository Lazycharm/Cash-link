/**
 * Send Bulk Notifications - Frontend Function
 * Calls the Supabase Edge Function to send notifications to multiple users
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function sendBulkNotifications({ message, type, targetRole, targetUsers }) {
  return callEdgeFunction('send-bulk-notifications', { 
    message, 
    type, 
    targetRole, 
    targetUsers 
  });
}
