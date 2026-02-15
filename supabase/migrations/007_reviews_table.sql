-- ============================================
-- REVIEWS TABLE
-- ============================================
-- Reviews for professionals (agents, drivers, vendors)

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('agent', 'driver', 'business')),
  entity_id UUID, -- Optional: specific business ID if reviewing a business
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT FALSE, -- True if linked to a real transaction
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported')),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewed_user_id, transaction_id) -- One review per transaction
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON public.reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_type ON public.reviews(entity_type);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_date);

-- ============================================
-- RLS POLICIES FOR REVIEWS
-- ============================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view active reviews
CREATE POLICY "Anyone can view active reviews"
  ON public.reviews FOR SELECT
  USING (status = 'active');

-- Users can create reviews (must be authenticated)
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- UPDATE PROFILES TABLE - Add banner_image and agent fields
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';

-- ============================================
-- ADD TRANSACTION FIELDS FOR AGENT TRACKING
-- ============================================
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS service_type TEXT CHECK (service_type IN ('cash_to_mobile', 'mobile_to_cash', 'international_transfer', 'delivery', 'ride'));

-- ============================================
-- FUNCTION TO UPDATE PROFILE STATS
-- ============================================
CREATE OR REPLACE FUNCTION update_profile_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET 
      rating = (
        SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
        FROM public.reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id AND status = 'active'
      ),
      reviews_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id AND status = 'active'
      )
    WHERE id = NEW.reviewed_user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET 
      rating = (
        SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
        FROM public.reviews
        WHERE reviewed_user_id = OLD.reviewed_user_id AND status = 'active'
      ),
      reviews_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE reviewed_user_id = OLD.reviewed_user_id AND status = 'active'
      )
    WHERE id = OLD.reviewed_user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stats update
DROP TRIGGER IF EXISTS trigger_update_review_stats ON public.reviews;
CREATE TRIGGER trigger_update_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_review_stats();
