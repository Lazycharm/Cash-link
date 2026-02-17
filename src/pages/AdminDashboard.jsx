
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/entities/User";
import { Business } from "@/entities/Business";
import { ActivityLog } from "@/entities/ActivityLog";
import { PromotionRequest } from "@/entities/PromotionRequest";
import { SubscriptionRequest } from "@/entities/SubscriptionRequest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Store,
  DollarSign,
  ShieldCheck,
  FileText,
  Settings,
  Megaphone,
  Briefcase,
  Loader2,
  ChevronRight,
  BadgeCheck,
  Clock,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Heart
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AdminStatCard = ({ icon: Icon, title, value, color }) => (
  <Card className={`border-0 text-white shadow-lg ${color}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-white/80" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const ManagementLinkCard = ({ icon: Icon, title, description, href, color }) => (
  <Link to={href}>
    <Card className="group border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6 flex items-start gap-6">
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
      </CardContent>
    </Card>
  </Link>
);


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    pendingBusinesses: 0,
    totalRevenue: "0.00"
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, businesses, promotionRequests, subscriptionRequests] = await Promise.all([
        User.list(),
        Business.list(),
        PromotionRequest.list(),
        SubscriptionRequest.list()
      ]);
      
      const pendingKYC = users.filter(u => u.kyc_status === 'pending').length;
      const pendingBusinesses = businesses.filter(b => b.status === 'pending').length;
      
      // Calculate revenue from completed requests
      const completedPromotions = promotionRequests.filter(r => r.status === 'completed');
      const completedSubscriptions = subscriptionRequests.filter(r => r.status === 'completed');
      
      const totalRevenue = [...completedPromotions, ...completedSubscriptions]
        .reduce((sum, req) => sum + (req.promotion_cost || req.cost || 0), 0);
      
      setStats({
        totalUsers: users.length,
        pendingKYC: pendingKYC,
        pendingBusinesses: pendingBusinesses,
        totalRevenue: totalRevenue.toFixed(2)
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Get recent activities from multiple sources
      const [users, businesses, promotionRequests, subscriptionRequests] = await Promise.all([
        User.list('-created_date', 10), // Assuming list supports sorting and limit
        Business.list('-created_date', 10), 
        PromotionRequest.list('-created_date', 10),
        SubscriptionRequest.list('-created_date', 10)
      ]);

      // Combine and format activities
      const activities = [];
      
      // New user registrations
      users.slice(0, 5).forEach(user => { // Take top 5 users
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registration',
          message: `${user.full_name || user.email} registered as a ${user.app_role || 'customer'}`,
          icon: Users,
          iconColor: 'bg-green-100 text-green-600',
          time: user.created_date
        });
      });

      // Business submissions
      businesses.slice(0, 3).forEach(business => { // Take top 3 businesses
        activities.push({
          id: `business-${business.id}`,
          type: 'business_submission',
          message: `New business "${business.name}" submitted for approval`,
          icon: Store,
          iconColor: 'bg-purple-100 text-purple-600',
          time: business.created_date
        });
      });

      // Promotion requests
      promotionRequests.slice(0, 3).forEach(request => { // Take top 3 promotion requests
        activities.push({
          id: `promotion-${request.id}`,
          type: 'promotion_request',
          message: `Promotion request for "${request.entity_title}" (${request.status})`,
          icon: Megaphone,
          iconColor: 'bg-pink-100 text-pink-600',
          time: request.created_date
        });
      });

      // Subscription requests
      subscriptionRequests.slice(0, 3).forEach(request => { // Take top 3 subscription requests
        activities.push({
          id: `subscription-${request.id}`,
          type: 'subscription_request',
          message: `${request.package_name} subscription request (${request.status})`,
          icon: BadgeCheck,
          iconColor: 'bg-blue-100 text-blue-600',
          time: request.created_date
        });
      });

      // Sort by most recent and take top 10 overall
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Set some fallback activities if there's an error
      setRecentActivities([
        {
          id: 'fallback-1',
          type: 'system',
          message: 'Error loading recent activities. Displaying default.',
          icon: AlertCircle,
          iconColor: 'bg-red-100 text-red-600',
          time: new Date().toISOString()
        }
      ]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-xl font-medium">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  const managementLinks = [
    { icon: Users, title: "User Management", description: "View users, manage roles, and handle KYC verifications.", href: createPageUrl("AdminUserManagement"), color: "bg-blue-500" },
    { icon: Store, title: "Business Management", description: "Approve or reject new business listings and manage vendors.", href: createPageUrl("AdminBusinessManagement"), color: "bg-purple-500" },
    { icon: BadgeCheck, title: "Subscription Requests", description: "Approve and manage user subscription payments.", href: createPageUrl("AdminSubscriptionManagement"), color: "bg-green-500" },
    { icon: Megaphone, title: "Promotion Requests", description: "Manage promotional campaigns and user promotions.", href: createPageUrl("AdminPromotions"), color: "bg-rose-500" },
    { icon: Briefcase, title: "Content Management", description: "Moderate jobs, events, and marketplace postings.", href: createPageUrl("AdminContentManagement"), color: "bg-amber-500" },
    { icon: Heart, title: "Donations Management", description: "Approve donation campaigns and manage contributions.", href: createPageUrl("AdminDonationsManagement"), color: "bg-pink-500" },
    { icon: FileText, title: "Site Content", description: "Edit content for About Us, Privacy Policy, and Agreements pages.", href: createPageUrl("AdminSiteContent"), color: "bg-teal-500" },
    { icon: HelpCircle, title: "UAE Help Center", description: "Manage tools, links, and directory locations for the help center.", href: createPageUrl("AdminUAEHelpCenter"), color: "bg-indigo-500" },
    { icon: Settings, title: "App Settings", description: "Control subscription prices, promotions, and admin contact info.", href: createPageUrl("AdminAppSettings"), color: "bg-gray-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Oversee and manage the CashLink Africa platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard 
            icon={Users} 
            title="Total Users" 
            value={stats.totalUsers} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <AdminStatCard 
            icon={ShieldCheck} 
            title="Pending KYC" 
            value={stats.pendingKYC} 
            color="bg-gradient-to-br from-red-500 to-orange-600"
          />
          <AdminStatCard 
            icon={Store} 
            title="Pending Businesses" 
            value={stats.pendingBusinesses}
            color="bg-gradient-to-br from-amber-500 to-yellow-600"
          />
          <AdminStatCard 
            icon={DollarSign} 
            title="Total Revenue (AED)" 
            value={stats.totalRevenue}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </div>

        {/* Management Links */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Management Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {managementLinks.map((link, index) => (
              <ManagementLinkCard key={index} {...link} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-gray-600">Latest platform activities and user actions.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${activity.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {activity.time ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) : 'time unknown'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activities to display.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
