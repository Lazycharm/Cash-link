# Nearby Map Discovery System - Integration Guide

## Overview

This document describes the nearby map discovery system added to CashLink. The system allows users to find nearby agents and drivers on an interactive map, while agents and drivers can share their location when online.

## Features Implemented

1. **Interactive Map Component** - Leaflet.js with OpenStreetMap tiles
2. **Location Tracking** - GPS-based location updates for agents/drivers
3. **Nearby Search** - Find agents/drivers within 5km radius
4. **Real-time Updates** - Map markers refresh every 25 seconds
5. **Online/Offline Toggle** - Agents and drivers can control their visibility

## Database Changes

### Migration File
- **File**: `supabase/migrations/011_location_tracking.sql`
- **New Columns Added to `profiles` table**:
  - `latitude` (DOUBLE PRECISION) - Current latitude
  - `longitude` (DOUBLE PRECISION) - Current longitude
  - `is_online` (BOOLEAN) - Online status (default: false)
  - `last_seen` (TIMESTAMPTZ) - Last location update timestamp

### Running the Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/011_location_tracking.sql`
4. Verify columns were added successfully

## Files Added

### Components
- `src/components/map/NearbyMap.jsx` - Reusable map component
- `src/components/map/LocationToggle.jsx` - Online/offline toggle component

### Utilities
- `src/utils/location.js` - Location utilities (GPS, distance calculation)
- `src/utils/nearbySearch.js` - Nearby search functions

### Hooks
- `src/hooks/useLocationTracking.js` - Location tracking hook

## Files Modified

### Pages
- `src/pages/GetCash.jsx` - Added map integration
- `src/pages/GetRide.jsx` - Added map integration
- `src/pages/MoneyAgentDashboard.jsx` - Added location toggle
- `src/pages/DriverDashboard.jsx` - Added location toggle

### Styles
- `src/index.css` - Added Leaflet CSS import

## Dependencies Added

```json
{
  "leaflet": "^latest",
  "react-leaflet": "^4.2.1"
}
```

Install with:
```bash
npm install leaflet react-leaflet@^4.2.1 --legacy-peer-deps
```

## Usage

### For Users (Get Cash / Get Ride)

1. Navigate to `/get-cash` or `/get-ride`
2. Browser will request location permission
3. Click "Show Map" to view nearby agents/drivers
4. Map shows:
   - User's location (blue marker)
   - Nearby agents/drivers (green/orange markers)
   - Distance from user
   - Contact button in popup

### For Agents

1. Navigate to `/agent-dashboard`
2. Go to "Overview" tab
3. Find "Go Online for Transactions" toggle
4. Enable to start sharing location
5. Location updates every 20 seconds automatically

### For Drivers

1. Navigate to `/driver-dashboard`
2. Find "Go Online for Rides" toggle at top
3. Enable to start sharing location
4. Location updates every 20 seconds automatically

## Technical Details

### Location Update Frequency
- **Agents/Drivers**: Every 20 seconds when online
- **Map Refresh**: Every 25 seconds for users viewing maps

### Search Radius
- Default: 5 kilometers
- Only shows online agents/drivers
- Sorted by distance (nearest first)

### Privacy & Security
- Location data only stored when user is online
- Only online agents/drivers appear on maps
- Users must grant location permission
- All location data stored in Supabase `profiles` table

## Browser Compatibility

- Requires modern browser with Geolocation API
- Works on:
  - Chrome/Edge (desktop & mobile)
  - Firefox (desktop & mobile)
  - Safari (desktop & mobile)
  - Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Verify Leaflet CSS is imported in `index.css`
- Ensure OpenStreetMap tiles are accessible

### Location Not Updating
- Check browser location permissions
- Verify GPS is enabled on mobile devices
- Check network connectivity

### No Nearby Results
- Verify agents/drivers are online (`is_online = true`)
- Check they have valid `latitude` and `longitude`
- Ensure they're within 5km radius
- Verify KYC status is 'approved'

## Performance Considerations

- Map markers are filtered client-side after fetching
- Only online users with coordinates are queried
- Indexes added for efficient location queries
- Map updates are debounced to prevent excessive API calls

## Backward Compatibility

- All existing features remain unchanged
- Map is optional - users can still use list view
- Location tracking is opt-in for agents/drivers
- No breaking changes to existing APIs

## Future Enhancements

Potential improvements:
- Custom search radius slider
- Route directions to agent/driver
- Estimated arrival time
- Push notifications for nearby requests
- Heat map of agent/driver density

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database migration completed
3. Check Supabase RLS policies allow location updates
4. Ensure user has proper role (agent/driver)
