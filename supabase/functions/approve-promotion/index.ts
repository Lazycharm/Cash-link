// Supabase Edge Functions - Approve Promotion
// Deploy with: supabase functions deploy approve-promotion

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

    const { promotionRequestId } = await req.json();

    if (!promotionRequestId) {
      return new Response(
        JSON.stringify({ error: 'Missing promotionRequestId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get promotion request
    const { data: request, error: fetchError } = await supabaseClient
      .from('promotion_requests')
      .select('*')
      .eq('id', promotionRequestId)
      .single();

    if (fetchError || !request) {
      return new Response(
        JSON.stringify({ error: 'Promotion request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (request.duration_days || 7));

    // Update promotion request
    await supabaseClient
      .from('promotion_requests')
      .update({
        status: 'approved',
        start_date: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', promotionRequestId);

    // Get item being promoted and update its promoted status
    const tableMap: Record<string, string> = {
      'business': 'businesses',
      'job': 'jobs',
      'event': 'events',
      'marketplace_item': 'marketplace_items',
      'agent': 'profiles',
      'driver': 'profiles'
    };

    const tableName = tableMap[request.entity_type];
    if (tableName && request.entity_id) {
      await supabaseClient
        .from(tableName)
        .update({ is_promoted: true })
        .eq('id', request.entity_id);
    }

    // Notify user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: request.user_id,
        message: `Your promotion request has been approved! Your content will be featured until ${expiresAt.toLocaleDateString()}.`,
        type: 'success'
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Promotion approved', expiresAt: expiresAt.toISOString() }),
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
