import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        if (!(await base44.auth.isAuthenticated())) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, userEmail, userName, requestedRole } = await req.json();

        if (!userId || !requestedRole) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get all admin users
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        
        const roleDisplayNames = {
            vendor: "Business Owner",
            agent: "Money Agent", 
            driver: "Driver"
        };

        const roleDisplayName = roleDisplayNames[requestedRole] || requestedRole;

        // Create notifications for all admins
        const notificationPromises = admins.map(admin => 
            base44.asServiceRole.entities.Notification.create({
                user_id: admin.id,
                message: `New ${roleDisplayName} role request from ${userName} (${userEmail})`,
                type: 'info'
            })
        );

        // Send emails to all admins
        const emailSubject = `New ${roleDisplayName} Role Request`;
        const emailBody = `
            <h2>New Role Request</h2>
            <p>A user has requested to become a ${roleDisplayName} and needs your approval.</p>
            <ul>
                <li><strong>Name:</strong> ${userName}</li>
                <li><strong>Email:</strong> ${userEmail}</li>
                <li><strong>Requested Role:</strong> ${roleDisplayName}</li>
                <li><strong>User ID:</strong> ${userId}</li>
            </ul>
            <p>Please log in to the Admin Dashboard to approve or reject this role request.</p>
        `;

        const emailPromises = admins.map(admin => 
            base44.asServiceRole.integrations.Core.SendEmail({
                to: admin.email,
                subject: emailSubject,
                body: emailBody
            })
        );

        await Promise.all([...notificationPromises, ...emailPromises]);

        return Response.json({ success: true, message: 'Admin notifications sent.' });
    } catch (error) {
        console.error("Failed to send admin notifications:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});