import React, { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";
import { AppSettings } from "@/entities/AppSettings";
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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// --- THEME & STYLES ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --primary-green: #0A8F54;
      --primary-green-dark: #076d40;
      --accent-gold: #E9C46A;
      --bg-offwhite: #F8F9FA;
      --text-dark: #1F2937;
    }
    body {
      background-color: var(--bg-offwhite);
      color: var(--text-dark);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .text-primary-green { color: var(--primary-green); }
    .bg-primary-green { background-color: var(--primary-green); }
    .text-accent-gold { color: var(--accent-gold); }
    .bg-accent-gold { background-color: var(--accent-gold); }
    
    .nav-blur {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .shadow-soft {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .fab-shadow {
      box-shadow: 0 8px 30px rgba(10, 143, 84, 0.4);
    }
  `}</style>
);

// --- NAVIGATION ITEMS ---
const navConfig = [
  { id: "getcash", label: "GetCash", icon: DollarSign, path: "GetCash" },
  { id: "business", label: "Business", icon: Briefcase, path: "Businesses" },
  { id: "home", label: "Home", icon: Home, path: "Home", isPrimary: true },
  { id: "events", label: "Events", icon: Calendar, path: "Events" },
  { id: "market", label: "Market", icon: ShoppingBag, path: "Marketplace" },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  // --- AUTH CHECK LOGIC (PRESERVED) ---
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);

      const isSystemAdmin = currentUser && currentUser.role === 'admin';
      
      if (isSystemAdmin) {
        setIsCheckingAuth(false);
        // Redirect admins away from setup/welcome pages
        if (["Welcome", "CompleteSignup", "RolePending"].includes(currentPageName)) {
           window.location.href = createPageUrl("AdminDashboard");
           return;
        }
        return;
      }

      if (currentUser) {
        // Redirect logged-in users away from Welcome page
        if (currentPageName === "Welcome") {
            window.location.href = createPageUrl("Home");
            return;
        }
        
        // If on CompleteSignup but already complete, go Home
        if (currentPageName === "CompleteSignup" && currentUser.phone_number && currentUser.location?.city) {
            window.location.href = createPageUrl("Home");
            return;
        }

        // If on RolePending but already approved, go Home
        if (currentPageName === "RolePending" && currentUser.role_status === 'approved') {
            window.location.href = createPageUrl("Home");
            return;
        }

        // Check 1: Profile Completion
        if ((!currentUser.phone_number || !currentUser.location?.city) && currentPageName !== "CompleteSignup") {
          window.location.href = createPageUrl("CompleteSignup");
          return;
        }

        // Check 2: Role Status
        if (currentUser.role_status === 'pending' && currentPageName !== "RolePending" && currentPageName !== "CompleteSignup") {
          window.location.href = createPageUrl("RolePending");
          return;
        }
      }
    } catch (error) {
      setUser(null);
    }
    setIsCheckingAuth(false);
  }, [currentPageName]);

  const loadNotifications = useCallback(async () => {
    if (user?.id) {
        try {
            // FIXED: Use filter instead of count - Ensure no .count() calls
            const notifications = await Notification.filter({ user_id: user.id, is_read: false });
            setNotificationCount(notifications.length || 0);
        } catch (e) { console.error(e); }
    }
  }, [user]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);


  // --- HANDLING ---
  const handleLogout = async () => {
    await UserEntity.logout();
    window.location.href = createPageUrl("Welcome");
  };

  // --- RENDERING ---

  // 1. Loading State
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0A8F54] flex items-center justify-center mb-4 animate-pulse shadow-lg">
                <span className="text-white font-bold text-2xl">CL</span>
            </div>
            <p className="text-[#0A8F54] font-medium tracking-wide text-sm">LOADING CASHLINK...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Public Pages
  if (!user && currentPageName !== "Welcome") {
     if (!isCheckingAuth) window.location.href = createPageUrl("Welcome");
     return null;
  }
  
  if (["Welcome", "CompleteSignup", "RolePending"].includes(currentPageName)) {
    return (
        <>
            <GlobalStyles />
            {children}
        </>
    );
  }

  // 3. Main App Layout
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:pl-[280px]">
      <GlobalStyles />
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-gray-100 flex-col z-50">
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#0A8F54] flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">CL</span>
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">CashLink</span>
            </div>
            
            <nav className="space-y-2">
                {navConfig.map(item => (
                    <Link key={item.id} to={createPageUrl(item.path)}>
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3 h-12 text-base ${location.pathname.includes(item.path) ? 'bg-green-50 text-[#0A8F54] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-100">
             <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-gray-50">
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={user?.profile_image} />
                    <AvatarFallback className="bg-[#E9C46A] text-[#0A8F54] font-bold">
                        {user?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.app_role || 'Member'}</p>
                </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sign Out
            </Button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md z-40 px-4 flex items-center justify-between shadow-sm border-b border-gray-100/50">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A8F54] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="font-bold text-lg text-gray-900">CashLink</span>
         </div>
         
         <div className="flex items-center gap-3">
             <Link to={createPageUrl("Notifications")}>
                <div className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                            {notificationCount}
                        </span>
                    )}
                </div>
             </Link>
             <Link to={createPageUrl("Profile")}>
                <Avatar className="w-8 h-8 border border-gray-100">
                    <AvatarImage src={user?.profile_image} />
                    <AvatarFallback className="bg-[#E9C46A] text-[#0A8F54] font-bold text-xs">
                        {user?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
             </Link>
         </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-20 px-4 md:px-8 md:pt-8 min-h-screen">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 h-[80px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
         <div className="flex items-center justify-between px-2 h-full">
            {navConfig.map((item, idx) => {
                if (item.isPrimary) {
                    return (
                        <div key={item.id} className="relative -top-6">
                            <Link to={createPageUrl(item.path)}>
                                <motion.div 
                                    whileTap={{ scale: 0.9 }}
                                    className="w-16 h-16 rounded-full bg-[#0A8F54] flex items-center justify-center text-white shadow-lg fab-shadow border-4 border-[#F8F9FA]"
                                >
                                    <item.icon className="w-7 h-7" />
                                </motion.div>
                            </Link>
                        </div>
                    );
                }
                const isActive = location.pathname.includes(item.path);
                return (
                    <Link key={item.id} to={createPageUrl(item.path)} className="flex-1 flex flex-col items-center justify-center gap-1">
                        <item.icon className={`w-6 h-6 ${isActive ? 'text-[#0A8F54]' : 'text-gray-400'}`} />
                        <span className={`text-[10px] font-medium ${isActive ? 'text-[#0A8F54]' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
         </div>
      </nav>
    </div>
  );
}