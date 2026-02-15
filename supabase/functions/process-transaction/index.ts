// Supabase Edge Functions - Process Transaction
// Deploy with: supabase functions deploy process-transaction

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { transactionId, action } = await req.json();

    if (!transactionId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing transactionId or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validActions = ['accept', 'complete', 'cancel', 'dispute'];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transaction
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check permissions - only customer or agent can modify
    const isCustomer = user.id === transaction.customer_id;
    const isAgent = user.id === transaction.agent_id;

    if (!isCustomer && !isAgent) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to modify this transaction' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      accept: 'accepted',
      complete: 'completed',
      cancel: 'cancelled',
      dispute: 'disputed'
    };

    const newStatus = statusMap[action];

    // Update transaction
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    // Generate reference if completing
    let referenceId = transaction.reference_id;
    if (action === 'complete' && !referenceId) {
      referenceId = `TXN-${Date.now().toString(36).toUpperCase()}`;
      await supabaseClient
        .from('transactions')
        .update({ reference_id: referenceId })
        .eq('id', transactionId);
    }

    // Notify the other party
    const otherPartyId = isCustomer ? transaction.agent_id : transaction.customer_id;
    const actionMessages: Record<string, string> = {
      accept: 'Your transaction has been accepted by the agent.',
      complete: 'Your transaction has been completed successfully.',
      cancel: 'Your transaction has been cancelled.',
      dispute: 'A dispute has been raised on your transaction.'
    };

    await supabaseClient
      .from('notifications')
      .insert({
        user_id: otherPartyId,
        message: actionMessages[action],
        type: action === 'complete' ? 'success' : action === 'dispute' ? 'warning' : 'info',
        link: `/transaction/${transactionId}`
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transaction ${newStatus}`,
        status: newStatus,
        referenceId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
