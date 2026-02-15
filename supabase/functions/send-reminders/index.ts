import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DenoEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ============================================
    // CHECK VISA EXPIRY REMINDERS
    // ============================================
    const { data: visaReminders, error: visaError } = await supabase
      .from('visa_expiry_reminders')
      .select('*')
      .eq('is_active', true);

    if (visaError) throw visaError;

    const visaNotifications = [];

    for (const reminder of visaReminders || []) {
      const expiryDate = new Date(reminder.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we should send a reminder today
      const reminderDays = reminder.reminder_days_before || [30, 14, 7, 1];
      const shouldRemind = reminderDays.includes(daysUntilExpiry);

      if (shouldRemind) {
        // Check if we already sent a reminder for this day
        const lastReminder = reminder.last_reminder_sent 
          ? new Date(reminder.last_reminder_sent)
          : null;
        
        const shouldSend = !lastReminder || 
          lastReminder.toDateString() !== today.toDateString();

        if (shouldSend) {
          const documentType = reminder.document_type === 'visa' ? 'Visa' :
                              reminder.document_type === 'passport' ? 'Passport' :
                              'Emirates ID';

          let message = '';
          if (daysUntilExpiry < 0) {
            message = `⚠️ URGENT: Your ${documentType} has EXPIRED! Please renew immediately.`;
          } else if (daysUntilExpiry === 0) {
            message = `⚠️ Your ${documentType} expires TODAY! Please renew immediately.`;
          } else if (daysUntilExpiry === 1) {
            message = `⚠️ URGENT: Your ${documentType} expires TOMORROW! Please renew immediately.`;
          } else {
            message = `📅 Reminder: Your ${documentType} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()}).`;
          }

          if (reminder.document_number) {
            message += ` Document: ${reminder.document_number}`;
          }

          visaNotifications.push({
            user_id: reminder.user_id,
            message,
            type: daysUntilExpiry <= 7 ? 'warning' : 'info',
            link: null
          });

          // Update last_reminder_sent
          await supabase
            .from('visa_expiry_reminders')
            .update({ last_reminder_sent: today.toISOString() })
            .eq('id', reminder.id);
        }
      }
    }

    // ============================================
    // CHECK BILL REMINDERS
    // ============================================
    const { data: billReminders, error: billError } = await supabase
      .from('bill_reminders')
      .select('*')
      .eq('is_active', true)
      .eq('is_paid', false);

    if (billError) throw billError;

    const billNotifications = [];

    for (const reminder of billReminders || []) {
      const dueDate = new Date(reminder.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we should send a reminder today
      const reminderDays = reminder.reminder_days_before || [7, 3, 1];
      const shouldRemind = reminderDays.includes(daysUntilDue);

      if (shouldRemind) {
        // Check if we already sent a reminder for this day
        const lastReminder = reminder.last_reminder_sent 
          ? new Date(reminder.last_reminder_sent)
          : null;
        
        const shouldSend = !lastReminder || 
          lastReminder.toDateString() !== today.toDateString();

        if (shouldSend) {
          const billType = reminder.bill_type === 'dewa' ? 'DEWA' :
                          reminder.bill_type === 'etisalat' ? 'Etisalat' :
                          reminder.bill_type === 'du' ? 'Du' :
                          reminder.bill_type;

          let message = '';
          if (daysUntilDue < 0) {
            message = `⚠️ OVERDUE: Your ${reminder.bill_name} (${billType}) bill is OVERDUE! Please pay immediately.`;
          } else if (daysUntilDue === 0) {
            message = `⚠️ Your ${reminder.bill_name} (${billType}) bill is due TODAY! Please pay now.`;
          } else if (daysUntilDue === 1) {
            message = `⚠️ URGENT: Your ${reminder.bill_name} (${billType}) bill is due TOMORROW!`;
          } else {
            message = `📅 Reminder: Your ${reminder.bill_name} (${billType}) bill is due in ${daysUntilDue} days (${dueDate.toLocaleDateString()}).`;
          }

          if (reminder.amount) {
            message += ` Amount: ${reminder.currency} ${reminder.amount.toFixed(2)}`;
          }

          billNotifications.push({
            user_id: reminder.user_id,
            message,
            type: daysUntilDue <= 3 ? 'warning' : 'info',
            link: null
          });

          // Update last_reminder_sent
          await supabase
            .from('bill_reminders')
            .update({ last_reminder_sent: today.toISOString() })
            .eq('id', reminder.id);
        }
      }
    }

    // ============================================
    // CREATE NOTIFICATIONS
    // ============================================
    const allNotifications = [...visaNotifications, ...billNotifications];

    if (allNotifications.length > 0) {
      // Insert notifications in batches of 100
      const batchSize = 100;
      let inserted = 0;

      for (let i = 0; i < allNotifications.length; i += batchSize) {
        const batch = allNotifications.slice(i, i + batchSize);
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(batch.map(n => ({
            ...n,
            created_date: new Date().toISOString()
          })));

        if (!notifError) {
          inserted += batch.length;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Sent ${inserted} reminder notifications`,
          visa_reminders: visaNotifications.length,
          bill_reminders: billNotifications.length,
          total: inserted
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No reminders to send',
        visa_reminders: 0,
        bill_reminders: 0,
        total: 0
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
