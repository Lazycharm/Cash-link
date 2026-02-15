-- CashLink Row Level Security Policies
-- This migration adds RLS policies to all tables

-- ============================================
-- PROFILES RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read basic profile info
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- BUSINESSES RLS
-- ============================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved businesses
CREATE POLICY "Anyone can view approved businesses"
  ON public.businesses FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create businesses
CREATE POLICY "Authenticated users can create businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their businesses
CREATE POLICY "Owners can update their businesses"
  ON public.businesses FOR UPDATE
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Owners can delete their businesses
CREATE POLICY "Owners can delete their businesses"
  ON public.businesses FOR DELETE
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- JOBS RLS
-- ============================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved jobs
CREATE POLICY "Anyone can view approved jobs"
  ON public.jobs FOR SELECT
  USING (status = 'approved' OR poster_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create jobs
CREATE POLICY "Authenticated users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = poster_id);

-- Posters can update their jobs
CREATE POLICY "Posters can update their jobs"
  ON public.jobs FOR UPDATE
  USING (poster_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Posters can delete their jobs
CREATE POLICY "Posters can delete their jobs"
  ON public.jobs FOR DELETE
  USING (poster_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- EVENTS RLS
-- ============================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved events
CREATE POLICY "Anyone can view approved events"
  ON public.events FOR SELECT
  USING (status = 'approved' OR organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their events
CREATE POLICY "Organizers can update their events"
  ON public.events FOR UPDATE
  USING (organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Organizers can delete their events
CREATE POLICY "Organizers can delete their events"
  ON public.events FOR DELETE
  USING (organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- MARKETPLACE_ITEMS RLS
-- ============================================
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved items
CREATE POLICY "Anyone can view approved marketplace items"
  ON public.marketplace_items FOR SELECT
  USING (status = 'approved' OR seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create items
CREATE POLICY "Authenticated users can create marketplace items"
  ON public.marketplace_items FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their items
CREATE POLICY "Sellers can update their marketplace items"
  ON public.marketplace_items FOR UPDATE
  USING (seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Sellers can delete their items
CREATE POLICY "Sellers can delete their marketplace items"
  ON public.marketplace_items FOR DELETE
  USING (seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- TRANSACTIONS RLS
-- ============================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (
    customer_id = auth.uid() OR 
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can create transactions
CREATE POLICY "Authenticated users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Agents, customers, and admins can update their transactions
CREATE POLICY "Participants can update transactions"
  ON public.transactions FOR UPDATE
  USING (
    customer_id = auth.uid() OR
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- NOTIFICATIONS RLS
-- ============================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- System/admins can create notifications for users
CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) OR user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- DONATIONS RLS
-- ============================================
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active donations
CREATE POLICY "Anyone can view active donations"
  ON public.donations FOR SELECT
  USING (status = 'active' OR organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create donations
CREATE POLICY "Authenticated users can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their donations
CREATE POLICY "Organizers can update their donations"
  ON public.donations FOR UPDATE
  USING (organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- LOST_ITEMS RLS
-- ============================================
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view open lost items
CREATE POLICY "Anyone can view open lost items"
  ON public.lost_items FOR SELECT
  USING (status = 'open' OR reporter_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create lost items
CREATE POLICY "Authenticated users can create lost items"
  ON public.lost_items FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters can update their lost items
CREATE POLICY "Reporters can update their lost items"
  ON public.lost_items FOR UPDATE
  USING (reporter_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- EMERGENCY_SERVICES RLS
-- ============================================
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active emergency services
CREATE POLICY "Anyone can view active emergency services"
  ON public.emergency_services FOR SELECT
  USING (is_active = true);

-- Only admins can manage emergency services
CREATE POLICY "Admins can manage emergency services"
  ON public.emergency_services FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- SITE_CONTENT RLS
-- ============================================
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- PROMOTION_REQUESTS RLS
-- ============================================
ALTER TABLE public.promotion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own promotion requests
CREATE POLICY "Users can view their own promotion requests"
  ON public.promotion_requests FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create promotion requests
CREATE POLICY "Authenticated users can create promotion requests"
  ON public.promotion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update promotion requests
CREATE POLICY "Admins can update promotion requests"
  ON public.promotion_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- SUBSCRIPTION_REQUESTS RLS
-- ============================================
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription requests
CREATE POLICY "Users can view their own subscription requests"
  ON public.subscription_requests FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create subscription requests
CREATE POLICY "Authenticated users can create subscription requests"
  ON public.subscription_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update subscription requests
CREATE POLICY "Admins can update subscription requests"
  ON public.subscription_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- ACTIVITY_LOG RLS
-- ============================================
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity log
CREATE POLICY "Admins can view activity log"
  ON public.activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- System can create activity logs
CREATE POLICY "Authenticated users can create activity logs"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- APP_SETTINGS RLS
-- ============================================
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read app settings
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Only admins can update app settings
CREATE POLICY "Admins can update app settings"
  ON public.app_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
