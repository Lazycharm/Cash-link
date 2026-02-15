import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        // Check admin permissions
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Admin access required' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { 
            message, 
            type = 'info', 
            targetRole = 'all',
            targetUsers = [] 
        } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Message is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get target users
        let users = [];
        if (targetUsers.length > 0) {
            // Specific users
            const allUsers = await base44.asServiceRole.entities.User.list();
            users = allUsers.filter(user => targetUsers.includes(user.id));
        } else if (targetRole === 'all') {
            // All users
            users = await base44.asServiceRole.entities.User.list();
        } else {
            // Specific role
            const allUsers = await base44.asServiceRole.entities.User.list();
            users = allUsers.filter(user => user.role === targetRole);
        }

        // Create notifications for all target users
        const notifications = [];
        for (const user of users) {
            const notification = await base44.asServiceRole.entities.Notification.create({
                user_id: user.id,
                message: message,
                type: type
            });
            notifications.push(notification);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            sent: notifications.length,
            message: `Notifications sent to ${notifications.length} users`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Bulk notification error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message || 'Failed to send notifications' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});