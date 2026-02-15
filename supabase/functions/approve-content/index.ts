// Supabase Edge Functions - Approve Content
// Deploy with: supabase functions deploy approve-content

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

    const { entity, itemId, status, reason } = await req.json();

    // Map entity names to table names
    const tableMap: Record<string, string> = {
      'Business': 'businesses',
      'Job': 'jobs',
      'Event': 'events',
      'MarketplaceItem': 'marketplace_items'
    };

    const ownerFieldMap: Record<string, string> = {
      'Business': 'owner_id',
      'Job': 'poster_id',
      'Event': 'organizer_id',
      'MarketplaceItem': 'seller_id'
    };

    const tableName = tableMap[entity];
    const ownerField = ownerFieldMap[entity];

    if (!tableName || !itemId || !['approved', 'rejected'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update({ status })
      .eq('id', itemId);

    if (updateError) throw updateError;

    // Get item to find owner
    const { data: item } = await supabaseClient
      .from(tableName)
      .select(`${ownerField}, title, name`)
      .eq('id', itemId)
      .single();

    const ownerId = item?.[ownerField];
    const itemTitle = item?.title || item?.name;

    if (ownerId) {
      const message = status === 'approved'
        ? `Your ${entity.toLowerCase()} "${itemTitle}" has been approved!`
        : `Your ${entity.toLowerCase()} "${itemTitle}" was not approved. ${reason || ''}`;

      await supabaseClient
        .from('notifications')
        .insert({
          user_id: ownerId,
          message,
          type: status === 'approved' ? 'success' : 'warning'
        });
    }

    return new Response(
      JSON.stringify({ success: true, message: `${entity} ${status}` }),
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
