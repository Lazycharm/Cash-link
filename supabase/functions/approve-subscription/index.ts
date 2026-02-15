// Supabase Edge Functions - Approve Subscription
// Deploy with: supabase functions deploy approve-subscription

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

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subscriptionRequestId } = await req.json();

    if (!subscriptionRequestId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscriptionRequestId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription request
    const { data: request, error: fetchError } = await supabaseClient
      .from('subscription_requests')
      .select('*')
      .eq('id', subscriptionRequestId)
      .single();

    if (fetchError || !request) {
      return new Response(
        JSON.stringify({ error: 'Subscription request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (request.duration_days || 30));

    // Update subscription request status
    await supabaseClient
      .from('subscription_requests')
      .update({ status: 'completed' })
      .eq('id', subscriptionRequestId);

    // Update user subscription status
    await supabaseClient
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_expires: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', request.user_id);

    // Notify user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: request.user_id,
        message: `Your ${request.package_name} subscription has been activated! Valid until ${expiresAt.toLocaleDateString()}.`,
        type: 'success',
        link: '/profile'
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Subscription approved' }),
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
