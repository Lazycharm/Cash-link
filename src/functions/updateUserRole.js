/**
 * Update User Role - Frontend Function
 * Calls the Supabase Edge Function to update user roles
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function updateUserRole({ userId, newRole }) {
  return callEdgeFunction('update-user-role', { userId, newRole });
}
