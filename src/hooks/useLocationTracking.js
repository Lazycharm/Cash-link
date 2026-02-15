import { useEffect, useRef, useState } from 'react';
import { updateLocation, setOnlineStatus, getCurrentLocation } from '@/utils/location';

/**
 * Hook for tracking user location and updating it periodically
 * Used by agents and drivers to share their location
 * 
 * @param {boolean} isOnline - Whether the user is currently online
 * @param {number} updateInterval - Interval in milliseconds (default: 20000 = 20 seconds)
 * @returns {Object} { location, error, isTracking }
 */
export function useLocationTracking(isOnline, updateInterval = 20000) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  // Update location to Supabase
  const updateLocationToDB = async (lat, lng) => {
    try {
      await updateLocation(lat, lng, isOnline);
      setLocation({ lat, lng });
      setError(null);
    } catch (err) {
      console.error('Failed to update location:', err);
      setError(err.message);
    }
  };

  // Start location tracking
  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Get initial location
    try {
      const currentLocation = await getCurrentLocation();
      await updateLocationToDB(currentLocation.lat, currentLocation.lng);
    } catch (err) {
      setError(err.message);
      setIsTracking(false);
      return;
    }

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateLocationToDB(latitude, longitude);
      },
      (err) => {
        console.error('Location watch error:', err);
        setError('Failed to track location. Please check your GPS settings.');
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Always get fresh location
      }
    );

    // Also update periodically via interval (backup)
    intervalRef.current = setInterval(async () => {
      try {
        const currentLocation = await getCurrentLocation();
        await updateLocationToDB(currentLocation.lat, currentLocation.lng);
      } catch (err) {
        console.error('Periodic location update failed:', err);
      }
    }, updateInterval);
  };

  // Stop location tracking
  const stopTracking = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    
    // Set offline status
    try {
      await setOnlineStatus(false);
    } catch (err) {
      console.error('Failed to set offline status:', err);
    }
  };

  // Effect to start/stop tracking based on isOnline
  useEffect(() => {
    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
}
