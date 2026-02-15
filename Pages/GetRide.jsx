import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
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
  Users
} from "lucide-react";

const DriverCard = ({ driver, onContact, onFavorite, isFavorited }) => (
  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
    <CardHeader className="relative">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">{driver.full_name}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{driver.location?.city}, {driver.location?.emirate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">4.9</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onFavorite(driver)}
            className={isFavorited ? 'text-red-500' : 'text-gray-400'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="relative">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-100 text-orange-700">Available Now</Badge>
          <Badge className="bg-blue-100 text-blue-700">AC Car</Badge>
          <Badge className="bg-green-100 text-green-700">Airport Trips</Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Car className="w-4 h-4" />
          <span>Toyota Camry 2022 - White</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Available: 6:00 AM - 12:00 AM</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">From AED 25</span>
          </div>
          <Button 
            size="sm"
            onClick={() => onContact(driver)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Book Ride
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Mock driver data
const sampleDrivers = [
  {
    id: "1",
    full_name: "Mohammed Ali",
    location: { city: "Dubai", emirate: "Dubai" },
    phone_number: "+971501234567",
    role: "driver",
    kyc_status: "approved"
  },
  {
    id: "2", 
    full_name: "James Ochieng",
    location: { city: "Abu Dhabi", emirate: "Abu Dhabi" },
    phone_number: "+971502345678",
    role: "driver",
    kyc_status: "approved"
  },
  {
    id: "3",
    full_name: "Hassan Ibrahim",
    location: { city: "Sharjah", emirate: "Sharjah" },
    phone_number: "+971503456789",
    role: "driver", 
    kyc_status: "approved"
  }
];

export default function GetRide() {
  const [user, setUser] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchQuery, locationFilter]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Use sample data for drivers
      setDrivers(sampleDrivers);
      
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('favoriteDrivers');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setDrivers(sampleDrivers);
    }
    setIsLoading(false);
  };

  const filterDrivers = () => {
    let filtered = drivers;
    
    if (searchQuery) {
      filtered = filtered.filter(driver => 
        driver.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(driver => 
        driver.location?.emirate === locationFilter
      );
    }
    
    setFilteredDrivers(filtered);
  };

  const handleContactDriver = (driver) => {
    if (driver.phone_number) {
      window.open(`https://wa.me/${driver.phone_number.replace('+', '')}?text=Hello, I found you on CashLink and would like to book a ride`, '_blank');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Car className="w-10 h-10 text-orange-600" />
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

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <CardContent className="p-6 relative">
              <Car className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Safe Rides</h3>
              <p className="text-orange-100">Verified drivers with clean vehicles and safety protocols</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <CardContent className="p-6 relative">
              <DollarSign className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Fair Prices</h3>
              <p className="text-red-100">Competitive rates with no hidden fees or surge pricing</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <CardContent className="p-6 relative">
              <Users className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-purple-100">Support fellow Africans while getting around the UAE</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by driver name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by Emirate" />
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

        {/* Drivers List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Drivers</h2>
            <Badge variant="outline" className="px-3 py-1">
              {filteredDrivers.length} drivers available
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
}