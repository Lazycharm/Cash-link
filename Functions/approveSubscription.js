import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { subscriptionRequestId } = await req.json();
        
        if (!subscriptionRequestId) {
            return new Response(JSON.stringify({ success: false, error: 'subscriptionRequestId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const request = await base44.asServiceRole.entities.SubscriptionRequest.update(subscriptionRequestId, { status: 'completed' });

        if (!request) {
            throw new Error("Subscription request not found");
        }

        const user = await base44.asServiceRole.entities.User.get(request.user_id);
        
        const currentExpiry = user.subscription_expires ? new Date(user.subscription_expires) : new Date();
        const now = new Date();
        const startDate = currentExpiry > now ? currentExpiry : now;
        
        const newExpiry = new Date(startDate);
        newExpiry.setDate(newExpiry.getDate() + request.duration_days);

        await base44.asServiceRole.entities.User.update(request.user_id, {
            subscription_status: 'active',
            subscription_expires: newExpiry.toISOString()
        });

        await base44.asServiceRole.entities.Notification.create({
            user_id: request.user_id,
            message: `Your ${request.package_name} subscription is now active! It will expire on ${newExpiry.toLocaleDateString()}.`,
            type: 'success'
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in approveSubscription function:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});