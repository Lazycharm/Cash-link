import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Business } from "@/entities/Business";
import { Job } from "@/entities/Job";
import { MarketplaceItem } from "@/entities/MarketplaceItem";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  ArrowRight, 
  Search, 
  Star, 
  Briefcase, 
  ShoppingBag, 
  Calendar, 
  Shield, 
  Zap, 
  FileText, 
  HelpCircle,
  TrendingUp,
  DollarSign,
  Lock,
  ChevronRight,
  Bell,
  Car,
  BadgeCheck,
  Phone,
  Users,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

// --- COMPONENTS ---

const RolePendingBanner = ({ requestedRole, status, profile }) => {
  const roleLabels = {
    vendor: 'Business Owner',
    agent: 'Money Agent',
    driver: 'Driver'
  };

  const dashboardLinks = {
    vendor: { link: '/vendor-dashboard', label: 'Business Dashboard', icon: Briefcase },
    agent: { link: '/agent-dashboard', label: 'Agent Dashboard', icon: DollarSign },
    driver: { link: '/driver-dashboard', label: 'Driver Dashboard', icon: Car }
  };

  // Check if role is approved (either via role field or role_request_status)
  const approvedRole = profile?.role && profile.role !== 'customer' ? profile.role : null;
  const isRoleApproved = approvedRole || status === 'approved';
  const activeRole = approvedRole || requestedRole;

  // Show dashboard button if role is approved (KYC not required to see button)
  if (isRoleApproved && activeRole && dashboardLinks[activeRole]) {
    const dashboard = dashboardLinks[activeRole];
    const DashIcon = dashboard.icon;
    const needsKyc = profile?.kyc_status !== 'approved';

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${needsKyc 
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200' 
          : 'bg-gradient-to-r from-emerald-500 to-green-600 border-0'
        } rounded-2xl p-4 md:p-6 mb-6 shadow-lg`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${needsKyc ? 'bg-emerald-100' : 'bg-white/20'} flex items-center justify-center flex-shrink-0`}>
              <DashIcon className={`w-6 h-6 ${needsKyc ? 'text-emerald-600' : 'text-white'}`} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${needsKyc ? 'text-emerald-900' : 'text-white'}`}>
                Welcome, {roleLabels[activeRole]}! 🎉
              </h3>
              {needsKyc ? (
                <p className="text-emerald-700 text-sm">
                  Complete your KYC verification to unlock all features.
                </p>
              ) : (
                <p className="text-emerald-100 text-sm">
                  Your account is fully verified. Access your dashboard.
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to={dashboard.link}>
              <Button className={`${needsKyc 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-white text-emerald-700 hover:bg-emerald-50'
              } font-semibold shadow-md w-full sm:w-auto`}>
                <DashIcon className="w-4 h-4 mr-2" />
                {dashboard.label}
              </Button>
            </Link>
            {needsKyc && (
              <Link to={createPageUrl("Profile")}>
                <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto">
                  <Shield className="w-4 h-4 mr-2" />
                  Complete KYC
                </Button>
              </Link>
            )}
          </div>
        </div>
        {needsKyc && (
          <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Some features are limited until KYC verification is complete.</span>
          </div>
        )}
      </motion.div>
    );
  }

  if (status === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 md:p-6 mb-6 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 text-lg">Role Approval Pending</h3>
            <p className="text-amber-700 text-sm mt-1">
              Your request to become a <span className="font-semibold">{roleLabels[requestedRole] || requestedRole}</span> is under review. 
              You'll be notified once approved. This usually takes less than 24 hours.
            </p>
            <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              You can continue using CashLink as a customer while waiting.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

const SectionHeader = ({ title, actionText = "View All", actionLink }) => (
  <div className="flex items-center justify-between mb-6 px-1">
    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
      {title}
    </h2>
    {actionLink && (
      <Link to={actionLink} className="group flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
        {actionText} 
        <div className="bg-emerald-100 rounded-full p-0.5 group-hover:translate-x-1 transition-transform">
           <ChevronRight className="w-3 h-3" />
        </div>
      </Link>
    )}
  </div>
);

const QuickAction = ({ icon: Icon, label, link, color, delay }) => (
  <Link to={link} className="flex flex-col items-center gap-2 sm:gap-3 group">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.9 }}
      className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[1.5rem] sm:rounded-[2rem] ${color} flex items-center justify-center shadow-md group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer`}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 relative z-10 transition-transform duration-300 group-hover:scale-110" />
    </motion.div>
    <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center leading-tight group-hover:text-emerald-600 transition-colors duration-300 px-1">
      {label}
    </span>
  </Link>
);

const FeatureCard = ({ image, title, subtitle, badge, link, price }) => (
  <Link to={link} className="block min-w-[260px] md:min-w-[300px] snap-start group">
    <motion.div 
      whileHover={{ y: -6 }}
      className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
    >
      <div className="h-40 bg-gray-100 relative overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        {badge && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-gray-900 shadow-sm border border-gray-100">
            {badge}
          </span>
        )}
        {price && (
             <span className="absolute bottom-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {price}
             </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 truncate mb-1 text-lg group-hover:text-emerald-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {subtitle}
        </p>
      </div>
    </motion.div>
  </Link>
);

const HeroSection = ({ user }) => (
    <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0A2616] text-white shadow-2xl mb-8 md:mb-12 isolate">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-400 rounded-full blur-[80px] opacity-20"></div>
        
        <div className="relative z-10 p-6 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
                <div className="space-y-3 sm:space-y-4 max-w-lg w-full">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] sm:text-xs font-medium text-emerald-100 tracking-wide uppercase">Welcome Back</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 whitespace-nowrap">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend'}</span>
                    </h1>
                    <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-md">
                        Discover trusted businesses, find jobs, and connect with your community in the UAE.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4 max-w-md">
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link to={createPageUrl("GetCash")} className="block">
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-12 px-6 rounded-xl font-bold shadow-lg shadow-emerald-900/30 text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/40">
                                    Get Cash
                                </Button>
                            </Link>
                        </motion.div>
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link to={createPageUrl("GetRide")} className="block">
                                <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 px-6 rounded-xl backdrop-blur-md font-semibold text-sm sm:text-base transition-all duration-300 hover:border-white/50">
                                    Get A Ride
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
                
                {/* Profile Card Floating - Desktop Only */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="hidden lg:block flex-shrink-0"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl flex items-center gap-4 min-w-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5">
                             <img src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.full_name}&background=random`} alt="Profile" className="w-full h-full object-cover rounded-[14px]" />
                        </div>
                        <div className="opacity-50">
                            <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Your Balance</p>
                            <p className="text-2xl font-bold text-white/60">Coming Soon</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    </div>
)

export default function Home() {
  const { user: authUser, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ businesses: [], items: [], jobs: [], events: [], drivers: [], agents: [] });

  // Use profile as user for display purposes
  const user = profile;

  // Redirect new users to complete signup (but not admins or users with complete profiles)
  useEffect(() => {
    if (!authLoading && profile) {
      // Skip redirect for admins
      if (profile.role === 'admin') return;
      
      // Redirect if profile is incomplete (no name or phone)
      const isIncomplete = !profile.full_name || !profile.phone;
      if (isIncomplete) {
        navigate('/complete-signup', { replace: true });
      }
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch Data Parallel
        const [businesses, items, jobs, events, allUsers] = await Promise.all([
           Business.filter({ status: 'approved', is_featured: true }, '-created_date', 5).catch(() => []),
           MarketplaceItem.filter({ status: 'approved' }, '-created_date', 5).catch(() => []),
           Job.filter({ status: 'approved' }, '-created_date', 5).catch(() => []),
           Event.filter({ status: 'approved' }, '-start_datetime', 5).catch(() => []),
           User.list().catch(() => [])
        ]);

        // Filter drivers with approved KYC and subscription
        const drivers = allUsers.filter(u => 
          u.app_role === 'driver' && 
          u.kyc_status === 'approved' && 
          u.subscription_status === 'active'
        ).slice(0, 5);

        // Filter agents - nearby based on user location
        const agents = allUsers.filter(u => 
          u.app_role === 'agent' && 
          u.kyc_status === 'approved' &&
          u.location?.emirate === profile?.location?.emirate
        ).slice(0, 6);

        setData({ businesses, items, jobs, events, drivers, agents });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
            <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      
      {/* ROLE/DASHBOARD BANNER - Show for any professional role or pending role request */}
      {(profile?.requested_role || (profile?.role && ['vendor', 'agent', 'driver'].includes(profile.role))) && (
        <RolePendingBanner 
          requestedRole={profile.requested_role} 
          status={profile.role_request_status} 
          profile={profile}
        />
      )}

      {/* 1. HERO SECTION */}
      <HeroSection user={user} />

      {/* 2. QUICK ACTIONS */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-6 lg:gap-8 px-1 sm:px-2">
        <QuickAction 
            icon={HelpCircle} 
            label="Help" 
            link={createPageUrl("UAEHelpCenter")}
            color="bg-blue-100 text-blue-600"
            delay={1}
        />
        <QuickAction 
            icon={FileText} 
            label="Tools" 
            link={createPageUrl("UtilityTools")}
            color="bg-amber-100 text-amber-600"
            delay={2}
        />
        <QuickAction 
            icon={Users} 
            label="Community" 
            link={createPageUrl("Community")}
            color="bg-green-100 text-green-600"
            delay={3}
        />
        <QuickAction 
            icon={Briefcase} 
            label="Jobs" 
            link={createPageUrl("Jobs")}
            color="bg-purple-100 text-purple-600"
            delay={4}
        />
        <QuickAction 
            icon={ShoppingBag} 
            label="Shop" 
            link={createPageUrl("Marketplace")}
            color="bg-pink-100 text-pink-600"
            delay={5}
        />
      </div>

      {/* 3. FEATURED SECTIONS */}
      
      {/* Marketplace */}
      {data.items.length > 0 && (
        <section>
          <SectionHeader title="Fresh Finds" actionLink={createPageUrl("Marketplace")} actionText="Browse Market" />
          <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x">
             {data.items.map(i => (
                 <FeatureCard 
                    key={i.id}
                    title={i.title}
                    subtitle={i.location?.city || 'UAE'}
                    image={i.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'}
                    badge={i.condition}
                    price={`AED ${i.price}`}
                    link={createPageUrl(`MarketplaceItemDetail?id=${i.id}`)}
                 />
             ))}
          </div>
        </section>
      )}

      {/* Businesses */}
      {data.businesses.length > 0 && (
        <section>
          <SectionHeader title="Top Rated Businesses" actionLink={createPageUrl("Businesses")} />
          <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x">
             {data.businesses.map(b => (
                 <FeatureCard 
                    key={b.id}
                    title={b.name}
                    subtitle={b.location?.city}
                    image={b.images?.[0] || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80'}
                    badge={b.category}
                    link={createPageUrl(`BusinessDetail?id=${b.id}`)}
                 />
             ))}
          </div>
        </section>
      )}

      {/* Events */}
      {data.events.length > 0 && (
          <section>
            <SectionHeader title="Upcoming Events" actionLink={createPageUrl("Events")} />
            <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x">
                {data.events.map(e => (
                    <FeatureCard
                        key={e.id}
                        title={e.title}
                        subtitle={format(new Date(e.start_datetime), 'MMM d, h:mm a')}
                        image={e.images?.[0] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'}
                        badge={e.category}
                        link={createPageUrl(`EventDetail?id=${e.id}`)}
                    />
                ))}
            </div>
          </section>
      )}

      {/* Featured Drivers */}
      {data.drivers.length > 0 && (
        <section>
          <SectionHeader title="Featured Drivers" actionLink={createPageUrl("GetRide")} actionText="View All Drivers" />
          <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x">
            {data.drivers.map(driver => (
              <Link key={driver.id} to={createPageUrl("GetRide")} className="block min-w-[260px] md:min-w-[300px] snap-start group">
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                          {driver.full_name?.[0] || 'D'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{driver.full_name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {driver.location?.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-semibold text-gray-700">4.9</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-orange-100 text-orange-700 text-[10px]">
                        <Car className="w-3 h-3 mr-1" /> Available
                      </Badge>
                      {driver.subscription_status === 'active' && (
                        <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                          <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 h-9 text-sm">
                      <Phone className="w-4 h-4 mr-2" /> Book Ride
                    </Button>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Jobs */}
      {data.jobs.length > 0 && (
        <section>
          <SectionHeader title="Recent Jobs" actionLink={createPageUrl("Jobs")} actionText="View All Jobs" />
          <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x">
            {data.jobs.map(job => (
              <Link key={job.id} to={createPageUrl(`JobDetail?id=${job.id}`)} className="block min-w-[260px] md:min-w-[300px] snap-start group">
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location?.city || 'UAE'}
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 text-[10px] capitalize">{job.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  {job.salary_range && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {job.salary_range}
                    </div>
                  )}
                  <Button variant="outline" className="w-full h-9 text-sm">View Details</Button>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Cash Agents */}
      {data.agents.length > 0 && (
        <section>
          <SectionHeader title={`Cash Agents Near ${user?.location?.city || 'You'}`} actionLink={createPageUrl("GetCash")} actionText="View All Agents" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.agents.map(agent => (
              <Link key={agent.id} to={createPageUrl("GetCash")} className="group">
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                        {agent.full_name?.[0] || 'A'}
                      </div>
                      {agent.subscription_status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-lg">
                          <BadgeCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{agent.full_name}</h4>
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" /> {agent.location?.city}
                      </p>
                    </div>
                    {agent.subscription_status === 'active' && (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">Premium Agent</Badge>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter / CTA */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] bg-gray-900 text-white p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full filter blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl font-bold mb-3">Join the Community</h3>
            <p className="text-gray-400 max-w-md text-lg">
              Stay updated with the latest jobs, events, and deals in the African community in UAE.
            </p>
          </div>
          <Button className="bg-white text-gray-900 hover:bg-gray-100 h-14 px-8 rounded-xl font-bold text-lg">
            Subscribe Now
          </Button>
        </div>
      </motion.div>

    </div>
  );
}