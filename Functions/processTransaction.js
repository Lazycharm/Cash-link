import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Authentication required' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { 
            type, 
            amount, 
            agentId, 
            paymentMethod, 
            notes 
        } = await req.json();

        // Validate transaction data
        const validTypes = ['withdrawal', 'deposit', 'payment', 'subscription'];
        if (!validTypes.includes(type) || !amount || amount <= 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid transaction data' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate transaction reference
        const reference = `CL${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

        // Create transaction record
        const transaction = await base44.entities.Transaction.create({
            type: type,
            customer_id: currentUser.id,
            agent_id: agentId,
            amount: parseFloat(amount),
            status: 'pending',
            payment_method: paymentMethod,
            reference: reference,
            notes: notes
        });

        // Update user balance for withdrawals/deposits
        if (type === 'withdrawal' && currentUser.balance >= amount) {
            await base44.entities.User.update(currentUser.id, {
                phone_number: currentUser.phone_number, // Required field
                balance: currentUser.balance - amount
            });
        } else if (type === 'deposit') {
            await base44.entities.User.update(currentUser.id, {
                phone_number: currentUser.phone_number, // Required field
                balance: (currentUser.balance || 0) + amount
            });
        }

        // Send notification to user
        await base44.entities.Notification.create({
            user_id: currentUser.id,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} of AED ${amount} initiated. Reference: ${reference}`,
            type: 'transaction'
        });

        return new Response(JSON.stringify({ 
            success: true, 
            transaction: transaction,
            reference: reference 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Transaction processing error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message || 'Transaction failed' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});