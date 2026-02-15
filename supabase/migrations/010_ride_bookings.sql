-- Ride Bookings Table for Driver Dashboard
-- This tracks ride requests between customers and drivers

-- ============================================
-- RIDE BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ride_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT CHECK (service_type IN ('airport_transfer', 'city_ride', 'long_distance', 'parcel_delivery')) DEFAULT 'city_ride',
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_coordinates JSONB,
  dropoff_coordinates JSONB,
  distance NUMERIC(10,2),
  fare NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
  scheduled_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add driver_settings column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'driver_settings') THEN
    ALTER TABLE public.profiles ADD COLUMN driver_settings JSONB DEFAULT '{}';
  END IF;
END $$;

-- RLS Policies for ride_bookings
ALTER TABLE public.ride_bookings ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings" ON public.ride_bookings
  FOR SELECT USING (auth.uid() = customer_id);

-- Drivers can view bookings assigned to them
CREATE POLICY "Drivers can view assigned bookings" ON public.ride_bookings
  FOR SELECT USING (auth.uid() = driver_id);

-- Customers can create bookings
CREATE POLICY "Customers can create bookings" ON public.ride_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Participants can update their bookings
CREATE POLICY "Participants can update bookings" ON public.ride_bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = driver_id);

-- Admins can do everything
CREATE POLICY "Admins full access to bookings" ON public.ride_bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ride_bookings_driver ON public.ride_bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_bookings_customer ON public.ride_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_ride_bookings_status ON public.ride_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ride_bookings_created ON public.ride_bookings(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ride_booking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS ride_bookings_updated_at ON public.ride_bookings;
CREATE TRIGGER ride_bookings_updated_at
  BEFORE UPDATE ON public.ride_bookings
  FOR EACH ROW EXECUTE FUNCTION update_ride_booking_timestamp();
