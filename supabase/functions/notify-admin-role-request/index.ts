// Supabase Edge Functions - Notify Admin on Role Request
// Deploy with: supabase functions deploy notify-admin-role-request

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Optional: Resend for email
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

    const { userId, userEmail, userName, requestedRole } = await req.json();

    if (!userId || !requestedRole) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all admin users
    const { data: admins } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      console.log('No admins found');
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roleDisplayNames: Record<string, string> = {
      vendor: 'Business Owner',
      agent: 'Money Agent',
      driver: 'Driver'
    };
    const roleDisplayName = roleDisplayNames[requestedRole] || requestedRole;

    // Create notifications and send emails
    const notificationPromises = admins.map(admin =>
      supabaseClient.from('notifications').insert({
        user_id: admin.id,
        message: `New ${roleDisplayName} role request from ${userName} (${userEmail})`,
        type: 'info',
        link: '/adminusermanagement'
      })
    );

    const emailBody = `
      <h2>New Role Request</h2>
      <p>A user has requested to become a ${roleDisplayName} and needs your approval.</p>
      <ul>
        <li><strong>Name:</strong> ${userName}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>Requested Role:</strong> ${roleDisplayName}</li>
      </ul>
      <p>Please log in to the Admin Dashboard to approve or reject this request.</p>
    `;

    const emailPromises = admins
      .filter(admin => admin.email)
      .map(admin => sendEmail(admin.email, `New ${roleDisplayName} Role Request`, emailBody));

    await Promise.all([...notificationPromises, ...emailPromises]);

    // Also notify the user that their request was submitted
    await supabaseClient.from('notifications').insert({
      user_id: userId,
      message: `Your request to become a ${roleDisplayName} has been submitted and is pending admin approval.`,
      type: 'info',
      link: '/profile'
    });

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
