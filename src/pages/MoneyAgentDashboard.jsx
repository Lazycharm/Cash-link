import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import { Review } from '@/entities/Review';
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
import { 
    Loader2, 
    DollarSign, 
    Users, 
    TrendingUp,
    TrendingDown,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    XCircle,
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
    Save,
    Camera,
    Upload,
    Image,
    BarChart3,
    Calendar,
    RefreshCw,
    AlertCircle,
    ChevronRight,
    Settings,
    User as UserIcon,
    Building,
    CreditCard,
    Banknote,
    Activity,
    Target,
    Award,
    ThumbsUp,
    Timer,
    X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Mini stat card component
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

// Transaction row component with dual confirmation
const TransactionRow = ({ transaction, onAgentConfirm, onCancel }) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-gray-100 text-gray-700'
  };

  const serviceIcons = {
    cash_to_mobile: <ArrowUpRight className="w-4 h-4 text-green-600" />,
    mobile_to_cash: <ArrowDownLeft className="w-4 h-4 text-blue-600" />,
    international_transfer: <Globe className="w-4 h-4 text-purple-600" />
  };

  const serviceLabels = {
    cash_to_mobile: 'Cash → Mobile',
    mobile_to_cash: 'Mobile → Cash',
    international_transfer: 'International'
  };

  const getConfirmationStatus = () => {
    if (transaction.status === 'completed') {
      return { text: 'Completed', color: 'text-green-600' };
    }
    if (transaction.agent_confirmed && transaction.customer_confirmed) {
      return { text: 'Both Confirmed', color: 'text-green-600' };
    }
    if (transaction.agent_confirmed) {
      return { text: 'Awaiting Customer', color: 'text-blue-600' };
    }
    if (transaction.customer_confirmed) {
      return { text: 'Awaiting Your Confirmation', color: 'text-orange-600' };
    }
    return { text: 'Pending', color: 'text-amber-600' };
  };

  const confirmStatus = getConfirmationStatus();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-white shadow-sm">
          {serviceIcons[transaction.service_type] || <CreditCard className="w-4 h-4 text-gray-600" />}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {transaction.customer?.full_name || 'Customer'}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>{serviceLabels[transaction.service_type] || transaction.type || 'Transaction'}</span>
            {transaction.network && (
              <Badge variant="outline" className="text-xs">{transaction.network.replace(/_/g, ' ')}</Badge>
            )}
          </div>
          <p className={`text-xs mt-1 ${confirmStatus.color}`}>{confirmStatus.text}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="text-left sm:text-right">
          <p className="font-bold text-gray-900">AED {parseFloat(transaction.amount || 0).toFixed(2)}</p>
          {transaction.fee_amount > 0 && (
            <p className="text-xs text-green-600">+AED {parseFloat(transaction.fee_amount).toFixed(2)} fee</p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(transaction.created_date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={statusColors[transaction.status]}>
            {transaction.status}
          </Badge>
          
          {transaction.status === 'pending' && !transaction.agent_confirmed && (
            <Button
              size="sm"
              onClick={() => onAgentConfirm(transaction.id)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Confirm
            </Button>
          )}
          
          {transaction.status === 'pending' && transaction.agent_confirmed && !transaction.customer_confirmed && (
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
              <Timer className="w-3 h-3 mr-1" />
              Waiting
            </Badge>
          )}

          {transaction.status === 'pending' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCancel(transaction.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          {transaction.customer?.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const phone = transaction.customer.phone.replace('+', '');
                window.open(`https://wa.me/${phone}`, '_blank');
              }}
              className="text-xs"
            >
              <Phone className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Review card component
const ReviewCard = ({ review }) => (
  <div className="p-4 bg-gray-50 rounded-xl">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
          {review.reviewer?.full_name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="font-medium text-gray-900">{review.reviewer?.full_name || 'Customer'}</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-400">
        {new Date(review.created_date).toLocaleDateString()}
      </span>
    </div>
    {review.review_text && (
      <p className="mt-3 text-gray-600 text-sm">{review.review_text}</p>
    )}
    {review.is_verified && (
      <Badge variant="outline" className="mt-2 text-green-600 border-green-200 bg-green-50">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified Transaction
      </Badge>
    )}
  </div>
);

// Simple bar chart component
const SimpleBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.volume), 1);
  
  return (
    <div className="flex items-end justify-between h-32 gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">{item.count}</span>
            <div 
              className="w-full max-w-8 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-md transition-all hover:from-green-600 hover:to-emerald-500"
              style={{ height: `${Math.max((item.volume / maxValue) * 80, 4)}px` }}
            />
          </div>
          <span className="text-xs text-gray-500">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

export default function MoneyAgentDashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Agent data
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    
    // Agent settings
    const [isAvailable, setIsAvailable] = useState(true);
    const [businessName, setBusinessName] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    
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

    // Supported networks
    const [supportedNetworks, setSupportedNetworks] = useState([]);
    
    // Amount limits
    const [amountLimits, setAmountLimits] = useState({
        min: 10,
        max: 50000
    });

    // Network fee structure (per network)
    const [networkFees, setNetworkFees] = useState({});

    // Available money networks
    const availableNetworks = [
        { id: 'mtn_money', name: 'MTN Money', color: 'bg-yellow-500' },
        { id: 'airtel_money', name: 'Airtel Money', color: 'bg-red-500' },
        { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-600' },
        { id: 'orange_money', name: 'Orange Money', color: 'bg-orange-500' },
        { id: 'vodafone_cash', name: 'Vodafone Cash', color: 'bg-red-600' },
        { id: 'ecocash', name: 'EcoCash', color: 'bg-blue-500' },
        { id: 'wave', name: 'Wave', color: 'bg-cyan-500' },
        { id: 'chipper_cash', name: 'Chipper Cash', color: 'bg-purple-500' },
        { id: 'opay', name: 'OPay', color: 'bg-teal-500' },
        { id: 'fawry_meeza', name: 'Fawry + Meeza', color: 'bg-blue-600' },
        { id: 'bank_transfer', name: 'Bank Transfer', color: 'bg-gray-600' }
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            // Load saved preferences
            if (currentUser.agent_settings) {
                setServices(currentUser.agent_settings.services || services);
                setRates(currentUser.agent_settings.rates || rates);
                setIsAvailable(currentUser.agent_settings.isAvailable ?? true);
                setNetworkFees(currentUser.agent_settings.networkFees || {});
            }
            setSupportedNetworks(currentUser.supported_networks || []);
            setAmountLimits(currentUser.amount_limits || { min: 10, max: 50000 });
            setBusinessName(currentUser.business_name || '');
            setBusinessDescription(currentUser.business_description || '');
            setBannerImage(currentUser.banner_image || '');

            // Load real transaction stats
            const agentStats = await Transaction.getAgentStats(currentUser.id, 'month');
            setStats(agentStats);

            // Load recent transactions
            const agentTransactions = await Transaction.getAgentTransactions(currentUser.id, 20);
            setTransactions(agentTransactions);

            // Load reviews
            const userReviews = await Review.getForUser(currentUser.id, 'agent');
            setReviews(userReviews);

            // Get review stats
            const revStats = await Review.getStats(currentUser.id);
            setReviewStats(revStats);

        } catch (error) {
            console.error("Failed to load dashboard:", error);
        }
        setIsLoading(false);
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await User.updateMyUserData({
                agent_settings: {
                    services,
                    rates,
                    isAvailable,
                    networkFees
                },
                supported_networks: supportedNetworks,
                amount_limits: amountLimits,
                business_name: businessName,
                business_description: businessDescription
            });
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save settings: ' + error.message);
        }
        setIsSaving(false);
    };

    const toggleNetwork = (networkId) => {
        if (supportedNetworks.includes(networkId)) {
            setSupportedNetworks(supportedNetworks.filter(n => n !== networkId));
            // Remove fee structure for this network
            const newFees = { ...networkFees };
            delete newFees[networkId];
            setNetworkFees(newFees);
        } else {
            setSupportedNetworks([...supportedNetworks, networkId]);
            // Add default fee structure
            setNetworkFees({
                ...networkFees,
                [networkId]: { percentage: 2, minFee: 5 }
            });
        }
    };

    const updateNetworkFee = (networkId, field, value) => {
        setNetworkFees({
            ...networkFees,
            [networkId]: {
                ...(networkFees[networkId] || {}),
                [field]: parseFloat(value) || 0
            }
        });
    };

    const handleAgentConfirm = async (transactionId) => {
        try {
            const updatedTransaction = await Transaction.agentConfirm(transactionId);
            
            // Refresh transactions from database
            const agentTransactions = await Transaction.getAgentTransactions(user.id, 20);
            setTransactions(agentTransactions);
            
            // Refresh stats
            const agentStats = await Transaction.getAgentStats(user.id, 'month');
            setStats(agentStats);
            
            if (updatedTransaction.status === 'completed') {
                alert('Transaction completed successfully!');
            } else {
                alert('Your confirmation has been recorded. Waiting for customer to confirm.');
            }
        } catch (error) {
            console.error('Failed to confirm transaction:', error);
            alert('Failed to confirm: ' + (error.message || 'Unknown error'));
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}/${user.id}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('cashlink-files')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('cashlink-files')
                .getPublicUrl(fileName);
            
            const publicUrl = data.publicUrl;

            if (type === 'banners') {
                setBannerImage(publicUrl);
                await User.updateMyUserData({ banner_image: publicUrl });
            } else {
                await User.updateMyUserData({ avatar_url: publicUrl });
                setUser({ ...user, avatar_url: publicUrl });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + (error.message || 'Unknown error'));
        }
        setIsUploading(false);
    };

    const handleCancelTransaction = async (transactionId) => {
        if (!confirm('Are you sure you want to cancel this transaction?')) return;
        try {
            await Transaction.cancel(transactionId);
            setTransactions(transactions.map(t => 
                t.id === transactionId ? { ...t, status: 'cancelled' } : t
            ));
        } catch (error) {
            console.error('Failed to cancel transaction:', error);
            alert('Failed to cancel: ' + error.message);
        }
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
    
    // Check if setup is complete
    const isSetupComplete = user.kyc_status === 'approved' && user.subscription_status === 'active';
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isSetupComplete) {
        return (
            <div className="p-4 md:p-8">
                <SetupIncomplete user={user} requiredRole="Money Agent" />
            </div>
        );
    }

    const periodStats = stats?.periodStats || {};
    const dailyData = stats?.dailyData || [];
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
            {/* Banner Section */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-600 to-emerald-600 overflow-hidden">
                {bannerImage ? (
                    <img 
                        src={bannerImage} 
                        alt="Banner" 
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAxIDQgNC0yIDQtNCA0LTQtMi00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                )}
                
                {/* Banner upload button */}
                <button 
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-lg text-white transition-colors backdrop-blur-sm"
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'banners')}
                />

                {/* Back button */}
                <Link to="/" className="absolute top-4 left-4">
                    <Button variant="secondary" size="icon" className="rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-sm border-0">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Button>
                </Link>

                {/* Availability Badge */}
                <div className="absolute bottom-4 right-4">
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm ${
                        isAvailable ? 'bg-green-500/80 text-white' : 'bg-gray-800/80 text-white'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                        {isAvailable ? 'Online' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Profile Card - Overlapping Banner */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">
                                            {user.full_name?.charAt(0) || 'A'}
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e.target.files[0], 'avatars')}
                                />
                                {/* Verified badge */}
                                {user.kyc_status === 'approved' && (
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            {businessName || user.full_name}
                                        </h1>
                                        <p className="text-gray-500 mt-1">Money Agent</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Verified
                                        </Badge>
                                        {user.is_promoted && (
                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                <Star className="w-3 h-3 mr-1 fill-amber-500" />
                                                Featured
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                    {user.location?.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {user.location.city}, {user.location.emirate}
                                        </span>
                                    )}
                                    {user.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {user.phone}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        {reviewStats?.avgRating || 0} ({reviewStats?.totalReviews || 0} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button 
                                    variant="outline" 
                                    onClick={() => navigate('/profile')}
                                    className="flex-1 md:flex-none"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                                <Button 
                                    className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-600"
                                    onClick={() => navigate('/promote?type=agent')}
                                >
                                    <Megaphone className="w-4 h-4 mr-2" />
                                    Promote
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white shadow-md rounded-xl p-1 w-full md:w-auto flex overflow-x-auto">
                        <TabsTrigger value="overview" className="flex-1 md:flex-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg gap-2">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex-1 md:flex-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg gap-2">
                            <Wallet className="w-4 h-4" />
                            <span className="hidden sm:inline">Transactions</span>
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="flex-1 md:flex-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg gap-2">
                            <Star className="w-4 h-4" />
                            <span className="hidden sm:inline">Reviews</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex-1 md:flex-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-0">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard 
                                icon={Wallet} 
                                title="Total Transactions" 
                                value={periodStats.totalTransactions || 0}
                                subtext="This month"
                                color="bg-gradient-to-br from-green-500 to-emerald-600"
                                trend={periodStats.totalTransactions > 0 ? `${periodStats.successRate}%` : null}
                            />
                            <StatCard 
                                icon={DollarSign} 
                                title="Total Volume" 
                                value={`${stats?.currency || 'AED'} ${(periodStats.totalVolume || 0).toLocaleString()}`}
                                subtext="Processed amount"
                                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                            />
                            <StatCard 
                                icon={Banknote} 
                                title="Revenue (Fees)" 
                                value={`${stats?.currency || 'AED'} ${(periodStats.totalRevenue || 0).toLocaleString()}`}
                                subtext="Your earnings"
                                color="bg-gradient-to-br from-emerald-500 to-teal-600"
                                trendUp={true}
                            />
                            <StatCard 
                                icon={Users} 
                                title="Unique Customers" 
                                value={periodStats.uniqueCustomers || 0}
                                subtext="This month"
                                color="bg-gradient-to-br from-purple-500 to-purple-600"
                            />
                            <StatCard 
                                icon={Star} 
                                title="Rating" 
                                value={reviewStats?.avgRating || '0.0'}
                                subtext={`${reviewStats?.totalReviews || 0} reviews`}
                                color="bg-gradient-to-br from-amber-500 to-orange-600"
                            />
                        </div>

                        {/* Charts and Activity Row */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Transaction Chart */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-green-600" />
                                        Weekly Activity
                                    </CardTitle>
                                    <CardDescription>Transaction volume over the past 7 days</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dailyData.length > 0 ? (
                                        <SimpleBarChart data={dailyData} />
                                    ) : (
                                        <div className="h-32 flex items-center justify-center text-gray-400">
                                            <div className="text-center">
                                                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No transaction data yet</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Service Breakdown */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        Service Breakdown
                                    </CardTitle>
                                    <CardDescription>Volume by service type this month</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(stats?.serviceBreakdown || {}).length > 0 ? (
                                        Object.entries(stats.serviceBreakdown).map(([service, data]) => {
                                            const labels = {
                                                cash_to_mobile: { label: 'Cash to Mobile', icon: ArrowUpRight, color: 'green' },
                                                mobile_to_cash: { label: 'Mobile to Cash', icon: ArrowDownLeft, color: 'blue' },
                                                international_transfer: { label: 'International', icon: Globe, color: 'purple' }
                                            };
                                            const config = labels[service] || { label: service, icon: CreditCard, color: 'gray' };
                                            const Icon = config.icon;
                                            const percentage = periodStats.totalVolume > 0 
                                                ? ((data.volume / periodStats.totalVolume) * 100).toFixed(0)
                                                : 0;
                                            
                                            return (
                                                <div key={service} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className={`w-4 h-4 text-${config.color}-600`} />
                                                            <span className="text-sm font-medium">{config.label}</span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">{data.count} txns • {percentage}%</span>
                                                    </div>
                                                    <Progress value={parseFloat(percentage)} className="h-2" />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-8 text-center text-gray-400">
                                            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No service data yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Transactions Quick View */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-600" />
                                        Recent Transactions
                                    </CardTitle>
                                    <CardDescription>Your latest customer transactions</CardDescription>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setActiveTab('transactions')}
                                >
                                    View All
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {transactions.slice(0, 5).length > 0 ? (
                                    transactions.slice(0, 5).map(txn => (
                                        <TransactionRow 
                                            key={txn.id} 
                                            transaction={txn}
                                            onAgentConfirm={handleAgentConfirm}
                                            onCancel={handleCancelTransaction}
                                        />
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-400">
                                        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-lg font-medium">No transactions yet</p>
                                        <p className="text-sm mt-1">When customers connect with you, their transactions will appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Availability Quick Toggle with Location Tracking */}
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <LocationToggle
                                    initialOnline={isAvailable}
                                    onStatusChange={(checked) => {
                                        setIsAvailable(checked);
                                        handleSaveSettings();
                                    }}
                                    userType="agent"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions" className="space-y-6 mt-0">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>All Transactions</CardTitle>
                                        <CardDescription>Manage and track your customer transactions</CardDescription>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={loadDashboardData}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {transactions.length > 0 ? (
                                        transactions.map(txn => (
                                            <TransactionRow 
                                                key={txn.id} 
                                                transaction={txn}
                                                onAgentConfirm={handleAgentConfirm}
                                                onCancel={handleCancelTransaction}
                                            />
                                        ))
                                    ) : (
                                        <div className="py-16 text-center text-gray-400">
                                            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-xl font-medium">No transactions yet</p>
                                            <p className="text-sm mt-2 max-w-md mx-auto">
                                                When customers connect with you and request money transfers, 
                                                their transactions will appear here for you to manage.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-6 mt-0">
                        {/* Rating Summary */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="border-0 shadow-lg md:col-span-1">
                                <CardContent className="p-6 text-center">
                                    <div className="text-5xl font-bold text-gray-900 mb-2">
                                        {reviewStats?.avgRating || '0.0'}
                                    </div>
                                    <div className="flex justify-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-5 h-5 ${i < Math.round(reviewStats?.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-500">{reviewStats?.totalReviews || 0} reviews</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Rating Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[5, 4, 3, 2, 1].map(rating => {
                                        const count = reviewStats?.distribution?.[rating] || 0;
                                        const percentage = reviewStats?.totalReviews > 0 
                                            ? (count / reviewStats.totalReviews) * 100 
                                            : 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="w-3 text-sm font-medium">{rating}</span>
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <Progress value={percentage} className="h-2 flex-1" />
                                                <span className="w-8 text-sm text-gray-500 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reviews List */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Customer Reviews</CardTitle>
                                <CardDescription>What your customers are saying</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))
                                ) : (
                                    <div className="py-16 text-center text-gray-400">
                                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-xl font-medium">No reviews yet</p>
                                        <p className="text-sm mt-2 max-w-md mx-auto">
                                            When customers complete transactions with you, they can leave reviews 
                                            that will appear here.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6 mt-0">
                        {/* Business Profile */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    Business Profile
                                </CardTitle>
                                <CardDescription>Customize how customers see your profile</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Business Name</Label>
                                    <Input 
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="e.g., Fast Money Exchange"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Business Description</Label>
                                    <Textarea 
                                        value={businessDescription}
                                        onChange={(e) => setBusinessDescription(e.target.value)}
                                        placeholder="Describe your services, experience, and what makes you stand out..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Availability */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-green-600" />
                                    Availability
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

                        {/* Services */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-purple-600" />
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

                            <Card className="border-0 shadow-lg">
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

                        {/* Supported Money Networks */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Supported Money Networks
                                </CardTitle>
                                <CardDescription>Select the mobile money networks you support and set individual fees</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {availableNetworks.map(network => (
                                        <div
                                            key={network.id}
                                            onClick={() => toggleNetwork(network.id)}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                supportedNetworks.includes(network.id)
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${network.color}`} />
                                                <span className="text-sm font-medium">{network.name}</span>
                                            </div>
                                            {supportedNetworks.includes(network.id) && (
                                                <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Network-specific fees */}
                                {supportedNetworks.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        <h4 className="font-medium text-gray-900">Network Fee Structure</h4>
                                        <p className="text-sm text-gray-500">Set the commission you charge for each network</p>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {supportedNetworks.map(networkId => {
                                                const network = availableNetworks.find(n => n.id === networkId);
                                                const fees = networkFees[networkId] || { percentage: 2, minFee: 5 };
                                                return (
                                                    <div key={networkId} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${network?.color || 'bg-gray-500'}`} />
                                                            <span className="font-medium">{network?.name || networkId}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <Label className="text-xs">Fee (%)</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.1"
                                                                    value={fees.percentage}
                                                                    onChange={(e) => updateNetworkFee(networkId, 'percentage', e.target.value)}
                                                                    className="h-8 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Min Fee (AED)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={fees.minFee || 0}
                                                                    onChange={(e) => updateNetworkFee(networkId, 'minFee', e.target.value)}
                                                                    className="h-8 text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Amount Limits */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-green-600" />
                                    Transaction Limits
                                </CardTitle>
                                <CardDescription>Set minimum and maximum transaction amounts you accept</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Minimum Amount (AED)</Label>
                                        <Input
                                            type="number"
                                            value={amountLimits.min}
                                            onChange={(e) => setAmountLimits({ ...amountLimits, min: parseFloat(e.target.value) || 0 })}
                                            placeholder="10"
                                        />
                                        <p className="text-xs text-gray-500">Customers cannot request less than this amount</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Maximum Amount (AED)</Label>
                                        <Input
                                            type="number"
                                            value={amountLimits.max}
                                            onChange={(e) => setAmountLimits({ ...amountLimits, max: parseFloat(e.target.value) || 0 })}
                                            placeholder="50000"
                                        />
                                        <p className="text-xs text-gray-500">Customers cannot request more than this amount</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
