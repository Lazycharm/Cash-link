import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    // Check authentication first
    let currentUser;
    try {
        currentUser = await base44.auth.me();
    } catch (err) {
        return new Response('{"success":false,"error":"Authentication failed"}', {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!currentUser || currentUser.role !== 'admin') {
        return new Response('{"success":false,"error":"Unauthorized"}', {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Parse request body
    let requestData;
    try {
        requestData = await req.json();
    } catch (err) {
        return new Response('{"success":false,"error":"Invalid JSON"}', {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { promotionRequestId } = requestData;

    if (!promotionRequestId) {
        return new Response('{"success":false,"error":"promotionRequestId is required"}', {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Step 1: Update promotion request
        const promotionRequest = await base44.asServiceRole.entities.PromotionRequest.update(
            promotionRequestId, 
            { status: 'completed' }
        );

        if (!promotionRequest) {
            return new Response('{"success":false,"error":"Promotion request not found"}', {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { entity_type, entity_id, duration_days } = promotionRequest;
        
        // Step 2: Calculate expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (duration_days || 7));

        // Step 3: Update entity based on type
        if (entity_type === 'marketplace_item') {
            await base44.asServiceRole.entities.MarketplaceItem.update(entity_id, {
                is_promoted: true,
                promotion_expires: expiryDate.toISOString()
            });
        } else if (entity_type === 'business') {
            await base44.asServiceRole.entities.Business.update(entity_id, {
                is_featured: true,
                promotion_expires: expiryDate.toISOString()
            });
        } else if (entity_type === 'event') {
            await base44.asServiceRole.entities.Event.update(entity_id, {
                is_featured: true,
                promotion_expires: expiryDate.toISOString()
            });
        }

        // Step 4: Create notification
        await base44.asServiceRole.entities.Notification.create({
            user_id: promotionRequest.user_id,
            message: `Your promotion for "${promotionRequest.entity_title}" is now active!`,
            type: 'success'
        });

        const result = JSON.stringify({
            success: true,
            expiryDate: expiryDate.toISOString()
        });

        return new Response(result, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Promotion approval error:', error);
        const errorResult = JSON.stringify({
            success: false,
            error: error.message || 'Internal server error'
        });
        return new Response(errorResult, {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});