/**
 * Notify Admin on Role Request - Frontend Function
 * Calls the Supabase Edge Function to notify admins of new role requests
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function notifyAdminOnRoleRequest({ userId, userEmail, userName, requestedRole }) {
  return callEdgeFunction('notify-admin-role-request', { 
    userId, 
    userEmail, 
    userName, 
    requestedRole 
  });
}
