import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const Welcome = lazy(() => import('@/pages/Welcome'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const AboutUs = lazy(() => import('@/pages/AboutUs'));
const CompleteSignup = lazy(() => import('@/pages/CompleteSignup'));
const Profile = lazy(() => import('@/pages/Profile'));
const Notifications = lazy(() => import('@/pages/Notifications'));

// Business pages
const Businesses = lazy(() => import('@/pages/Businesses'));
const BusinessDetail = lazy(() => import('@/pages/BusinessDetail'));
const AddBusiness = lazy(() => import('@/pages/AddBusiness'));
const EditBusiness = lazy(() => import('@/pages/EditBusiness'));

// Jobs pages
const Jobs = lazy(() => import('@/pages/Jobs'));
const JobDetail = lazy(() => import('@/pages/JobDetail'));
const PostJob = lazy(() => import('@/pages/PostJob'));

// Events pages
const Events = lazy(() => import('@/pages/Events'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const AddEvent = lazy(() => import('@/pages/AddEvent'));
const EditEvent = lazy(() => import('@/pages/EditEvent'));

// Marketplace pages
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const MarketplaceItemDetail = lazy(() => import('@/pages/MarketplaceItemDetail'));
const SellItem = lazy(() => import('@/pages/Sellitem'));

// Community pages
const Community = lazy(() => import('@/pages/Community'));
const Donations = lazy(() => import('@/pages/Donations'));
const CreateDonation = lazy(() => import('@/pages/CreateDonation'));
const LostAndFound = lazy(() => import('@/pages/LostAndFound'));
const ReportLostItem = lazy(() => import('@/pages/ReportLostItem'));
const EmergencyServices = lazy(() => import('@/pages/EmergencyServices'));
const UAEHelpCenter = lazy(() => import('@/pages/UAEHelpCenter'));

// Services pages
const GetCash = lazy(() => import('@/pages/GetCash'));
const GetRide = lazy(() => import('@/pages/GetRide'));
const UtilityTools = lazy(() => import('@/pages/UtilityTools'));
const Subscribe = lazy(() => import('@/pages/Subscribe'));
const PromoteContent = lazy(() => import('@/pages/PromoteContent'));

// Dashboard pages
const VendorDashboard = lazy(() => import('@/pages/VendorDashboard'));
const MoneyAgentDashboard = lazy(() => import('@/pages/MoneyAgentDashboard'));
const DriverDashboard = lazy(() => import('@/pages/DriverDashboard'));
const RolePending = lazy(() => import('@/pages/RolePending'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminUserManagement = lazy(() => import('@/pages/AdminUserManagement'));
const AdminBusinessManagement = lazy(() => import('@/pages/AdminBusinessManagement'));
const AdminContentManagement = lazy(() => import('@/pages/AdminContentManagement'));
const AdminDonationsManagement = lazy(() => import('@/pages/AdminDonationsManagement'));
const AdminPromotions = lazy(() => import('@/pages/AdminPromotions'));
const AdminSubscriptionManagement = lazy(() => import('@/pages/AdminSubscriptionManagement'));
const AdminSiteContent = lazy(() => import('@/pages/AdminSiteContent'));
const AdminUAEHelpCenter = lazy(() => import('@/pages/AdminUAEHelpCenter'));
const AdminAppSettings = lazy(() => import('@/pages/AdminAppSettings'));

// Legal pages
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Agreements = lazy(() => import('@/pages/Agreements'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const Settings = lazy(() => import('@/pages/Settings'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-signup" element={<CompleteSignup />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

        {/* Main layout routes */}
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Profile */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute><EditProfile /></ProtectedRoute>
          } />
          <Route path="/profile/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />

          {/* Businesses */}
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/add-business" element={
            <ProtectedRoute><AddBusiness /></ProtectedRoute>
          } />
          <Route path="/edit-business/:id" element={
            <ProtectedRoute><EditBusiness /></ProtectedRoute>
          } />

          {/* Jobs */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/post-job" element={
            <ProtectedRoute><PostJob /></ProtectedRoute>
          } />

          {/* Events */}
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/add-event" element={
            <ProtectedRoute><AddEvent /></ProtectedRoute>
          } />
          <Route path="/edit-event/:id" element={
            <ProtectedRoute><EditEvent /></ProtectedRoute>
          } />

          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<MarketplaceItemDetail />} />
          <Route path="/sell-item" element={
            <ProtectedRoute><SellItem /></ProtectedRoute>
          } />

          {/* Community */}
          <Route path="/community" element={<Community />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/create-donation" element={
            <ProtectedRoute><CreateDonation /></ProtectedRoute>
          } />
          <Route path="/lost-and-found" element={<LostAndFound />} />
          <Route path="/report-lost-item" element={
            <ProtectedRoute><ReportLostItem /></ProtectedRoute>
          } />
          <Route path="/emergency-services" element={<EmergencyServices />} />
          <Route path="/uae-help" element={<UAEHelpCenter />} />

          {/* Services */}
          <Route path="/get-cash" element={<GetCash />} />
          <Route path="/get-ride" element={<GetRide />} />
          <Route path="/utility-tools" element={<UtilityTools />} />
          <Route path="/subscribe" element={
            <ProtectedRoute><Subscribe /></ProtectedRoute>
          } />
          <Route path="/promote" element={
            <ProtectedRoute><PromoteContent /></ProtectedRoute>
          } />

          {/* Role-specific dashboards */}
          <Route path="/vendor-dashboard" element={
            <ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>
          } />
          <Route path="/agent-dashboard" element={
            <ProtectedRoute requiredRole="agent"><MoneyAgentDashboard /></ProtectedRoute>
          } />
          <Route path="/driver-dashboard" element={
            <ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>
          } />
          <Route path="/role-pending" element={
            <ProtectedRoute><RolePending /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUserManagement /></AdminRoute>
          } />
          <Route path="/admin/businesses" element={
            <AdminRoute><AdminBusinessManagement /></AdminRoute>
          } />
          <Route path="/admin/content" element={
            <AdminRoute><AdminContentManagement /></AdminRoute>
          } />
          <Route path="/admin/donations" element={
            <AdminRoute><AdminDonationsManagement /></AdminRoute>
          } />
          <Route path="/admin/promotions" element={
            <AdminRoute><AdminPromotions /></AdminRoute>
          } />
          <Route path="/admin/subscriptions" element={
            <AdminRoute><AdminSubscriptionManagement /></AdminRoute>
          } />
          <Route path="/admin/site-content" element={
            <AdminRoute><AdminSiteContent /></AdminRoute>
          } />
          <Route path="/admin/uae-help-center" element={
            <AdminRoute><AdminUAEHelpCenter /></AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute><AdminAppSettings /></AdminRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
