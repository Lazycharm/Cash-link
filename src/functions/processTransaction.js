/**
 * Process Transaction - Frontend Function
 * Calls the Supabase Edge Function to process transactions
 */
import { callEdgeFunction } from '@/integrations/Core';

export async function processTransaction({ type, amount, agentId, paymentMethod, notes }) {
  return callEdgeFunction('process-transaction', { 
    type, 
    amount, 
    agentId, 
    paymentMethod, 
    notes 
  });
}
