/**
 * RideBooking Entity - Supabase Wrapper
 * Handles ride bookings between customers and drivers
 */
import { supabase } from '@/lib/supabase';

export const RideBooking = {
  /**
   * Create a new ride booking
   */
  async create(bookingData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to create a booking');

    const { data, error } = await supabase
      .from('ride_bookings')
      .insert([{
        ...bookingData,
        customer_id: bookingData.customer_id || user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url, phone),
        driver:profiles!driver_id(id, full_name, avatar_url, phone)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all bookings
   */
  async list() {
    const { data, error } = await supabase
      .from('ride_bookings')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url, phone),
        driver:profiles!driver_id(id, full_name, avatar_url, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter bookings by conditions
   */
  async filter(conditions, orderBy = '-created_at', limit = null) {
    let query = supabase.from('ride_bookings').select(`
      *,
      customer:profiles!customer_id(id, full_name, avatar_url, phone),
      driver:profiles!driver_id(id, full_name, avatar_url, phone)
    `);

    // Apply filters
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
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
   * Get a single booking by ID
   */
  async get(bookingId) {
    const { data, error } = await supabase
      .from('ride_bookings')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url, phone),
        driver:profiles!driver_id(id, full_name, avatar_url, phone)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a booking
   */
  async update(bookingId, updates) {
    const { data, error } = await supabase
      .from('ride_bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url, phone),
        driver:profiles!driver_id(id, full_name, avatar_url, phone)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Accept a booking (driver action)
   */
  async accept(bookingId) {
    return this.update(bookingId, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    });
  },

  /**
   * Start a ride
   */
  async startRide(bookingId) {
    return this.update(bookingId, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    });
  },

  /**
   * Complete a ride
   */
  async complete(bookingId, driverRating = null) {
    const updates = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      payment_status: 'paid'
    };
    if (driverRating) {
      updates.driver_rating = driverRating;
    }
    return this.update(bookingId, updates);
  },

  /**
   * Cancel a booking
   */
  async cancel(bookingId, reason = null) {
    return this.update(bookingId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason
    });
  },

  /**
   * Reject a booking (driver action)
   */
  async reject(bookingId, reason = null) {
    return this.update(bookingId, {
      status: 'rejected',
      cancellation_reason: reason
    });
  },

  /**
   * Delete a booking
   */
  async delete(bookingId) {
    const { error } = await supabase
      .from('ride_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
    return true;
  },

  /**
   * Get driver stats
   */
  async getDriverStats(driverId) {
    const { data: allBookings, error } = await supabase
      .from('ride_bookings')
      .select('status, fare, distance, created_at, driver_rating')
      .eq('driver_id', driverId);

    if (error) throw error;

    const bookings = allBookings || [];
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate stats
    const totalRides = bookings.filter(b => b.status === 'completed').length;
    const pendingRides = bookings.filter(b => ['pending', 'accepted'].includes(b.status)).length;
    const completedRides = bookings.filter(b => b.status === 'completed').length;
    const cancelledRides = bookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length;

    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.fare) || 0), 0);

    const totalDistance = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.distance) || 0), 0);

    // This month stats
    const thisMonthBookings = bookings.filter(b => 
      new Date(b.created_at) >= thisMonth && b.status === 'completed'
    );
    const thisMonthRides = thisMonthBookings.length;
    const thisMonthEarnings = thisMonthBookings.reduce((sum, b) => sum + (parseFloat(b.fare) || 0), 0);

    // Today stats
    const todayBookings = bookings.filter(b => 
      new Date(b.created_at) >= today && b.status === 'completed'
    );
    const todayRides = todayBookings.length;
    const todayEarnings = todayBookings.reduce((sum, b) => sum + (parseFloat(b.fare) || 0), 0);

    // Ratings
    const ratedBookings = bookings.filter(b => b.driver_rating);
    const avgRating = ratedBookings.length > 0
      ? ratedBookings.reduce((sum, b) => sum + b.driver_rating, 0) / ratedBookings.length
      : 0;

    // Acceptance & completion rates
    const totalRequests = bookings.length;
    const acceptedOrCompleted = bookings.filter(b => 
      ['accepted', 'in_progress', 'completed'].includes(b.status)
    ).length;
    const acceptanceRate = totalRequests > 0 ? (acceptedOrCompleted / totalRequests) * 100 : 100;
    const completionRate = acceptedOrCompleted > 0 
      ? (completedRides / acceptedOrCompleted) * 100 
      : 100;

    return {
      totalRides,
      pendingRides,
      completedRides,
      cancelledRides,
      totalEarnings,
      totalDistance,
      thisMonthRides,
      thisMonthEarnings,
      todayRides,
      todayEarnings,
      avgRating,
      reviewCount: ratedBookings.length,
      acceptanceRate,
      completionRate
    };
  },

  /**
   * Get bookings for a specific driver
   */
  async getDriverBookings(driverId, status = null, limit = 50) {
    let query = supabase
      .from('ride_bookings')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url, phone)
      `)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get pending bookings for a driver
   */
  async getPendingForDriver(driverId) {
    return this.getDriverBookings(driverId, ['pending', 'accepted', 'in_progress']);
  },

  /**
   * Subscribe to booking changes for a driver
   */
  subscribeToDriverBookings(driverId, callback) {
    const subscription = supabase
      .channel(`driver_bookings_${driverId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ride_bookings',
          filter: `driver_id=eq.${driverId}`
        }, 
        callback
      )
      .subscribe();

    return subscription;
  }
};
