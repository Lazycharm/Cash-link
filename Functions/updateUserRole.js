import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Unauthorized: Admin access required.' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { userId, newRole } = await req.json();
        
        const validRoles = ['customer', 'vendor', 'agent', 'driver', 'admin'];
        if (!userId || !newRole || !validRoles.includes(newRole)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid request: Missing userId or role.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await base44.asServiceRole.entities.User.update(userId, { 
            role: newRole,
        });

        // FIXED: Replaced frontend utility with a static string for the link.
        // The frontend will construct the full URL.
        await base44.asServiceRole.entities.Notification.create({
            user_id: userId,
            message: `An administrator has updated your role to ${newRole}.`,
            type: 'info',
            link: 'Profile' // Use the page name as a static string
        });

        return new Response(JSON.stringify({ 
            success: true, 
            message: `User role successfully updated to ${newRole}.` 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Role update error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'An internal error occurred. Please check the function logs.' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});