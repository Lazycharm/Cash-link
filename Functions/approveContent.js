import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Unauthorized: Admin access required' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { entity, itemId, status, reason } = await req.json();
        
        const validEntities = ['Business', 'Job', 'Event', 'MarketplaceItem'];
        const validStatuses = ['approved', 'rejected'];
        
        if (!validEntities.includes(entity) || !itemId || !validStatuses.includes(status)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid parameters' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update the item status
        await base44.asServiceRole.entities[entity].update(itemId, { status: status });

        // Get the item to find the owner
        const item = await base44.asServiceRole.entities[entity].get(itemId);
        const ownerId = item.owner_id || item.poster_id || item.organizer_id || item.seller_id;

        if (ownerId) {
            // Notify the owner
            const message = status === 'approved' 
                ? `Your ${entity.toLowerCase()} "${item.title || item.name}" has been approved!`
                : `Your ${entity.toLowerCase()} "${item.title || item.name}" was not approved. ${reason || ''}`;

            await base44.asServiceRole.entities.Notification.create({
                user_id: ownerId,
                message: message,
                type: status === 'approved' ? 'success' : 'warning'
            });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `${entity} ${status} successfully` 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Content approval error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message || 'Failed to update content status' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});