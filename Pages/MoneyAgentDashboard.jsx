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
import { 
    Loader2, 
    DollarSign, 
    Users, 
    TrendingUp, 
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    ArrowLeft,
    Edit,
    Eye,
    MessageSquare,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Globe,
    Star,
    Megaphone,
    Save
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

export default function MoneyAgentDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    
    // Agent service settings
    const [services, setServices] = useState({
        cashToMobile: true,
        mobileToCash: true,
        internationalTransfer: false
    });
    
    const [rates, setRates] = useState({
        cashToMobile: '2',
        mobileToCash: '2',
        internationalTransfer: '5'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                // Load saved preferences from user profile if available
                if (currentUser.agent_settings) {
                    setServices(currentUser.agent_settings.services || services);
                    setRates(currentUser.agent_settings.rates || rates);
                    setIsAvailable(currentUser.agent_settings.isAvailable ?? true);
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
                agent_settings: {
                    services,
                    rates,
                    isAvailable
                }
            });
            // Show success (could add toast notification)
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto" />
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
                <SetupIncomplete user={user} requiredRole="Money Agent" />
            </div>
        );
    }

    // Mock stats (in real app, these would come from a transactions table)
    const stats = {
        totalTransactions: 47,
        totalVolume: 'AED 15,230',
        avgRating: 4.8,
        reviews: 12
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
                            <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
                            <p className="text-gray-600">Manage your money transfer services</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {isAvailable ? 'Available' : 'Offline'}
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        icon={Wallet} 
                        title="Total Transactions" 
                        value={stats.totalTransactions}
                        subtext="This month"
                        color="bg-gradient-to-br from-green-500 to-emerald-600"
                        trend="+8%"
                    />
                    <StatCard 
                        icon={DollarSign} 
                        title="Total Volume" 
                        value={stats.totalVolume}
                        subtext="Processed amount"
                        color="bg-gradient-to-br from-blue-500 to-indigo-600"
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
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                </div>

                {/* Availability Toggle */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            Availability Status
                        </CardTitle>
                        <CardDescription>Control when customers can find you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium">Available for Transactions</p>
                                <p className="text-sm text-gray-500">Toggle off when you're not available</p>
                            </div>
                            <Switch 
                                checked={isAvailable} 
                                onCheckedChange={setIsAvailable}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Services & Rates */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-blue-600" />
                                Services Offered
                            </CardTitle>
                            <CardDescription>Select the services you provide</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Cash to Mobile Money</p>
                                        <p className="text-sm text-gray-500">Convert cash to mobile wallet</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={services.cashToMobile} 
                                    onCheckedChange={(checked) => setServices({...services, cashToMobile: checked})}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <ArrowDownLeft className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Mobile Money to Cash</p>
                                        <p className="text-sm text-gray-500">Withdraw mobile money as cash</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={services.mobileToCash} 
                                    onCheckedChange={(checked) => setServices({...services, mobileToCash: checked})}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">International Transfer</p>
                                        <p className="text-sm text-gray-500">Send money abroad</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={services.internationalTransfer} 
                                    onCheckedChange={(checked) => setServices({...services, internationalTransfer: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Commission Rates
                            </CardTitle>
                            <CardDescription>Set your service fees (percentage)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cash to Mobile Money (%)</Label>
                                <Input 
                                    type="number" 
                                    value={rates.cashToMobile}
                                    onChange={(e) => setRates({...rates, cashToMobile: e.target.value})}
                                    disabled={!services.cashToMobile}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Mobile Money to Cash (%)</Label>
                                <Input 
                                    type="number" 
                                    value={rates.mobileToCash}
                                    onChange={(e) => setRates({...rates, mobileToCash: e.target.value})}
                                    disabled={!services.mobileToCash}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>International Transfer (%)</Label>
                                <Input 
                                    type="number" 
                                    value={rates.internationalTransfer}
                                    onChange={(e) => setRates({...rates, internationalTransfer: e.target.value})}
                                    disabled={!services.internationalTransfer}
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
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Settings
                    </Button>
                </div>

                {/* Profile Info */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Your Agent Profile</CardTitle>
                        <CardDescription>This information is shown to customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                                    <span className="text-3xl font-bold text-green-600">
                                        {user.full_name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{user.full_name || 'Not set'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{user.phone || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{user.location?.city || 'Not set'}, {user.location?.emirate || ''}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Link to="/profile">
                                    <Button variant="outline">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Promotion Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <Megaphone className="w-8 h-8 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold">Boost Your Visibility</h3>
                                    <p className="text-white/80 mt-1">
                                        Get featured at the top of search results and attract more customers
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="bg-white text-green-600 hover:bg-gray-100"
                                onClick={() => navigate('/promote?type=agent')}
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