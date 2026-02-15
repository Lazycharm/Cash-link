/**
 * Location utilities for GPS tracking and nearby search
 */

/**
 * Get user's current location using browser Geolocation API
 * @returns {Promise<{lat: number, lng: number}>}
 */
export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Could not determine your location';
        if (error.code === 1) {
          errorMessage = 'Location access denied. Please enable location permissions.';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please check your GPS settings.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance === null || distance === undefined) return '';
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
}

/**
 * Update user's location in Supabase
 * @param {number} lat 
 * @param {number} lng 
 * @param {boolean} isOnline 
 * @returns {Promise<void>}
 */
export async function updateLocation(lat, lng, isOnline = true) {
  const { supabase } = await import('@/lib/supabase');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      latitude: lat,
      longitude: lng,
      is_online: isOnline,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    throw error;
  }
}

/**
 * Set user online/offline status
 * @param {boolean} isOnline 
 * @returns {Promise<void>}
 */
export async function setOnlineStatus(isOnline) {
  const { supabase } = await import('@/lib/supabase');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const updateData = {
    is_online: isOnline,
    updated_at: new Date().toISOString(),
  };

  // If going offline, don't update last_seen
  // If going online, update last_seen
  if (isOnline) {
    updateData.last_seen = new Date().toISOString();
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    throw error;
  }
}
