import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { setOnlineStatus } from '@/utils/location';
import { useLocationTracking } from '@/hooks/useLocationTracking';

/**
 * Location Toggle Component
 * Allows agents/drivers to go online/offline and share their location
 * 
 * @param {Object} props
 * @param {boolean} props.initialOnline - Initial online state
 * @param {Function} props.onStatusChange - Callback when status changes
 * @param {String} props.userType - 'agent' or 'driver'
 */
export default function LocationToggle({ 
  initialOnline = false, 
  onStatusChange = null,
  userType = 'agent' 
}) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  const { location, error: trackingError, isTracking } = useLocationTracking(isOnline);

  useEffect(() => {
    setIsOnline(initialOnline);
  }, [initialOnline]);

  const handleToggle = async (checked) => {
    setIsUpdating(true);
    setError(null);

    try {
      // Update online status in database
      await setOnlineStatus(checked);
      setIsOnline(checked);
      
      if (onStatusChange) {
        onStatusChange(checked);
      }
    } catch (err) {
      console.error('Failed to update online status:', err);
      setError(err.message || 'Failed to update status');
      setIsOnline(!checked); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const displayError = error || trackingError;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex-1">
          <Label htmlFor="online-toggle" className="text-base font-medium cursor-pointer">
            {userType === 'driver' ? 'Go Online for Rides' : 'Go Online for Transactions'}
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            {isOnline 
              ? 'You are visible to customers and sharing your location'
              : 'You are hidden from customer searches'
            }
          </p>
          {isOnline && isTracking && location && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Location tracking active
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isUpdating && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
          <Switch
            id="online-toggle"
            checked={isOnline}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>

      {displayError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Location Error</p>
            <p className="text-xs text-red-700 mt-1">{displayError}</p>
            {displayError.includes('denied') && (
              <p className="text-xs text-red-600 mt-1">
                Please enable location permissions in your browser settings.
              </p>
            )}
          </div>
        </div>
      )}

      {isOnline && !isTracking && !displayError && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            Waiting for location permission...
          </p>
        </div>
      )}
    </div>
  );
}
