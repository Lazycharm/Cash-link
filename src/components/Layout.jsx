import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/entities/Notification";
import {
  Home,
  DollarSign,
  Briefcase,
  Calendar,
  ShoppingBag,
  Menu,
  Bell,
  X,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Globe,
  Users,
  FileText,
  Star,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// --- NAVIGATION ITEMS ---
const navConfig = [
  { id: "getcash", label: "GetCash", icon: DollarSign, path: "/get-cash" },
  { id: "business", label: "Business", icon: Briefcase, path: "/businesses" },
  { id: "home", label: "Home", icon: Home, path: "/", isPrimary: true },
  { id: "events", label: "Events", icon: Calendar, path: "/events" },
  { id: "market", label: "Market", icon: ShoppingBag, path: "/marketplace" },
];

const adminNavConfig = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "content", label: "Content", icon: FileText, path: "/admin/content" },
  { id: "promotions", label: "Promotions", icon: Star, path: "/admin/promotions" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, path: "/admin/subscriptions" },
  { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, profileLoading, signOut } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAdminSection = location.pathname.startsWith('/admin');
  const currentNav = isAdminSection ? adminNavConfig : navConfig;

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (user?.id) {
      try {
        const count = await Notification.getUnreadCount(user.id);
        setNotificationCount(count || 0);
      } catch (e) {
        console.error('Error loading notifications:', e);
      }
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle auth redirects
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/welcome');
        return;
      }

      // Wait for profile to load before redirecting
      if (profileLoading || !profile) {
        return;
      }

      // Admin bypasses all profile checks
      if (profile?.role === 'admin') {
        return;
      }

      // Check profile completion (but not for admin)
      if (profile && (!profile.phone && !profile.phone_number) && !profile.full_name) {
        if (!location.pathname.includes('complete-signup')) {
          navigate('/complete-signup');
          return;
        }
      }

      // Check role pending status
      if (profile?.role_status === 'pending' && !location.pathname.includes('role-pending')) {
        navigate('/role-pending');
        return;
      }
    }
  }, [user, profile, loading, profileLoading, location.pathname, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/welcome');
  };

  // Loading state - only block on initial auth loading, not profile
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="CashLink" 
            className="w-20 h-20 object-contain mb-4 animate-pulse"
          />
          <p className="text-[#0A8F54] font-medium tracking-wide text-sm">LOADING...</p>
        </div>
      </div>
    );
  }

  // Show loading if we have user but no profile yet
  if (user && !profile && profileLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="CashLink" 
            className="w-20 h-20 object-contain mb-4 animate-pulse"
          />
          <p className="text-[#0A8F54] font-medium tracking-wide text-sm">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:pl-[280px] overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-gray-100 flex-col z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="CashLink" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">CashLink</span>
          </Link>

          <nav className="space-y-2">
            {currentNav.map(item => {
              const isActive = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);
              return (
                <Link key={item.id} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 text-base ${
                      isActive 
                        ? 'bg-green-50 text-[#0A8F54] font-semibold' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Admin quick access for admins */}
          {profile?.role === 'admin' && !isAdminSection && (
            <div className="mt-6 pt-6 border-t">
              <Link to="/admin">
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          )}

          {/* Back to app for admin section */}
          {isAdminSection && (
            <div className="mt-6 pt-6 border-t">
              <Link to="/">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Back to App
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-gray-50">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={profile?.profile_image} />
              <AvatarFallback className="bg-[#E9C46A] text-[#0A8F54] font-bold">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role || 'Member'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* MOBILE HEADER - Fixed on scroll, respects safe area */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md z-[100] flex items-center justify-between shadow-md border-b border-gray-200 safe-area-inset-top" style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
        <div className="flex items-center gap-2 flex-shrink-0 px-4 min-w-0">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="CashLink" className="w-8 h-8 object-contain flex-shrink-0" />
            <span className="font-bold text-lg text-gray-900 whitespace-nowrap">CashLink</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 px-4">
          <Link to="/notifications" className="p-1.5 flex-shrink-0">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-700 flex-shrink-0" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
          </Link>
          <Link to="/profile" className="p-0.5 flex-shrink-0">
            <Avatar className="w-8 h-8 border-2 border-gray-200 flex-shrink-0">
              <AvatarImage src={profile?.profile_image} />
              <AvatarFallback className="bg-[#E9C46A] text-[#0A8F54] font-bold text-xs">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT - Prevents horizontal overflow */}
      <main className="pt-16 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 min-h-screen overflow-x-hidden max-w-full">
        <div className="max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION - Fixed on scroll, respects safe area */}
      {!isAdminSection && (
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          style={{ 
            paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
            minHeight: '80px',
            height: 'calc(80px + max(env(safe-area-inset-bottom), 0px))'
          }}
        >
          <div className="flex items-center justify-between px-2 h-[80px] w-full">
            {navConfig.map((item) => {
              if (item.isPrimary) {
                return (
                  <div key={item.id} className="relative -top-6 flex-shrink-0 z-10">
                    <Link to={item.path}>
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 rounded-full bg-[#0A8F54] flex items-center justify-center text-white shadow-xl border-4 border-white"
                        style={{ boxShadow: '0 8px 30px rgba(10, 143, 84, 0.4)' }}
                      >
                        <item.icon className="w-7 h-7" />
                      </motion.div>
                    </Link>
                  </div>
                );
              }
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0"
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'text-[#0A8F54]' : 'text-gray-400'}`} />
                  <span className={`text-[10px] font-medium truncate w-full text-center ${isActive ? 'text-[#0A8F54]' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
