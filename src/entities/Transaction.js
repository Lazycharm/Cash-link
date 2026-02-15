/**
 * Transaction Entity - Supabase Wrapper
 * Replaces Base44's @/entities/Transaction
 */
import { supabase } from '@/lib/supabase';

export const Transaction = {
  /**
   * Create a new transaction
   */
  async create(transactionData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        customer_id: transactionData.customer_id || user?.id,
        created_date: new Date().toISOString()
      }])
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url),
        agent:profiles!agent_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all transactions
   */
  async list() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url),
        agent:profiles!agent_id(id, full_name, avatar_url)
      `)
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter transactions by conditions
   */
  async filter(conditions, orderBy = '-created_date', limit = null) {
    let query = supabase.from('transactions').select(`
      *,
      customer:profiles!customer_id(id, full_name, avatar_url),
      agent:profiles!agent_id(id, full_name, avatar_url)
    `);

    // Apply filters
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      const descending = orderBy.startsWith('-');
      const column = descending ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !descending });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single transaction by ID
   */
  async get(transactionId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url),
        agent:profiles!agent_id(id, full_name, avatar_url)
      `)
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a transaction
   */
  async update(transactionId, updates) {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId);

    if (error) throw error;
  },

  /**
   * Get transactions for an agent
   */
  async getAgentTransactions(agentId, limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url, phone)
      `)
      .eq('agent_id', agentId)
      .order('created_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get agent transaction stats with revenue tracking
   */
  async getAgentStats(agentId, period = 'month') {
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        startDate = new Date(0);
    }

    // Get all transactions for the period
    const { data: periodTransactions, error: periodError } = await supabase
      .from('transactions')
      .select('id, amount, currency, status, service_type, network, fee_amount, fee_percentage, created_date, customer_confirmed, agent_confirmed')
      .eq('agent_id', agentId)
      .gte('created_date', startDate.toISOString());

    if (periodError) throw periodError;

    // Get all-time transactions
    const { data: allTransactions, error: allError } = await supabase
      .from('transactions')
      .select('id, amount, status, fee_amount')
      .eq('agent_id', agentId);

    if (allError) throw allError;

    // Calculate stats
    const transactions = periodTransactions || [];
    const all = allTransactions || [];

    const completed = transactions.filter(t => t.status === 'completed');
    const pending = transactions.filter(t => t.status === 'pending');
    const awaitingCustomer = transactions.filter(t => t.agent_confirmed && !t.customer_confirmed);
    const awaitingAgent = transactions.filter(t => t.customer_confirmed && !t.agent_confirmed);
    
    const totalVolume = completed.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalRevenue = completed.reduce((sum, t) => sum + parseFloat(t.fee_amount || 0), 0);
    
    const allTimeVolume = all.filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const allTimeRevenue = all.filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.fee_amount || 0), 0);

    // Service breakdown
    const serviceBreakdown = {};
    completed.forEach(t => {
      const service = t.service_type || 'other';
      if (!serviceBreakdown[service]) {
        serviceBreakdown[service] = { count: 0, volume: 0, revenue: 0 };
      }
      serviceBreakdown[service].count++;
      serviceBreakdown[service].volume += parseFloat(t.amount || 0);
      serviceBreakdown[service].revenue += parseFloat(t.fee_amount || 0);
    });

    // Network breakdown
    const networkBreakdown = {};
    completed.forEach(t => {
      const network = t.network || 'other';
      if (!networkBreakdown[network]) {
        networkBreakdown[network] = { count: 0, volume: 0, revenue: 0 };
      }
      networkBreakdown[network].count++;
      networkBreakdown[network].volume += parseFloat(t.amount || 0);
      networkBreakdown[network].revenue += parseFloat(t.fee_amount || 0);
    });

    // Unique customers
    const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;

    // Daily breakdown for chart (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayTransactions = completed.filter(t => {
        const tDate = new Date(t.created_date);
        return tDate >= dayStart && tDate < dayEnd;
      });

      dailyData.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayTransactions.length,
        volume: dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        revenue: dayTransactions.reduce((sum, t) => sum + parseFloat(t.fee_amount || 0), 0)
      });
    }

    return {
      periodStats: {
        totalTransactions: transactions.length,
        completedTransactions: completed.length,
        pendingTransactions: pending.length,
        awaitingCustomer: awaitingCustomer.length,
        awaitingAgent: awaitingAgent.length,
        totalVolume,
        totalRevenue,
        uniqueCustomers,
        avgTransactionValue: completed.length > 0 ? totalVolume / completed.length : 0,
        avgFee: completed.length > 0 ? totalRevenue / completed.length : 0,
        successRate: transactions.length > 0 
          ? ((completed.length / transactions.length) * 100).toFixed(1) 
          : 0
      },
      allTimeStats: {
        totalTransactions: all.length,
        totalVolume: allTimeVolume,
        totalRevenue: allTimeRevenue
      },
      serviceBreakdown,
      networkBreakdown,
      dailyData,
      currency: 'AED'
    };
  },

  /**
   * Get customer transactions
   */
  async getMyTransactions(limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        agent:profiles!agent_id(id, full_name, avatar_url, phone)
      `)
      .eq('customer_id', user.id)
      .order('created_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Complete a transaction (agent action) - marks agent as confirmed
   */
  async agentConfirm(transactionId) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ 
        agent_confirmed: true
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Customer confirms transaction completion
   */
  async customerConfirm(transactionId) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ 
        customer_confirmed: true
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Legacy complete method - marks both as confirmed
   */
  async complete(transactionId) {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        customer_confirmed: true,
        agent_confirmed: true,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) throw error;
  },

  /**
   * Cancel a transaction
   */
  async cancel(transactionId, notes = null) {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status: 'cancelled',
        notes: notes
      })
      .eq('id', transactionId);

    if (error) throw error;
  },

  /**
   * Calculate fee for a transaction based on agent settings
   */
  calculateFee(amount, feeStructure, network, serviceType) {
    if (!feeStructure || !amount) return { fee: 0, percentage: 0 };

    // Check for network-specific fee first
    const networkFee = feeStructure[network];
    const serviceFee = feeStructure[serviceType];
    const defaultFee = feeStructure.default || { percentage: 2 };

    const feeConfig = networkFee || serviceFee || defaultFee;

    let fee = 0;
    let percentage = 0;

    if (feeConfig.percentage) {
      percentage = parseFloat(feeConfig.percentage);
      fee = (amount * percentage) / 100;
    }

    if (feeConfig.flat) {
      fee += parseFloat(feeConfig.flat);
    }

    // Apply min/max fee limits if set
    if (feeConfig.minFee && fee < feeConfig.minFee) {
      fee = parseFloat(feeConfig.minFee);
    }
    if (feeConfig.maxFee && fee > feeConfig.maxFee) {
      fee = parseFloat(feeConfig.maxFee);
    }

    return { fee: Math.round(fee * 100) / 100, percentage };
  }
};
