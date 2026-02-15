import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    if (!(await base44.auth.isAuthenticated())) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { subscriptionRequestId, userDetails, packageDetails } = await req.json();

    if (!subscriptionRequestId) {
        return new Response(JSON.stringify({ error: 'Missing subscriptionRequestId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        
        // Create notifications for all admins
        const notificationPromises = admins.map(admin => 
            base44.asServiceRole.entities.Notification.create({
                user_id: admin.id,
                message: `New subscription request: ${packageDetails.name} package from ${userDetails.name}`,
                type: 'info'
            })
        );

        // Send emails to all admins
        const emailSubject = `New Subscription Request: ${packageDetails.name}`;
        const emailBody = `
            <h2>New Subscription Request</h2>
            <p>A new subscription request has been submitted and requires your review.</p>
            <ul>
                <li><strong>Package:</strong> ${packageDetails.name}</li>
                <li><strong>Cost:</strong> AED ${packageDetails.cost}</li>
                <li><strong>Duration:</strong> ${packageDetails.duration_days} days</li>
                <li><strong>User:</strong> ${userDetails.name} (${userDetails.email})</li>
                <li><strong>Request ID:</strong> ${subscriptionRequestId}</li>
            </ul>
            <p>Please log in to the Admin Dashboard to approve or reject this subscription request.</p>
        `;

        const emailPromises = admins.map(admin => 
            base44.asServiceRole.integrations.Core.SendEmail({
                to: admin.email,
                subject: emailSubject,
                body: emailBody
            })
        );

        await Promise.all([...notificationPromises, ...emailPromises]);

        return new Response(JSON.stringify({ success: true, message: 'Admin notifications sent.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Failed to send admin notifications:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});