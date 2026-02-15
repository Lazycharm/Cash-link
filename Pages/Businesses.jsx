
import React, { useState, useEffect, useCallback } from "react";
import { Business } from "@/entities/Business";
import { User } from "@/entities/User";
import { AppSettings } from "@/entities/AppSettings"; // Import AppSettings
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Search,
  Filter,
  Star,
  ExternalLink,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { createPageUrl } from "@/utils"; // Import createPageUrl

const BusinessCard = ({ business }) => {
  const categoryColors = {
    restaurant: "bg-red-100 text-red-700",
    transport: "bg-blue-100 text-blue-700",
    grocery: "bg-green-100 text-green-700",
    services: "bg-purple-100 text-purple-700",
    entertainment: "bg-pink-100 text-pink-700",
    retail: "bg-amber-100 text-amber-700",
    other: "bg-gray-100 text-gray-700"
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>

      {business.images && business.images[0] && (
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={business.images[0]}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
              {business.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{business.location?.city}, {business.location?.emirate}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">{business.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-3">
          <p className="text-gray-600 text-sm line-clamp-2">{business.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge className={categoryColors[business.category] || categoryColors.other}>
              {(business.category || 'other').replace('_', ' ')}
            </Badge>
            {business.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                Featured
              </Badge>
            )}
          </div>

          {business.hours?.monday && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Today: {business.hours.monday}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <Link to={createPageUrl(`BusinessDetail?id=${business.id}`)} className="flex-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Businesses() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Fetch current user, all approved businesses, all users with active subscriptions, and app settings
      const [currentUser, allBusinesses, allUsersWithActiveSubscription, appSettings] = await Promise.all([
        User.me(),
        Business.filter({ status: 'approved' }),
        User.filter({ subscription_status: 'active' }),
        AppSettings.list(),
      ]);

      setUser(currentUser);
      setBusinesses(allBusinesses);
      // Store IDs of active users in a Set for efficient lookup
      setActiveUsers(new Set(allUsersWithActiveSubscription.map(u => u.id)));

      // Check if subscriptions are enabled from app settings
      if (appSettings.length > 0) {
        setSubscriptionsEnabled(appSettings[0].subscriptions_enabled);
      } else {
        // Default to true if no settings found
        setSubscriptionsEnabled(true);
      }

    } catch (error) {
      console.error("Error loading businesses:", error);
      // Set sample data or empty arrays if entities don't exist or an error occurs
      setBusinesses([]);
      setActiveUsers(new Set()); // Ensure activeUsers is reset on error
      setSubscriptionsEnabled(true); // Default to true on error as well, or handle as per design
    }
    setIsLoading(false);
  }, []);

  const filterBusinesses = useCallback(() => {
    let filtered = [...businesses]; // Create a new array to avoid mutation

    if (searchQuery) {
      filtered = filtered.filter(business =>
        business.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(business => business.category === categoryFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(business => business.location?.emirate === locationFilter);
    }

    // Sort to prioritize subscribed and featured businesses
    filtered.sort((a, b) => {
      const aIsSubscribed = subscriptionsEnabled && activeUsers.has(a.owner_id);
      const bIsSubscribed = subscriptionsEnabled && activeUsers.has(b.owner_id);

      // Rule 1: Featured and Subscribed (highest priority)
      if ((a.is_featured && aIsSubscribed) && !(b.is_featured && bIsSubscribed)) return -1;
      if (!(a.is_featured && aIsSubscribed) && (b.is_featured && bIsSubscribed)) return 1;

      // Rule 2: Featured (but not subscribed)
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      // Rule 3: Subscribed (but not featured)
      if (aIsSubscribed && !bIsSubscribed) return -1;
      if (!aIsSubscribed && bIsSubscribed) return 1;

      // Rule 4: Default sort by rating
      return (b.rating || 0) - (a.rating || 0);
    });

    setFilteredBusinesses(filtered);
  }, [businesses, searchQuery, categoryFilter, locationFilter, activeUsers, subscriptionsEnabled]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterBusinesses();
  }, [filterBusinesses]);

  const categories = [
    { value: 'restaurant', label: 'Restaurants' },
    { value: 'transport', label: 'Transport' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'services', label: 'Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Store className="w-10 h-10 text-amber-600" />
                African Businesses
              </h1>
              <p className="text-gray-600 mt-2">Discover authentic African restaurants, shops, and services in the UAE</p>
            </div>
            {user?.role === 'vendor' && (
              <Link to={createPageUrl("AddBusiness")}> {/* Using the imported createPageUrl */}
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Business
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Featured Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Card
              key={category.value}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm group"
              onClick={() => setCategoryFilter(categoryFilter === category.value ? 'all' : category.value)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${
                  category.value === 'restaurant' ? 'from-red-500 to-red-600' :
                  category.value === 'transport' ? 'from-blue-500 to-blue-600' :
                  category.value === 'grocery' ? 'from-green-500 to-green-600' :
                  'from-purple-500 to-purple-600'
                } flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Store className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium text-gray-900">{category.label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredBusinesses.filter(b => b.category === category.value).length} businesses
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {emirates.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Businesses List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {categoryFilter !== 'all' ? categories.find(c => c.value === categoryFilter)?.label : 'All Businesses'}
            </h2>
            <Badge variant="outline" className="px-3 py-1">
              {filteredBusinesses.length} businesses found
            </Badge>
          </div>

          {filteredBusinesses.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
