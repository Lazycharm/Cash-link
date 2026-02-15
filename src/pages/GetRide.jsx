import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Car, 
  MapPin, 
  Phone, 
  Clock, 
  Search,
  Filter,
  Star,
  DollarSign,
  Heart,
  Users,
  Plane,
  Route,
  Package,
  Wifi,
  Zap,
  PawPrint,
  Baby,
  Snowflake,
  Loader2,
  AlertCircle
} from "lucide-react";
import NearbyMap from "@/components/map/NearbyMap";
import { findNearbyDrivers } from "@/utils/nearbySearch";
import { getCurrentLocation } from "@/utils/location";

const DriverCard = ({ driver, onContact, onFavorite, isFavorited }) => {
  const settings = driver.driver_settings || {};
  const vehicle = settings.vehicle || {};
  const features = settings.features || {};
  const rates = settings.rates || {};
  const workingHours = settings.workingHours || { start: '06:00', end: '23:00' };
  const services = settings.services || {};

  const formatTime = (time) => {
    if (!time) return '';
    const [hours] = time.split(':');
    const h = parseInt(hours);
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
      <CardHeader className="relative p-4 md:p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {driver.avatar_url ? (
              <img 
                src={driver.avatar_url} 
                alt={driver.business_name || driver.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {(driver.business_name?.[0] || driver.full_name?.[0] || 'D').toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg font-bold text-gray-900 truncate">{driver.business_name || driver.full_name}</CardTitle>
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-600 truncate">{driver.location?.city || 'UAE'}, {driver.location?.emirate || 'Dubai'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
              <span className="text-xs md:text-sm font-medium text-gray-700">{driver.rating?.toFixed(1) || 'New'}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onFavorite(driver)}
              className={`h-8 w-8 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative p-4 md:p-6 pt-0 md:pt-0">
        <div className="space-y-2.5 md:space-y-3">
          {/* Service badges */}
          <div className="flex flex-wrap gap-1.5">
            {settings.isAvailable !== false && <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>}
            {features.hasAC && <Badge className="bg-blue-100 text-blue-700 text-xs"><Snowflake className="w-3 h-3 mr-1" />AC</Badge>}
            {services.airport_transfer && <Badge className="bg-purple-100 text-purple-700 text-xs"><Plane className="w-3 h-3 mr-1" />Airport</Badge>}
            {services.long_distance && <Badge className="bg-orange-100 text-orange-700 text-xs"><Route className="w-3 h-3 mr-1" />Long Distance</Badge>}
            {features.hasWifi && <Badge className="bg-cyan-100 text-cyan-700 text-xs"><Wifi className="w-3 h-3 mr-1" />WiFi</Badge>}
            {features.hasCharger && <Badge className="bg-yellow-100 text-yellow-700 text-xs"><Zap className="w-3 h-3 mr-1" />Charger</Badge>}
            {features.acceptsPets && <Badge className="bg-pink-100 text-pink-700 text-xs"><PawPrint className="w-3 h-3 mr-1" />Pets OK</Badge>}
            {features.childSeat && <Badge className="bg-teal-100 text-teal-700 text-xs"><Baby className="w-3 h-3 mr-1" />Child Seat</Badge>}
          </div>
          
          {/* Vehicle info */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <Car className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {vehicle.make && vehicle.model 
                ? `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ''}` 
                : vehicle.type 
                  ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) 
                  : 'Sedan'}
              {vehicle.seats && ` • ${vehicle.seats} seats`}
            </span>
          </div>
          
          {/* Working hours */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatTime(workingHours.start)} - {formatTime(workingHours.end)}</span>
          </div>
          
          {/* Pricing and action */}
          <div className="flex items-center justify-between pt-2.5 md:pt-3 border-t gap-2">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs md:text-sm font-medium text-gray-700">
                From AED {rates.baseRate || 25}{rates.perKm ? ` + ${rates.perKm}/km` : ''}
              </span>
            </div>
            <Button 
              size="sm"
              onClick={() => onContact(driver)}
              className="bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs md:text-sm px-3"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GetRide() {
  const [user, setUser] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load nearby drivers when user location is available
  const loadNearbyDrivers = async () => {
    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return;
    }

    setIsLoadingNearby(true);
    try {
      const nearby = await findNearbyDrivers(userLocation.lat, userLocation.lng, 5);
      setNearbyDrivers(nearby);
    } catch (error) {
      console.error("Error loading nearby drivers:", error);
      setNearbyDrivers([]);
    } finally {
      setIsLoadingNearby(false);
    }
  };

  useEffect(() => {
    loadData();

    // Get user location
    getCurrentLocation()
      .then((location) => {
        setUserLocation(location);
        setLocationError(null);
      })
      .catch((error) => {
        console.error("Error getting user location:", error);
        setLocationError(error.message);
      });
  }, []);

  // Load nearby drivers when location is available
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      loadNearbyDrivers();
      
      // Refresh nearby drivers every 25 seconds
      const interval = setInterval(() => {
        loadNearbyDrivers();
      }, 25000);
      
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchQuery, locationFilter]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Fetch real drivers from database
      const { data: driversData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .eq('kyc_status', 'approved')
        .eq('subscription_status', 'active')
        .order('is_promoted', { ascending: false })
        .order('created_date', { ascending: false });

      if (error) throw error;

      // Get ratings for each driver
      const driversWithRatings = await Promise.all(
        (driversData || []).map(async (driver) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewed_user_id', driver.id)
            .eq('status', 'active');
          
          const rating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : null;
          
          return { ...driver, rating, reviewCount: reviews?.length || 0 };
        })
      );

      setDrivers(driversWithRatings);
      
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('favoriteDrivers');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Error loading drivers:", error);
      setDrivers([]);
    }
    setIsLoading(false);
  };

  const filterDrivers = () => {
    let filtered = drivers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(driver => 
        driver.full_name?.toLowerCase().includes(query) ||
        driver.business_name?.toLowerCase().includes(query) ||
        driver.location?.city?.toLowerCase().includes(query) ||
        driver.driver_settings?.vehicle?.make?.toLowerCase().includes(query) ||
        driver.driver_settings?.vehicle?.model?.toLowerCase().includes(query)
      );
    }
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(driver => 
        driver.location?.emirate === locationFilter ||
        driver.driver_settings?.serviceAreas?.includes(locationFilter)
      );
    }
    
    setFilteredDrivers(filtered);
  };

  const handleContactDriver = (driver) => {
    const phone = driver.phone_number || driver.phone;
    if (phone) {
      const driverName = driver.business_name || driver.full_name || 'Driver';
      window.open(`https://wa.me/${phone.replace('+', '')}?text=Hello ${driverName}, I found you on CashLink and would like to book a ride`, '_blank');
    } else {
      alert('Contact information not available');
    }
  };

  const handleFavorite = (driver) => {
    const newFavorites = favorites.includes(driver.id) 
      ? favorites.filter(id => id !== driver.id)
      : [...favorites, driver.id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteDrivers', JSON.stringify(newFavorites));
  };

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Finding available drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Fixed Header for Mobile */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm md:hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-orange-600" />
              <h1 className="text-xl font-bold text-gray-900">Get a Ride</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Favorites</p>
              <p className="text-lg font-bold text-orange-600">{favorites.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:block text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Car className="w-8 h-8 lg:w-10 lg:h-10 text-orange-600" />
                Get a Ride
              </h1>
              <p className="text-gray-600 mt-2">Safe, reliable rides with trusted African drivers</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">Favorite Drivers</p>
              <p className="text-2xl font-bold text-orange-600">{favorites.length}</p>
            </div>
          </div>
        </div>

        {/* Service Features - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden">
            <CardContent className="p-4 md:p-6 relative">
              <Car className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Safe Rides</h3>
              <p className="text-orange-100 text-xs md:text-sm hidden sm:block">Verified drivers with clean vehicles</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden">
            <CardContent className="p-4 md:p-6 relative">
              <DollarSign className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Fair Prices</h3>
              <p className="text-red-100 text-xs md:text-sm hidden sm:block">No hidden fees or surge pricing</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-4 md:p-6 relative">
              <Users className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Community</h3>
              <p className="text-purple-100 text-xs md:text-sm hidden sm:block">Support fellow Africans in UAE</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Mobile Optimized */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Input
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 rounded-xl text-sm md:text-base h-10 md:h-11"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-40 md:w-48 rounded-xl h-10 md:h-11 text-sm md:text-base">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Emirate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emirates</SelectItem>
                  {emirates.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location Error Message */}
        {locationError && (
          <Card className="border-0 bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mt-0.5 flex-shrink-0"/>
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-yellow-900">Location Disabled</h3>
                  <p className="text-yellow-800 text-xs md:text-sm">
                    {locationError}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby Map Section */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Nearby Drivers on Map
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
            </CardHeader>
            {showMap && (
              <CardContent>
                {isLoadingNearby ? (
                  <div className="h-96 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : nearbyDrivers.length > 0 ? (
                  <div className="space-y-4">
                    <NearbyMap
                      markers={nearbyDrivers.map(driver => ({
                        id: driver.id,
                        lat: driver.latitude,
                        lng: driver.longitude,
                        name: driver.business_name || driver.full_name,
                        distance: driver.distance,
                        phone: driver.phone || driver.phone_number,
                        type: 'driver',
                        isOnline: driver.is_online,
                      }))}
                      userLocation={userLocation}
                      markerType="driver"
                      height={400}
                      onMarkerClick={(marker) => {
                        const driver = drivers.find(d => d.id === marker.id);
                        if (driver) {
                          handleContactDriver(driver);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Showing {nearbyDrivers.length} driver{nearbyDrivers.length !== 1 ? 's' : ''} within 5km. Map updates every 25 seconds.
                    </p>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No nearby drivers found</p>
                      <p className="text-xs text-gray-400 mt-1">Try expanding your search or check back later</p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Drivers List */}
        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Available Drivers</h2>
            <Badge variant="outline" className="px-2 md:px-3 py-1 text-xs md:text-sm">
              {filteredDrivers.length} found
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onContact={handleContactDriver}
                onFavorite={handleFavorite}
                isFavorited={favorites.includes(driver.id)}
              />
            ))}
          </div>
          
          {filteredDrivers.length === 0 && (
            <Card className="border-0 bg-orange-50 border-orange-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <Car className="w-8 h-8 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-orange-900 mb-1">No Drivers Found</h3>
                    <p className="text-orange-800 text-xs md:text-sm">
                      No drivers match your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}