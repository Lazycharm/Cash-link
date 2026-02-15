/**
 * Notify Admin on Content Creation - Frontend Function
 * Calls the Supabase Edge Function to notify admins of new content
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function notifyAdminOnContentCreation({ entityType, entityTitle }) {
  return callEdgeFunction('notify-admin-content-creation', { 
    entityType, 
    entityTitle 
  });
}
