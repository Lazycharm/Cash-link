import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon for agents
const createAgentIcon = (isOnline) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${isOnline ? '#10b981' : '#6b7280'};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom marker icon for drivers
const createDriverIcon = (isOnline) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${isOnline ? '#f97316' : '#6b7280'};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map view updates
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
}

/**
 * NearbyMap Component
 * 
 * @param {Object} props
 * @param {Array} props.markers - Array of marker objects with {id, lat, lng, name, distance, phone, type, isOnline}
 * @param {Object} props.userLocation - User's current location {lat, lng}
 * @param {Function} props.onMarkerClick - Callback when marker is clicked
 * @param {String} props.markerType - 'agent' or 'driver'
 * @param {Number} props.height - Map height in pixels (default: 400)
 * @param {Boolean} props.showUserLocation - Whether to show user's location marker
 */
export default function NearbyMap({
  markers = [],
  userLocation = null,
  onMarkerClick = null,
  markerType = 'agent',
  height = 400,
  showUserLocation = true,
}) {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // Calculate center point (use first marker or user location or default to Dubai)
  const getCenter = () => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    if (markers.length > 0 && markers[0].lat && markers[0].lng) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    // Default to Dubai, UAE
    return { lat: 25.2048, lng: 55.2708 };
  };

  const center = getCenter();

  // Format distance for display
  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height: `${height}px` }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewUpdater center={center} zoom={13} />

        {/* User location marker */}
        {showUserLocation && userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div style="
                width: 20px;
                height: 20px;
                background: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-sm font-medium">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Nearby markers */}
        {markers.map((marker) => {
          if (!marker.lat || !marker.lng) return null;
          
          const distance = marker.distance || 
            (userLocation && userLocation.lat && userLocation.lng
              ? calculateDistance(userLocation.lat, userLocation.lng, marker.lat, marker.lng)
              : null);

          const icon = markerType === 'driver' 
            ? createDriverIcon(marker.isOnline !== false)
            : createAgentIcon(marker.isOnline !== false);

          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(marker);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="font-semibold text-gray-900 mb-1">
                    {marker.name || marker.business_name || marker.full_name || 'Unknown'}
                  </div>
                  {distance !== null && (
                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {formatDistance(distance)}
                    </div>
                  )}
                  {marker.phone && (
                    <Button
                      size="sm"
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        const phone = marker.phone.replace('+', '');
                        const message = markerType === 'driver'
                          ? 'Hello, I found you on CashLink and would like to book a ride'
                          : 'Hello, I found you on CashLink and would like to use GetCash services';
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
