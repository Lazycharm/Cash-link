// Supabase Edge Functions - Notify Admin on Content Creation
// Deploy with: supabase functions deploy notify-admin-content-creation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendEmail(to: string, subject: string, body: string) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CashLink <noreply@yourcashlink.com>',
        to: [to],
        subject,
        html: body
      })
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

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

    const { entityType, entityTitle } = await req.json();

    if (!entityType || !entityTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing entityType or entityTitle' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all admins
    const { data: admins } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailBody = `
      <p>A new piece of content has been submitted and requires your review.</p>
      <ul>
        <li><strong>Content Type:</strong> ${entityType}</li>
        <li><strong>Title:</strong> ${entityTitle}</li>
      </ul>
      <p>Please log in to the Admin Dashboard to approve or reject this submission.</p>
    `;

    const emailPromises = admins
      .filter(admin => admin.email)
      .map(admin => sendEmail(
        admin.email,
        `New ${entityType} requires approval: ${entityTitle}`,
        emailBody
      ));

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ success: true, message: 'Admin notifications sent' }),
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
