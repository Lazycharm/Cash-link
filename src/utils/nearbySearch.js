/**
 * Nearby search utilities for finding agents/drivers within radius
 */
import { supabase } from '@/lib/supabase';
import { calculateDistance } from './location';

/**
 * Find nearby agents within a radius (in km)
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 5)
 * @returns {Promise<Array>} Array of nearby agents with distance calculated
 */
export async function findNearbyAgents(lat, lng, radiusKm = 5) {
  if (!lat || !lng) {
    throw new Error('Latitude and longitude are required');
  }

  // First, get all online agents with location data
  const { data: agents, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('app_role', 'agent')
    .eq('kyc_status', 'approved')
    .eq('is_online', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    throw error;
  }

  if (!agents || agents.length === 0) {
    return [];
  }

  // Calculate distance for each agent and filter by radius
  const nearbyAgents = agents
    .map((agent) => {
      const distance = calculateDistance(lat, lng, agent.latitude, agent.longitude);
      return {
        ...agent,
        distance,
      };
    })
    .filter((agent) => agent.distance !== null && agent.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance); // Sort by distance

  return nearbyAgents;
}

/**
 * Find nearby drivers within a radius (in km)
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 5)
 * @returns {Promise<Array>} Array of nearby drivers with distance calculated
 */
export async function findNearbyDrivers(lat, lng, radiusKm = 5) {
  if (!lat || !lng) {
    throw new Error('Latitude and longitude are required');
  }

  // First, get all online drivers with location data
  const { data: drivers, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('app_role', 'driver')
    .eq('kyc_status', 'approved')
    .eq('is_online', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    throw error;
  }

  if (!drivers || drivers.length === 0) {
    return [];
  }

  // Calculate distance for each driver and filter by radius
  const nearbyDrivers = drivers
    .map((driver) => {
      const distance = calculateDistance(lat, lng, driver.latitude, driver.longitude);
      return {
        ...driver,
        distance,
      };
    })
    .filter((driver) => driver.distance !== null && driver.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance); // Sort by distance

  return nearbyDrivers;
}
