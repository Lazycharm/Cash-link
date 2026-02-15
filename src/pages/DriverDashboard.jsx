import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/entities/User';
import { Review } from '@/entities/Review';
import { RideBooking } from '@/entities/RideBooking';
import { supabase } from '@/lib/supabase';
import SetupIncomplete from '@/components/ui/SetupIncomplete';
import LocationToggle from '@/components/map/LocationToggle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, 
    Car, 
    Users, 
    TrendingUp,
    TrendingDown,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Star,
    MessageSquare,
    Navigation,
    Calendar,
    Save,
    Camera,
    Upload,
    BarChart3,
    RefreshCw,
    AlertCircle,
    Settings,
    User as UserIcon,
    DollarSign,
    Activity,
    Target,
    Award,
    ThumbsUp,
    Timer,
    Fuel,
    Megaphone,
    Plane,
    Package,
    Route,
    Gauge,
    Shield,
    X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// StatCard Component
const StatCard = ({ icon: Icon, title, value, subtext, color, trend, trendUp }) => (
  <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 group">
    <CardContent className="p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div className={`p-2 md:p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        {trend && (
          <Badge 
            variant="outline" 
            className={`text-xs ${trendUp !== false ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}
          >
            {trendUp !== false ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </Badge>
        )}
      </div>
      <div className="mt-3 md:mt-4">
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{title}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </CardContent>
  </Card>
);

// Ride booking row component
const RideBookingRow = ({ booking, onAccept, onComplete, onCancel, onStartRide }) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-gray-100 text-gray-700'
  };

  const serviceIcons = {
    airport_transfer: <Plane className="w-4 h-4 text-blue-600" />,
    city_ride: <Car className="w-4 h-4 text-green-600" />,
    long_distance: <Route className="w-4 h-4 text-purple-600" />,
    parcel_delivery: <Package className="w-4 h-4 text-orange-600" />
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {serviceIcons[booking.service_type] || <Car className="w-4 h-4 text-gray-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{booking.customer_name || 'Customer'}</p>
              <Badge className={`text-xs ${statusColors[booking.status] || statusColors.pending}`}>
                {booking.status?.replace('_', ' ') || 'Pending'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {booking.pickup_location} → {booking.dropoff_location}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(booking.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {booking.distance || '~'} km
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-right mr-2">
            <p className="font-bold text-gray-900">AED {parseFloat(booking.fare || 0).toFixed(2)}</p>
          </div>
          
          {booking.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => onAccept(booking.id)}
                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onCancel(booking.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Decline
              </Button>
            </>
          )}
          
          {booking.status === 'accepted' && (
            <Button 
              size="sm" 
              onClick={() => onStartRide && onStartRide(booking.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
            >
              <Navigation className="w-3 h-3 mr-1" />
              Start Ride
            </Button>
          )}
          
          {booking.status === 'in_progress' && (
            <Button 
              size="sm" 
              onClick={() => onComplete(booking.id)}
              className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Button>
          )}
          
          {booking.customer_phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`https://wa.me/${booking.customer_phone.replace('+', '')}`, '_blank')}
              className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs"
            >
              <Phone className="w-3 h-3 mr-1" />
              Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Service types for drivers
const SERVICE_TYPES = [
  { id: 'airport_transfer', name: 'Airport Transfer', icon: Plane, description: 'To/from airports' },
  { id: 'city_ride', name: 'City Rides', icon: Car, description: 'Within city trips' },
  { id: 'long_distance', name: 'Long Distance', icon: Route, description: 'Inter-emirate travel' },
  { id: 'parcel_delivery', name: 'Parcel Delivery', icon: Package, description: 'Package transport' }
];

// Vehicle types
const VEHICLE_TYPES = [
  { id: 'sedan', name: 'Sedan', seats: 4 },
  { id: 'suv', name: 'SUV', seats: 6 },
  { id: 'van', name: 'Van / Minibus', seats: 12 },
  { id: 'luxury', name: 'Luxury', seats: 4 }
];

export default function DriverDashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalRides: 0,
        completedRides: 0,
        totalEarnings: 0,
        totalDistance: 0,
        avgRating: 0,
        reviewCount: 0,
        thisMonthRides: 0,
        thisMonthEarnings: 0,
        acceptanceRate: 0,
        completionRate: 0
    });
    
    // Driver settings
    const [isAvailable, setIsAvailable] = useState(true);
    const [driverSettings, setDriverSettings] = useState({
        services: {
            airport_transfer: true,
            city_ride: true,
            long_distance: false,
            parcel_delivery: false
        },
        rates: {
            baseRate: 25,
            perKm: 3,
            airport_transfer: 100,
            city_ride: 0,
            long_distance: 0,
            parcel_delivery: 0
        },
        vehicle: {
            type: 'sedan',
            make: '',
            model: '',
            year: '',
            color: '',
            plateNumber: '',
            seats: 4
        },
        workingHours: {
            start: '06:00',
            end: '23:00'
        },
        serviceAreas: ['Dubai'],
        features: {
            hasAC: true,
            hasWifi: false,
            hasCharger: true,
            acceptsPets: false,
            childSeat: false
        }
    });

    // Profile settings
    const [profileData, setProfileData] = useState({
        businessName: '',
        bio: '',
        languages: [],
        yearsExperience: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            // Load driver settings
            if (currentUser.driver_settings) {
                setDriverSettings(prev => ({
                    ...prev,
                    ...currentUser.driver_settings
                }));
                setIsAvailable(currentUser.driver_settings.isAvailable ?? true);
            }
            
            // Load profile data
            setProfileData({
                businessName: currentUser.business_name || '',
                bio: currentUser.business_description || '',
                languages: currentUser.languages || [],
                yearsExperience: currentUser.years_experience || ''
            });

            // Load bookings (mock for now - would be from a bookings table)
            await loadBookings(currentUser.id);
            
            // Load reviews
            await loadReviews(currentUser.id);
            
            // Calculate stats
            await calculateStats(currentUser.id);

        } catch (error) {
            console.error("Failed to load data:", error);
        }
        setIsLoading(false);
    };

    const loadBookings = async (driverId) => {
        try {
            // Load real bookings from database
            const allBookings = await RideBooking.getDriverBookings(driverId);
            
            // Transform bookings to include customer name from joined data
            const transformedBookings = allBookings.map(booking => ({
                ...booking,
                customer_name: booking.customer?.full_name || 'Customer',
                customer_phone: booking.customer?.phone || null
            }));
            
            setBookings(transformedBookings);
        } catch (error) {
            console.error('Failed to load bookings:', error);
            // If table doesn't exist yet, set empty array
            setBookings([]);
        }
    };

    const loadReviews = async (driverId) => {
        try {
            const driverReviews = await Review.filter({ reviewed_user_id: driverId }, '-created_date');
            setReviews(driverReviews || []);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        }
    };

    const calculateStats = async (driverId) => {
        try {
            // Get real stats from RideBooking entity
            const rideStats = await RideBooking.getDriverStats(driverId);
            
            // Get actual reviews for rating (as backup if no ride ratings)
            let avgRating = rideStats.avgRating;
            let reviewCount = rideStats.reviewCount;
            
            try {
                const reviewData = await Review.filter({ reviewed_user_id: driverId });
                if (reviewData && reviewData.length > 0) {
                    reviewCount = reviewData.length;
                    const reviewAvg = reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount;
                    // Use review rating if no ride ratings
                    if (avgRating === 0) {
                        avgRating = reviewAvg;
                    }
                }
            } catch (e) {
                console.error('Error fetching reviews for stats:', e);
            }

            setStats({
                totalRides: rideStats.totalRides,
                completedRides: rideStats.completedRides,
                pendingRides: rideStats.pendingRides,
                cancelledRides: rideStats.cancelledRides,
                totalEarnings: rideStats.totalEarnings,
                totalDistance: rideStats.totalDistance,
                avgRating: avgRating || 0,
                reviewCount: reviewCount,
                thisMonthRides: rideStats.thisMonthRides,
                thisMonthEarnings: rideStats.thisMonthEarnings,
                todayRides: rideStats.todayRides,
                todayEarnings: rideStats.todayEarnings,
                acceptanceRate: rideStats.acceptanceRate,
                completionRate: rideStats.completionRate
            });
        } catch (error) {
            console.error('Failed to calculate stats:', error);
            // Set default stats if table doesn't exist
            setStats({
                totalRides: 0,
                completedRides: 0,
                pendingRides: 0,
                cancelledRides: 0,
                totalEarnings: 0,
                totalDistance: 0,
                avgRating: 0,
                reviewCount: 0,
                thisMonthRides: 0,
                thisMonthEarnings: 0,
                todayRides: 0,
                todayEarnings: 0,
                acceptanceRate: 100,
                completionRate: 100
            });
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await User.updateMyUserData({
                driver_settings: {
                    ...driverSettings,
                    isAvailable
                },
                business_name: profileData.businessName,
                business_description: profileData.bio
            });
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save settings: ' + error.message);
        }
        setIsSaving(false);
    };

    const handleToggleAvailability = async (available) => {
        setIsAvailable(available);
        try {
            await User.updateMyUserData({
                driver_settings: {
                    ...driverSettings,
                    isAvailable: available
                }
            });
        } catch (error) {
            console.error("Failed to update availability:", error);
        }
    };

    const handleAcceptBooking = async (bookingId) => {
        try {
            await RideBooking.accept(bookingId);
            setBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'accepted' } : b
            ));
            // Refresh stats
            if (user?.id) await calculateStats(user.id);
        } catch (error) {
            console.error('Failed to accept booking:', error);
            alert('Failed to accept booking: ' + error.message);
        }
    };

    const handleStartRide = async (bookingId) => {
        try {
            await RideBooking.startRide(bookingId);
            setBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'in_progress' } : b
            ));
        } catch (error) {
            console.error('Failed to start ride:', error);
            alert('Failed to start ride: ' + error.message);
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        try {
            await RideBooking.complete(bookingId);
            setBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'completed' } : b
            ));
            // Refresh stats
            if (user?.id) await calculateStats(user.id);
        } catch (error) {
            console.error('Failed to complete booking:', error);
            alert('Failed to complete booking: ' + error.message);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await RideBooking.reject(bookingId, 'Driver declined');
            setBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'rejected' } : b
            ));
            // Refresh stats
            if (user?.id) await calculateStats(user.id);
        } catch (error) {
            console.error('Failed to decline booking:', error);
            alert('Failed to decline booking: ' + error.message);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `driver-${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('cashlink-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('cashlink-files')
                .getPublicUrl(filePath);

            await User.updateMyUserData({ avatar_url: data.publicUrl });
            setUser(prev => ({ ...prev, avatar_url: data.publicUrl }));
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            alert('Failed to upload image');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 mt-3">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center">Error loading user data.</div>;
    }

    // Check if setup is complete
    const isSetupComplete = user.kyc_status === 'approved' && user.subscription_status === 'active';
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isSetupComplete) {
        return (
            <div className="p-4 md:p-8">
                <SetupIncomplete user={user} requiredRole="Driver" />
            </div>
        );
    }

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const activeBookings = bookings.filter(b => ['accepted', 'in_progress'].includes(b.status));

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm md:hidden">
                <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                            {user.full_name?.[0] || 'D'}
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">Driver Dashboard</h1>
                                    <p className="text-xs text-gray-500">{isAvailable ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>
                        </div>
                </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Desktop Header */}
                <div className="hidden md:flex md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer group relative"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        {user.full_name?.[0] || 'D'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.full_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={loadData} variant="outline" size="icon">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Alerts */}
                {pendingBookings.length > 0 && (
                    <Card className="border-0 bg-amber-50 border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <div>
                                    <p className="font-medium text-amber-900">
                                        You have {pendingBookings.length} pending ride request{pendingBookings.length > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-sm text-amber-700">Review and respond to booking requests</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Location Toggle */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                        <LocationToggle
                            initialOnline={isAvailable}
                            onStatusChange={(checked) => {
                                handleToggleAvailability(checked);
                            }}
                            userType="driver"
                        />
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-xl p-1 h-auto">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg py-2 text-xs md:text-sm">
                            <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="bookings" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg py-2 text-xs md:text-sm relative">
                            <Car className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Rides</span>
                            {pendingBookings.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {pendingBookings.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg py-2 text-xs md:text-sm">
                            <Star className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Reviews</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg py-2 text-xs md:text-sm">
                            <Settings className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard 
                                icon={Car} 
                                title="Total Rides" 
                                value={stats.totalRides}
                                subtext="All time"
                                color="bg-gradient-to-br from-orange-500 to-red-600"
                                trend="+12%"
                            />
                            <StatCard 
                                icon={DollarSign} 
                                title="Total Earnings" 
                                value={`AED ${stats.totalEarnings.toLocaleString()}`}
                                subtext="All time"
                                color="bg-gradient-to-br from-green-500 to-emerald-600"
                                trend="+18%"
                            />
                            <StatCard 
                                icon={Star} 
                                title="Average Rating" 
                                value={stats.avgRating.toFixed(1)}
                                subtext={`${stats.reviewCount} reviews`}
                                color="bg-gradient-to-br from-amber-500 to-orange-600"
                            />
                            <StatCard 
                                icon={Navigation} 
                                title="Distance Covered" 
                                value={`${stats.totalDistance.toLocaleString()} km`}
                                subtext="All time"
                                color="bg-gradient-to-br from-purple-500 to-indigo-600"
                            />
                        </div>

                        {/* This Month Performance */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                    This Month's Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-gray-900">{stats.thisMonthRides}</p>
                                        <p className="text-sm text-gray-500">Rides</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-green-600">AED {stats.thisMonthEarnings.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Earnings</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-blue-600">{stats.acceptanceRate?.toFixed(0) || 100}%</p>
                                        <p className="text-sm text-gray-500">Acceptance Rate</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-purple-600">{stats.completionRate?.toFixed(0) || 100}%</p>
                                        <p className="text-sm text-gray-500">Completion Rate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Today's Performance */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-blue-600" />
                                    Today's Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-blue-600">{stats.todayRides || 0}</p>
                                        <p className="text-sm text-gray-500">Rides Today</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-green-600">AED {(stats.todayEarnings || 0).toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Earnings Today</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-amber-600">{stats.pendingRides || 0}</p>
                                        <p className="text-sm text-gray-500">Pending Requests</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-purple-600">{stats.completedRides || 0}</p>
                                        <p className="text-sm text-gray-500">Total Completed</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Rides */}
                        {activeBookings.length > 0 && (
                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Active Rides
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {activeBookings.map(booking => (
                                        <RideBookingRow 
                                            key={booking.id}
                                            booking={booking}
                                            onAccept={handleAcceptBooking}
                                            onStartRide={handleStartRide}
                                            onComplete={handleCompleteBooking}
                                            onCancel={handleCancelBooking}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Megaphone className="w-8 h-8 mb-3" />
                                            <h3 className="text-lg font-bold">Get More Ride Requests</h3>
                                            <p className="text-white/80 mt-1 text-sm">
                                                Promote your profile to appear at the top
                                            </p>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            className="bg-white text-orange-600 hover:bg-gray-100"
                                            onClick={() => navigate('/promote?type=driver')}
                                        >
                                            Promote
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Shield className="w-8 h-8 mb-3" />
                                            <h3 className="text-lg font-bold">Subscription Status</h3>
                                            <p className="text-white/80 mt-1 text-sm">
                                                {user.subscription_status === 'active' ? 'Your subscription is active' : 'Upgrade to accept bookings'}
                                            </p>
                                        </div>
                                        {user.subscription_status !== 'active' && (
                                            <Button 
                                                variant="secondary" 
                                                className="bg-white text-blue-600 hover:bg-gray-100"
                                                onClick={() => navigate('/subscribe')}
                                            >
                                                Subscribe
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="mt-6 space-y-6">
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="w-5 h-5 text-orange-600" />
                                        Ride Requests
                                    </CardTitle>
                                    <Badge variant="outline">{bookings.length} total</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No ride requests yet</p>
                                        <p className="text-sm text-gray-400 mt-1">When customers book rides, they'll appear here</p>
                                    </div>
                                ) : (
                                    bookings.map(booking => (
                                        <RideBookingRow 
                                            key={booking.id}
                                            booking={booking}
                                            onAccept={handleAcceptBooking}
                                            onStartRide={handleStartRide}
                                            onComplete={handleCompleteBooking}
                                            onCancel={handleCancelBooking}
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-6 text-center">
                                    <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                                    <p className="text-sm text-gray-500">Average Rating</p>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-6 text-center">
                                    <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-gray-900">{stats.reviewCount}</p>
                                    <p className="text-sm text-gray-500">Total Reviews</p>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-6 text-center">
                                    <ThumbsUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-gray-900">96%</p>
                                    <p className="text-sm text-gray-500">Positive Feedback</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle>Customer Reviews</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No reviews yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Complete rides to receive customer reviews</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{review.reviewer?.full_name || 'Customer'}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.created_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 mt-2 text-sm">{review.comment}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="mt-6 space-y-6">
                        {/* Profile Photo Section */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-orange-600" />
                                    Business Photo
                                </CardTitle>
                                <CardDescription>Your profile photo shown to customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative group">
                                        {user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url} 
                                                alt="Profile" 
                                                className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-orange-100"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                                                {user.full_name?.[0] || 'D'}
                                            </div>
                                        )}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        >
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="font-semibold text-gray-900 mb-2">Upload your business photo</h4>
                                        <p className="text-sm text-gray-500 mb-4">
                                            This photo will be displayed on your profile and in search results. Use a professional photo or your company logo.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => fileInputRef.current?.click()}
                                                variant="outline"
                                                className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Photo
                                            </Button>
                                            {user.avatar_url && (
                                                <Button 
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={async () => {
                                                        try {
                                                            await User.updateMyUserData({ avatar_url: null });
                                                            setUser(prev => ({ ...prev, avatar_url: null }));
                                                        } catch (error) {
                                                            console.error('Failed to remove photo:', error);
                                                        }
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Section */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-orange-600" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Information shown to customers</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Display Name / Business Name</Label>
                                        <Input 
                                            value={profileData.businessName}
                                            onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                                            placeholder="e.g., Ahmed's Rides"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Years of Experience</Label>
                                        <Input 
                                            type="number"
                                            value={profileData.yearsExperience}
                                            onChange={(e) => setProfileData({...profileData, yearsExperience: e.target.value})}
                                            placeholder="e.g., 5"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Bio / About</Label>
                                    <Textarea 
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                        placeholder="Tell customers about yourself and your service..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="w-5 h-5 text-blue-600" />
                                    Vehicle Information
                                </CardTitle>
                                <CardDescription>Your vehicle details shown to customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Vehicle Type</Label>
                                        <Select 
                                            value={driverSettings.vehicle.type} 
                                            onValueChange={(v) => setDriverSettings({
                                                ...driverSettings, 
                                                vehicle: {...driverSettings.vehicle, type: v, seats: VEHICLE_TYPES.find(t => t.id === v)?.seats || 4}
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {VEHICLE_TYPES.map(type => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.name} ({type.seats} seats)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Make</Label>
                                        <Input 
                                            value={driverSettings.vehicle.make}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings, 
                                                vehicle: {...driverSettings.vehicle, make: e.target.value}
                                            })}
                                            placeholder="e.g., Toyota"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Model</Label>
                                        <Input 
                                            value={driverSettings.vehicle.model}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings, 
                                                vehicle: {...driverSettings.vehicle, model: e.target.value}
                                            })}
                                            placeholder="e.g., Camry"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Input 
                                            value={driverSettings.vehicle.year}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings, 
                                                vehicle: {...driverSettings.vehicle, year: e.target.value}
                                            })}
                                            placeholder="e.g., 2022"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <Input 
                                            value={driverSettings.vehicle.color}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings, 
                                                vehicle: {...driverSettings.vehicle, color: e.target.value}
                                            })}
                                            placeholder="e.g., White"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Plate Number</Label>
                                        <Input 
                                            value={driverSettings.vehicle.plateNumber}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings, 
                                                vehicle: {...driverSettings.vehicle, plateNumber: e.target.value}
                                            })}
                                            placeholder="e.g., A 12345"
                                        />
                                    </div>
                                </div>

                                {/* Vehicle Features */}
                                <div className="mt-6">
                                    <Label className="mb-3 block">Vehicle Features</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {[
                                            { id: 'hasAC', label: 'Air Conditioning', icon: '❄️' },
                                            { id: 'hasWifi', label: 'WiFi', icon: '📶' },
                                            { id: 'hasCharger', label: 'Phone Charger', icon: '🔌' },
                                            { id: 'acceptsPets', label: 'Pet Friendly', icon: '🐕' },
                                            { id: 'childSeat', label: 'Child Seat', icon: '👶' }
                                        ].map(feature => (
                                            <div 
                                                key={feature.id}
                                                onClick={() => setDriverSettings({
                                                    ...driverSettings,
                                                    features: {
                                                        ...driverSettings.features,
                                                        [feature.id]: !driverSettings.features[feature.id]
                                                    }
                                                })}
                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                                                    driverSettings.features[feature.id] 
                                                        ? 'border-orange-500 bg-orange-50' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="text-2xl block mb-1">{feature.icon}</span>
                                                <span className="text-xs">{feature.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services & Rates */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Navigation className="w-5 h-5 text-purple-600" />
                                        Services Offered
                                    </CardTitle>
                                    <CardDescription>Select the services you provide</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {SERVICE_TYPES.map(service => {
                                        const ServiceIcon = service.icon;
                                        return (
                                            <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <ServiceIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <p className="font-medium text-sm">{service.name}</p>
                                                        <p className="text-xs text-gray-500">{service.description}</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={driverSettings.services[service.id]} 
                                                    onCheckedChange={(checked) => setDriverSettings({
                                                        ...driverSettings,
                                                        services: {...driverSettings.services, [service.id]: checked}
                                                    })}
                                                />
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        Your Rates (AED)
                                    </CardTitle>
                                    <CardDescription>Set competitive pricing</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Base Rate</Label>
                                            <Input 
                                                type="number" 
                                                value={driverSettings.rates.baseRate}
                                                onChange={(e) => setDriverSettings({
                                                    ...driverSettings,
                                                    rates: {...driverSettings.rates, baseRate: parseFloat(e.target.value) || 0}
                                                })}
                                            />
                                            <p className="text-xs text-gray-500">Starting fare</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Per Kilometer</Label>
                                            <Input 
                                                type="number" 
                                                value={driverSettings.rates.perKm}
                                                onChange={(e) => setDriverSettings({
                                                    ...driverSettings,
                                                    rates: {...driverSettings.rates, perKm: parseFloat(e.target.value) || 0}
                                                })}
                                            />
                                            <p className="text-xs text-gray-500">Rate per km</p>
                                        </div>
                                    </div>
                                    
                                    {driverSettings.services.airport_transfer && (
                                        <div className="space-y-2">
                                            <Label>Airport Transfer (flat rate)</Label>
                                            <Input 
                                                type="number" 
                                                value={driverSettings.rates.airport_transfer}
                                                onChange={(e) => setDriverSettings({
                                                    ...driverSettings,
                                                    rates: {...driverSettings.rates, airport_transfer: parseFloat(e.target.value) || 0}
                                                })}
                                            />
                                        </div>
                                    )}

                                    {driverSettings.services.long_distance && (
                                        <div className="space-y-2">
                                            <Label>Long Distance (per km)</Label>
                                            <Input 
                                                type="number" 
                                                value={driverSettings.rates.long_distance}
                                                onChange={(e) => setDriverSettings({
                                                    ...driverSettings,
                                                    rates: {...driverSettings.rates, long_distance: parseFloat(e.target.value) || 0}
                                                })}
                                                placeholder="Leave 0 to use per-km rate"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Working Hours */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Working Hours
                                </CardTitle>
                                <CardDescription>Set your availability hours</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input 
                                            type="time"
                                            value={driverSettings.workingHours.start}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings,
                                                workingHours: {...driverSettings.workingHours, start: e.target.value}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Input 
                                            type="time"
                                            value={driverSettings.workingHours.end}
                                            onChange={(e) => setDriverSettings({
                                                ...driverSettings,
                                                workingHours: {...driverSettings.workingHours, end: e.target.value}
                                            })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Areas */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                    Service Areas
                                </CardTitle>
                                <CardDescription>Emirates where you operate</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map(area => (
                                        <div 
                                            key={area}
                                            onClick={() => {
                                                const areas = driverSettings.serviceAreas || [];
                                                const newAreas = areas.includes(area) 
                                                    ? areas.filter(a => a !== area)
                                                    : [...areas, area];
                                                setDriverSettings({
                                                    ...driverSettings,
                                                    serviceAreas: newAreas
                                                });
                                            }}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center text-sm ${
                                                (driverSettings.serviceAreas || []).includes(area)
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                        >
                                            {area}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button 
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Save All Settings
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
