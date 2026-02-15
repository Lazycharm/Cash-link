import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import SetupIncomplete from '@/components/ui/SetupIncomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, 
    Car, 
    Users, 
    TrendingUp, 
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    ArrowLeft,
    Edit,
    Star,
    MessageSquare,
    Navigation,
    Fuel,
    Calendar,
    Save,
    Megaphone,
    DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, title, value, subtext, color, trend }) => (
  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </CardContent>
  </Card>
);

export default function DriverDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    
    // Vehicle info
    const [vehicle, setVehicle] = useState({
        type: 'sedan',
        make: '',
        model: '',
        year: '',
        color: '',
        plateNumber: '',
        seats: '4'
    });
    
    // Service settings
    const [services, setServices] = useState({
        airportTransfer: true,
        cityRides: true,
        longDistance: false,
        parcelDelivery: false
    });
    
    const [rates, setRates] = useState({
        baseRate: '25',
        perKm: '3',
        airportRate: '100'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                // Load saved preferences from user profile if available
                if (currentUser.driver_settings) {
                    setVehicle(currentUser.driver_settings.vehicle || vehicle);
                    setServices(currentUser.driver_settings.services || services);
                    setRates(currentUser.driver_settings.rates || rates);
                    setIsAvailable(currentUser.driver_settings.isAvailable ?? true);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await User.updateMyUserData({
                driver_settings: {
                    vehicle,
                    services,
                    rates,
                    isAvailable
                }
            });
            // Show success
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 mt-3">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center">Error loading user data.</div>;
    }

    // Check if setup is complete, but bypass for admins
    const isSetupComplete = user.kyc_status === 'approved' && user.subscription_status === 'active';
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isSetupComplete) {
        return (
            <div className="p-4 md:p-8">
                <SetupIncomplete user={user} requiredRole="Driver" />
            </div>
        );
    }

    // Mock stats
    const stats = {
        totalRides: 156,
        totalDistance: '2,340 km',
        avgRating: 4.9,
        reviews: 48
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="outline" size="icon" className="rounded-xl">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                            <p className="text-gray-600">Manage your vehicle and ride services</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {isAvailable ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        icon={Car} 
                        title="Total Rides" 
                        value={stats.totalRides}
                        subtext="Completed trips"
                        color="bg-gradient-to-br from-blue-500 to-indigo-600"
                        trend="+12%"
                    />
                    <StatCard 
                        icon={Navigation} 
                        title="Distance Covered" 
                        value={stats.totalDistance}
                        subtext="All time"
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                    <StatCard 
                        icon={Star} 
                        title="Average Rating" 
                        value={stats.avgRating}
                        subtext="Out of 5.0"
                        color="bg-gradient-to-br from-amber-500 to-orange-600"
                    />
                    <StatCard 
                        icon={MessageSquare} 
                        title="Customer Reviews" 
                        value={stats.reviews}
                        subtext="Feedback received"
                        color="bg-gradient-to-br from-green-500 to-emerald-600"
                    />
                </div>

                {/* Availability Toggle */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Availability Status
                        </CardTitle>
                        <CardDescription>Control when customers can book you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium">Available for Rides</p>
                                <p className="text-sm text-gray-500">Toggle off when you're not working</p>
                            </div>
                            <Switch 
                                checked={isAvailable} 
                                onCheckedChange={setIsAvailable}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-600" />
                            Vehicle Information
                        </CardTitle>
                        <CardDescription>Your vehicle details shown to customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Vehicle Type</Label>
                                <Select value={vehicle.type} onValueChange={(v) => setVehicle({...vehicle, type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sedan">Sedan</SelectItem>
                                        <SelectItem value="suv">SUV</SelectItem>
                                        <SelectItem value="van">Van / Minibus</SelectItem>
                                        <SelectItem value="luxury">Luxury</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Make</Label>
                                <Input 
                                    value={vehicle.make}
                                    onChange={(e) => setVehicle({...vehicle, make: e.target.value})}
                                    placeholder="e.g., Toyota"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Input 
                                    value={vehicle.model}
                                    onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                                    placeholder="e.g., Camry"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input 
                                    value={vehicle.year}
                                    onChange={(e) => setVehicle({...vehicle, year: e.target.value})}
                                    placeholder="e.g., 2022"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <Input 
                                    value={vehicle.color}
                                    onChange={(e) => setVehicle({...vehicle, color: e.target.value})}
                                    placeholder="e.g., White"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Plate Number</Label>
                                <Input 
                                    value={vehicle.plateNumber}
                                    onChange={(e) => setVehicle({...vehicle, plateNumber: e.target.value})}
                                    placeholder="e.g., A 12345"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Services & Rates */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-purple-600" />
                                Services Offered
                            </CardTitle>
                            <CardDescription>Select the services you provide</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium">Airport Transfers</p>
                                    <p className="text-sm text-gray-500">To/from airports</p>
                                </div>
                                <Switch 
                                    checked={services.airportTransfer} 
                                    onCheckedChange={(checked) => setServices({...services, airportTransfer: checked})}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium">City Rides</p>
                                    <p className="text-sm text-gray-500">Within city trips</p>
                                </div>
                                <Switch 
                                    checked={services.cityRides} 
                                    onCheckedChange={(checked) => setServices({...services, cityRides: checked})}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium">Long Distance</p>
                                    <p className="text-sm text-gray-500">Inter-emirate travel</p>
                                </div>
                                <Switch 
                                    checked={services.longDistance} 
                                    onCheckedChange={(checked) => setServices({...services, longDistance: checked})}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium">Parcel Delivery</p>
                                    <p className="text-sm text-gray-500">Package transport</p>
                                </div>
                                <Switch 
                                    checked={services.parcelDelivery} 
                                    onCheckedChange={(checked) => setServices({...services, parcelDelivery: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Your Rates (AED)
                            </CardTitle>
                            <CardDescription>Set competitive pricing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Base Rate (starting fare)</Label>
                                <Input 
                                    type="number" 
                                    value={rates.baseRate}
                                    onChange={(e) => setRates({...rates, baseRate: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Per Kilometer</Label>
                                <Input 
                                    type="number" 
                                    value={rates.perKm}
                                    onChange={(e) => setRates({...rates, perKm: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Airport Transfer (flat rate)</Label>
                                <Input 
                                    type="number" 
                                    value={rates.airportRate}
                                    onChange={(e) => setRates({...rates, airportRate: e.target.value})}
                                    disabled={!services.airportTransfer}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button 
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Settings
                    </Button>
                </div>

                {/* Promotion Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <Megaphone className="w-8 h-8 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold">Get More Ride Requests</h3>
                                    <p className="text-white/80 mt-1">
                                        Promote your profile to appear at the top of driver listings
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="bg-white text-blue-600 hover:bg-gray-100"
                                onClick={() => navigate('/promote?type=driver')}
                            >
                                Promote Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}