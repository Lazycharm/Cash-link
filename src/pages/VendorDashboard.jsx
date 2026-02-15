import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Business } from '@/entities/Business';
import SetupIncomplete from '@/components/ui/SetupIncomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Loader2, 
    BarChart2, 
    Eye, 
    Star, 
    Edit, 
    ArrowLeft, 
    Plus,
    TrendingUp,
    Users,
    MessageSquare,
    Megaphone,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    ExternalLink,
    Share2,
    Sparkles
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

const BusinessCard = ({ business, onEdit, onPromote, onView }) => {
  const statusColors = {
    approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
  };
  
  const status = statusColors[business.status] || statusColors.pending;
  const StatusIcon = status.icon;

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        {business.images?.[0] ? (
          <img 
            src={business.images[0]} 
            alt={business.name} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <BarChart2 className="w-16 h-16 text-amber-300" />
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${status.bg} ${status.text}`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {business.status?.charAt(0).toUpperCase() + business.status?.slice(1) || 'Pending'}
        </Badge>
        {business.is_featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{business.name}</CardTitle>
        <CardDescription className="line-clamp-2">{business.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <Eye className="w-5 h-5 text-blue-600 mx-auto" />
            <p className="text-lg font-bold text-gray-900 mt-1">{business.views_count || 0}</p>
            <p className="text-xs text-gray-500">Views</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <Star className="w-5 h-5 text-amber-600 mx-auto" />
            <p className="text-lg font-bold text-gray-900 mt-1">{business.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <MessageSquare className="w-5 h-5 text-green-600 mx-auto" />
            <p className="text-lg font-bold text-gray-900 mt-1">{business.reviews_count || 0}</p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="space-y-2 text-sm text-gray-600">
          {business.location?.city && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{business.location.city}, {business.location.emirate}</span>
            </div>
          )}
          {business.contact?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{business.contact.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onView(business.id)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Page
          </Button>
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            onClick={() => onEdit(business.id)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
        
        <Button 
          variant="outline"
          className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
          onClick={() => onPromote(business)}
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Promote Business
        </Button>
      </CardContent>
    </Card>
  );
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser) {
          const vendorBusinesses = await Business.filter({ owner_id: currentUser.id });
          setBusinesses(vendorBusinesses);
        }
      } catch (error) {
        console.error("Failed to load vendor data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleEdit = (businessId) => {
    navigate(`/edit-business/${businessId}`);
  };

  const handleView = (businessId) => {
    navigate(`/business/${businessId}`);
  };

  const handlePromote = (business) => {
    navigate(`/promote?type=business&id=${business.id}`);
  };

  const handleShare = async (business) => {
    const shareData = {
      title: business.name,
      text: `Check out ${business.name} on CashLink!`,
      url: `${window.location.origin}/business/${business.id}`
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
          <p className="text-gray-600 mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if vendor setup is complete
  const isSetupComplete = user?.kyc_status === 'approved' && user?.subscription_status === 'active';
  const isAdmin = user?.role === 'admin';

  if (!isAdmin && !isSetupComplete) {
    return (
      <div className="p-4 md:p-8">
        <SetupIncomplete user={user} requiredRole="Vendor" />
      </div>
    );
  }

  // Calculate aggregate stats
  const totalViews = businesses.reduce((sum, b) => sum + (b.views_count || 0), 0);
  const totalReviews = businesses.reduce((sum, b) => sum + (b.reviews_count || 0), 0);
  const avgRating = businesses.length > 0 
    ? (businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length).toFixed(1)
    : '0.0';
  const approvedCount = businesses.filter(b => b.status === 'approved').length;
  const pendingCount = businesses.filter(b => b.status === 'pending').length;

  if (businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart2 className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Business Listed Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first business listing to start attracting customers and growing your presence on CashLink.
              </p>
              <Link to="/add-business">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Business
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">Manage your businesses and track performance</p>
            </div>
          </div>
          <Link to="/add-business">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Add New Business
            </Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={BarChart2} 
            title="Total Businesses" 
            value={businesses.length}
            subtext={`${approvedCount} approved, ${pendingCount} pending`}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard 
            icon={Eye} 
            title="Total Views" 
            value={totalViews.toLocaleString()}
            subtext="Across all listings"
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            trend="+12%"
          />
          <StatCard 
            icon={Star} 
            title="Average Rating" 
            value={avgRating}
            subtext="Out of 5.0"
            color="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <StatCard 
            icon={MessageSquare} 
            title="Total Reviews" 
            value={totalReviews}
            subtext="Customer feedback"
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </div>

        {/* Performance Overview */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Overview
            </CardTitle>
            <CardDescription>Your business visibility and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Visibility Score</span>
                  <span className="font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Customer Engagement</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Megaphone className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Boost Your Visibility</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Promote your business to appear at the top of search results and get more customers.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 border-amber-500 text-amber-700 hover:bg-amber-100"
                    onClick={() => businesses[0] && handlePromote(businesses[0])}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Listings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Businesses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(business => (
              <BusinessCard 
                key={business.id} 
                business={business}
                onEdit={handleEdit}
                onView={handleView}
                onPromote={handlePromote}
              />
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">💡 Tips to Grow Your Business</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-medium">Add Quality Photos</p>
                <p className="text-sm text-white/80 mt-1">Businesses with 5+ photos get 3x more views</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-medium">Complete Your Hours</p>
                <p className="text-sm text-white/80 mt-1">Help customers know when to visit</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-medium">Respond to Reviews</p>
                <p className="text-sm text-white/80 mt-1">Engaged businesses rank higher</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}