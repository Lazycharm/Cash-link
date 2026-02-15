import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    // It's better to perform this check as a service role if the function is meant to be system-level
    if (!(await base44.auth.isAuthenticated())) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { entityType, entityTitle } = await req.json();

    if (!entityType || !entityTitle) {
        return new Response(JSON.stringify({ error: 'Missing entityType or entityTitle' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        
        const emailSubject = `New ${entityType} requires approval: ${entityTitle}`;
        const emailBody = `
            <p>A new piece of content has been submitted and requires your review.</p>
            <ul>
                <li><strong>Content Type:</strong> ${entityType}</li>
                <li><strong>Title:</strong> ${entityTitle}</li>
            </ul>
            <p>Please log in to the Admin Dashboard to approve or reject this submission.</p>
        `;

        const emailPromises = admins.map(admin => 
            // Correct way to call an integration from a backend function
            base44.asServiceRole.integrations.Core.SendEmail({
                to: admin.email,
                subject: emailSubject,
                body: emailBody
            })
        );

        await Promise.all(emailPromises);

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