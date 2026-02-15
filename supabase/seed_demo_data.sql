-- ============================================
-- CASHLINK DEMO DATA SEED FILE
-- Run this in Supabase SQL Editor AFTER running migrations
-- Uses your existing admin user as the owner for all content
-- ============================================

-- IMPORTANT: Replace this with your actual admin user ID if different
-- You can find it in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  admin_id UUID := 'f090c451-f0f5-40ec-8855-5ab44073a6b1'; -- Your admin user ID
BEGIN

-- ============================================
-- DEMO BUSINESSES (10 businesses)
-- ============================================
INSERT INTO public.businesses (id, owner_id, name, description, category, images, location, contact, status, is_featured, rating, reviews_count, views_count)
VALUES 
  ('11111111-0001-0001-0001-000000000001', admin_id, 'Mama Africa Kitchen', 'Authentic African cuisine - Ugandan, Nigerian, Ethiopian dishes. Best Rolex in Dubai!', 'restaurant', ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Al Karama, Dubai"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'approved', true, 4.8, 156, 2340),
  ('11111111-0001-0001-0001-000000000002', admin_id, 'African Groceries Plus', 'All your African groceries - Matooke, Posho, Palm Oil, Suya Spices and more!', 'grocery', ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'], '{"city": "Sharjah", "country": "UAE", "address": "Al Nahda, Sharjah"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'approved', true, 4.6, 89, 1567),
  ('11111111-0001-0001-0001-000000000003', admin_id, 'Quick Phone Repairs', 'Professional phone repairs - Screen replacement, battery, water damage. All brands.', 'services', ARRAY['https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Deira City Centre"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'approved', false, 4.5, 67, 890),
  ('11111111-0001-0001-0001-000000000004', admin_id, 'Safari Barber Shop', 'Professional African barbershop. Fades, braids, dreadlocks, and traditional styles.', 'services', ARRAY['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'], '{"city": "Abu Dhabi", "country": "UAE", "address": "Electra Street"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'approved', true, 4.9, 234, 3450),
  ('11111111-0001-0001-0001-000000000005', admin_id, 'Ubuntu Fashion', 'African fashion - Ankara, Kitenge, Dashiki. Custom tailoring available.', 'retail', ARRAY['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Dragon Mart"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'approved', false, 4.4, 45, 678),
  ('11111111-0001-0001-0001-000000000006', admin_id, 'Kilimanjaro Lounge', 'African nightclub & lounge. Live Afrobeats every weekend. VIP sections available.', 'entertainment', ARRAY['https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Bur Dubai"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'approved', true, 4.3, 178, 4560),
  ('11111111-0001-0001-0001-000000000007', admin_id, 'Naija Express Transport', 'Reliable transport services - Airport pickup, moving services, deliveries.', 'transport', ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Al Quoz"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'approved', false, 4.7, 123, 1890),
  ('11111111-0001-0001-0001-000000000008', admin_id, 'Kampala Cafe', 'Ugandan coffee shop. Fresh roasted beans, Rolex wraps, and samosas.', 'restaurant', ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800'], '{"city": "Ajman", "country": "UAE", "address": "Ajman City Centre"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'approved', false, 4.5, 56, 789),
  ('11111111-0001-0001-0001-000000000009', admin_id, 'Afro Beauty Salon', 'Natural hair care, braiding, weaves, and beauty treatments for African hair.', 'services', ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'], '{"city": "Dubai", "country": "UAE", "address": "International City"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'approved', true, 4.8, 289, 4321),
  ('11111111-0001-0001-0001-000000000010', admin_id, 'Congo Electronics', 'New and used electronics - TVs, laptops, phones. Best prices in UAE.', 'retail', ARRAY['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'], '{"city": "Sharjah", "country": "UAE", "address": "Rolla Square"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'approved', false, 4.2, 78, 1234)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- DEMO JOBS (10 job listings)
-- ============================================
INSERT INTO public.jobs (id, poster_id, title, description, category, salary_range, location, contact, employment_type, requirements, status, is_featured, views_count, applications_count)
VALUES 
  ('22222222-0002-0002-0002-000000000001', admin_id, 'Chef - African Cuisine', 'Looking for experienced chef specializing in West African and East African dishes.', 'hospitality', '4000-6000 AED', '{"city": "Dubai", "country": "UAE", "address": "Al Karama"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'full-time', ARRAY['3+ years experience', 'Food handling certificate', 'Knowledge of African cuisines'], 'approved', true, 456, 23),
  ('22222222-0002-0002-0002-000000000002', admin_id, 'Delivery Driver', 'Delivery driver needed for grocery store. Own vehicle preferred.', 'transport', '3000-4500 AED', '{"city": "Sharjah", "country": "UAE", "address": "Al Nahda"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'full-time', ARRAY['Valid UAE license', 'Own vehicle', 'Knowledge of Sharjah area'], 'approved', false, 234, 45),
  ('22222222-0002-0002-0002-000000000003', admin_id, 'Sales Representative', 'Join our growing team as a sales rep. Commission-based + base salary.', 'sales', '2500-8000 AED', '{"city": "Dubai", "country": "UAE", "address": "Downtown Dubai"}', '{"phone": "+971502345678", "whatsapp": "+971502345678"}', 'full-time', ARRAY['Fluent in English', 'Sales experience preferred', 'African languages a plus'], 'approved', true, 567, 67),
  ('22222222-0002-0002-0002-000000000004', admin_id, 'House Cleaner', 'Part-time house cleaner needed for villa in JBR. Flexible hours.', 'domestic', '1500-2500 AED', '{"city": "Dubai", "country": "UAE", "address": "JBR"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'part-time', ARRAY['Experience preferred', 'Reliable', 'References required'], 'approved', false, 345, 34),
  ('22222222-0002-0002-0002-000000000005', admin_id, 'Construction Worker', 'Skilled construction workers needed for new project in Abu Dhabi.', 'construction', '2500-3500 AED', '{"city": "Abu Dhabi", "country": "UAE", "address": "Yas Island"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'contract', ARRAY['Construction experience', 'Physical fitness', 'Safety certification'], 'approved', false, 189, 56),
  ('22222222-0002-0002-0002-000000000006', admin_id, 'Customer Service Agent', 'Bilingual customer service for fintech company. English + French/Swahili.', 'technology', '5000-7000 AED', '{"city": "Dubai", "country": "UAE", "address": "DIFC"}', '{"phone": "+971503456789", "whatsapp": "+971503456789"}', 'full-time', ARRAY['Bilingual required', 'Customer service experience', 'Computer literate'], 'approved', true, 678, 89),
  ('22222222-0002-0002-0002-000000000007', admin_id, 'Barber', 'Experienced barber for busy African barbershop. Great tips!', 'services', '3500-5000 AED', '{"city": "Abu Dhabi", "country": "UAE", "address": "Electra Street"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'full-time', ARRAY['5+ years experience', 'Fades and African styles', 'Customer friendly'], 'approved', false, 234, 12),
  ('22222222-0002-0002-0002-000000000008', admin_id, 'Nurse/Caregiver', 'Home nurse needed for elderly care. Night shifts available.', 'healthcare', '4000-5500 AED', '{"city": "Dubai", "country": "UAE", "address": "Palm Jumeirah"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', 'full-time', ARRAY['Nursing qualification', 'Elder care experience', 'First aid certified'], 'approved', true, 456, 23),
  ('22222222-0002-0002-0002-000000000009', admin_id, 'Restaurant Manager', 'Manager for African restaurant. Must have F&B management experience.', 'hospitality', '6000-9000 AED', '{"city": "Dubai", "country": "UAE", "address": "Business Bay"}', '{"phone": "+971502345678", "whatsapp": "+971502345678"}', 'full-time', ARRAY['F&B management experience', 'Team leadership', 'POS system knowledge'], 'approved', false, 345, 18),
  ('22222222-0002-0002-0002-000000000010', admin_id, 'Security Guard', 'Security guard for residential building. Night shifts.', 'other', '2500-3000 AED', '{"city": "Ajman", "country": "UAE", "address": "Ajman Downtown"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', 'full-time', ARRAY['Security experience', 'Physical fitness', 'Clean record'], 'approved', false, 123, 34)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- DEMO EVENTS (10 events)
-- ============================================
INSERT INTO public.events (id, organizer_id, title, description, category, images, location, contact, start_datetime, end_datetime, is_free, ticket_price, max_attendees, status, is_featured, views_count, attendees_count)
VALUES 
  ('33333333-0003-0003-0003-000000000001', admin_id, 'African Food Festival 2026', 'The biggest African food festival in UAE! Taste dishes from 20+ countries.', 'cultural', ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Dubai World Trade Centre"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', '2026-02-15 10:00:00+04', '2026-02-15 22:00:00+04', false, 50.00, 5000, 'approved', true, 4567, 1234),
  ('33333333-0003-0003-0003-000000000002', admin_id, 'Afrobeats Night', 'Monthly Afrobeats party! DJ Spinall live. Ladies free before 11pm.', 'entertainment', ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Barasti Beach"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', '2026-01-25 21:00:00+04', '2026-01-26 03:00:00+04', false, 100.00, 800, 'approved', true, 2345, 456),
  ('33333333-0003-0003-0003-000000000003', admin_id, 'African Community Meetup', 'Monthly networking event for Africans in UAE. Free entry, drinks available.', 'community', ARRAY['https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Alserkal Avenue"}', '{"phone": "+971502345678", "whatsapp": "+971502345678"}', '2026-01-20 18:00:00+04', '2026-01-20 22:00:00+04', true, NULL, 200, 'approved', false, 890, 156),
  ('33333333-0003-0003-0003-000000000004', admin_id, 'African Business Summit', '2-day conference for African entrepreneurs in the Gulf. Workshops and networking.', 'business', ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'], '{"city": "Abu Dhabi", "country": "UAE", "address": "ADNEC"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', '2026-03-10 09:00:00+04', '2026-03-11 17:00:00+04', false, 200.00, 500, 'approved', true, 1567, 234),
  ('33333333-0003-0003-0003-000000000005', admin_id, 'African Football Tournament', 'Inter-community football tournament. Register your team now!', 'sports', ARRAY['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Dubai Sports City"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', '2026-02-01 08:00:00+04', '2026-02-01 18:00:00+04', false, 500.00, 16, 'approved', false, 678, 12),
  ('33333333-0003-0003-0003-000000000006', admin_id, 'Sunday Church Service - African Diaspora', 'Join us for worship in African languages. Swahili, Luganda, Yoruba services.', 'religious', ARRAY['https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800'], '{"city": "Dubai", "country": "UAE", "address": "St. Mary Church, Oud Metha"}', '{"phone": "+971503456789", "whatsapp": "+971503456789"}', '2026-01-26 09:00:00+04', '2026-01-26 12:00:00+04', true, NULL, 300, 'approved', false, 456, 178),
  ('33333333-0003-0003-0003-000000000007', admin_id, 'African Fashion Show', 'Showcasing African designers in UAE. Runway show, shopping, and networking.', 'cultural', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], '{"city": "Dubai", "country": "UAE", "address": "City Walk"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', '2026-02-20 19:00:00+04', '2026-02-20 23:00:00+04', false, 150.00, 400, 'approved', true, 2345, 289),
  ('33333333-0003-0003-0003-000000000008', admin_id, 'Kids African Dance Class', 'Weekly dance class for kids 5-12. Learn traditional African dances!', 'entertainment', ARRAY['https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'], '{"city": "Dubai", "country": "UAE", "address": "JLT Community Centre"}', '{"phone": "+971504567890", "whatsapp": "+971504567890"}', '2026-01-25 10:00:00+04', '2026-01-25 12:00:00+04', false, 75.00, 30, 'approved', false, 234, 18),
  ('33333333-0003-0003-0003-000000000009', admin_id, 'African Independence Day Celebration', 'Celebrating African independence days together! Food, music, and culture.', 'cultural', ARRAY['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'], '{"city": "Sharjah", "country": "UAE", "address": "Al Majaz Waterfront"}', '{"phone": "+971502345678", "whatsapp": "+971502345678"}', '2026-04-18 16:00:00+04', '2026-04-18 23:00:00+04', true, NULL, 1000, 'approved', false, 567, 345),
  ('33333333-0003-0003-0003-000000000010', admin_id, 'African Cooking Masterclass', 'Learn to cook authentic Jollof Rice and Ugandan Rolex with Chef Mama Africa.', 'community', ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'], '{"city": "Dubai", "country": "UAE", "address": "DIFC Gate Avenue"}', '{"phone": "+971505678901", "whatsapp": "+971505678901"}', '2026-02-08 14:00:00+04', '2026-02-08 17:00:00+04', false, 120.00, 25, 'approved', false, 345, 22)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- DEMO MARKETPLACE ITEMS (10 items)
-- ============================================
INSERT INTO public.marketplace_items (id, seller_id, title, description, category, price, currency, condition, images, location, contact, is_negotiable, status, is_featured, views_count)
VALUES 
  ('44444444-0004-0004-0004-000000000001', admin_id, 'iPhone 14 Pro Max - 256GB', 'Like new iPhone 14 Pro Max. Original box and accessories. No scratches.', 'electronics', 2800.00, 'AED', 'like_new', ARRAY['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Business Bay"}', '{"phone": "+971508901234", "whatsapp": "+971508901234"}', true, 'approved', true, 1234),
  ('44444444-0004-0004-0004-000000000002', admin_id, 'African Ankara Fabric - 6 yards', 'Beautiful authentic Ankara print fabric from Nigeria. Perfect for dresses.', 'clothing', 150.00, 'AED', 'new', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'], '{"city": "Sharjah", "country": "UAE", "address": "Industrial Area"}', '{"phone": "+971509012345", "whatsapp": "+971509012345"}', true, 'approved', false, 567),
  ('44444444-0004-0004-0004-000000000003', admin_id, 'Toyota Camry 2019 - Low Mileage', 'Well maintained Camry. 45,000 km only. Full service history. GCC specs.', 'vehicles', 55000.00, 'AED', 'good', ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Al Quoz"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', true, 'approved', true, 2345),
  ('44444444-0004-0004-0004-000000000004', admin_id, 'African Djembe Drum', 'Handmade African drum from Ghana. Great sound quality. 14 inch.', 'other', 450.00, 'AED', 'new', ARRAY['https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Jumeirah"}', '{"phone": "+971501234500", "whatsapp": "+971501234500"}', false, 'approved', false, 234),
  ('44444444-0004-0004-0004-000000000005', admin_id, 'IKEA Sofa Set - 3+2 Seater', 'Moving sale! IKEA sofa set in excellent condition. 2 years old.', 'furniture', 1200.00, 'AED', 'good', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Marina"}', '{"phone": "+971508901234", "whatsapp": "+971508901234"}', true, 'approved', false, 567),
  ('44444444-0004-0004-0004-000000000006', admin_id, 'MacBook Air M2 2023', 'Brand new MacBook Air M2. Sealed box. Bought but never used.', 'electronics', 4200.00, 'AED', 'new', ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'], '{"city": "Abu Dhabi", "country": "UAE", "address": "Al Reem Island"}', '{"phone": "+971509012345", "whatsapp": "+971509012345"}', false, 'approved', true, 890),
  ('44444444-0004-0004-0004-000000000007', admin_id, 'Gym Equipment Set', 'Complete home gym set - Dumbbells, bench, barbell, weights. Must go!', 'home', 2500.00, 'AED', 'good', ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'], '{"city": "Dubai", "country": "UAE", "address": "JVC"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', true, 'approved', false, 345),
  ('44444444-0004-0004-0004-000000000008', admin_id, 'African Art Paintings - Set of 3', 'Beautiful hand-painted African art. Framed. Perfect for home decor.', 'home', 800.00, 'AED', 'new', ARRAY['https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800'], '{"city": "Sharjah", "country": "UAE", "address": "Al Majaz"}', '{"phone": "+971501234500", "whatsapp": "+971501234500"}', true, 'approved', false, 234),
  ('44444444-0004-0004-0004-000000000009', admin_id, 'PlayStation 5 + 3 Games', 'PS5 with controller and 3 games (FIFA, GTA, COD). Perfect condition.', 'electronics', 1800.00, 'AED', 'like_new', ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'], '{"city": "Dubai", "country": "UAE", "address": "Silicon Oasis"}', '{"phone": "+971508901234", "whatsapp": "+971508901234"}', true, 'approved', true, 678),
  ('44444444-0004-0004-0004-000000000010', admin_id, 'Professional Sewing Services', 'African and Western style tailoring. Wedding dresses, suits, alterations.', 'services', 0.00, 'AED', 'new', ARRAY['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'], '{"city": "Dubai", "country": "UAE", "address": "International City"}', '{"phone": "+971509012345", "whatsapp": "+971509012345"}', true, 'approved', false, 456)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- DEMO DONATIONS (10 donation campaigns)
-- ============================================
INSERT INTO public.donations (id, organizer_id, title, description, goal_amount, raised_amount, currency, images, status, expires_at)
VALUES 
  ('55555555-0005-0005-0005-000000000001', admin_id, 'Medical Fund for Baby Sarah', 'Baby Sarah needs urgent heart surgery. Help us raise funds for her treatment.', 50000.00, 32450.00, 'AED', ARRAY['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'], 'active', '2026-03-01 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000002', admin_id, 'African School Supplies Drive', 'Collecting funds to send school supplies to underprivileged schools in Uganda.', 15000.00, 8900.00, 'AED', ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'], 'active', '2026-04-15 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000003', admin_id, 'Community Kitchen for Ramadan', 'Providing free iftar meals to workers and those in need during Ramadan.', 20000.00, 20000.00, 'AED', ARRAY['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800'], 'completed', '2026-04-01 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000004', admin_id, 'Orphanage Support Fund', 'Monthly support for orphanage in Kenya - food, education, and healthcare.', 30000.00, 12300.00, 'AED', ARRAY['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'], 'active', '2026-12-31 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000005', admin_id, 'Funeral Repatriation Fund', 'Help send the body of our late brother Emmanuel back to Nigeria.', 25000.00, 25000.00, 'AED', ARRAY['https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800'], 'completed', '2026-01-30 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000006', admin_id, 'Clean Water Project - Tanzania', 'Building a well in rural Tanzania village to provide clean drinking water.', 45000.00, 28750.00, 'AED', ARRAY['https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800'], 'active', '2026-06-30 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000007', admin_id, 'Student Scholarship Fund', 'Providing scholarships for African students in UAE universities.', 100000.00, 45600.00, 'AED', ARRAY['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'], 'active', '2026-08-31 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000008', admin_id, 'Community Emergency Fund', 'Emergency fund for Africans facing sudden hardship in UAE.', 50000.00, 38200.00, 'AED', ARRAY['https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800'], 'active', '2026-12-31 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000009', admin_id, 'Women Empowerment Project', 'Vocational training for African women - sewing, beauty, cooking skills.', 35000.00, 15400.00, 'AED', ARRAY['https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800'], 'active', '2026-09-30 00:00:00+04'),
  ('55555555-0005-0005-0005-000000000010', admin_id, 'Sports Equipment for Youth', 'Buying football and basketball equipment for African youth center.', 8000.00, 6200.00, 'AED', ARRAY['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'], 'active', '2026-02-28 00:00:00+04')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- DEMO LOST ITEMS (10 items)
-- ============================================
INSERT INTO public.lost_items (id, reporter_id, type, title, description, category, images, location, contact, date_lost_found, reward, status)
VALUES 
  ('66666666-0006-0006-0006-000000000001', admin_id, 'lost', 'Lost Passport - Nigerian', 'Lost Nigerian passport near Al Karama. Name: John Doe. Please contact if found.', 'documents', ARRAY['https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=800'], '{"city": "Dubai", "address": "Al Karama"}', '{"phone": "+971508901234", "whatsapp": "+971508901234"}', '2026-01-15', 500.00, 'open'),
  ('66666666-0006-0006-0006-000000000002', admin_id, 'found', 'Found iPhone 13', 'Found black iPhone 13 in Dubai Metro. Please describe to claim.', 'electronics', ARRAY['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'], '{"city": "Dubai", "address": "Burjuman Metro Station"}', '{"phone": "+971509012345", "whatsapp": "+971509012345"}', '2026-01-18', NULL, 'open'),
  ('66666666-0006-0006-0006-000000000003', admin_id, 'lost', 'Lost Wedding Ring', 'Gold wedding ring with inscription. Lost at Dubai Mall. Sentimental value!', 'jewelry', ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'], '{"city": "Dubai", "address": "Dubai Mall"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', '2026-01-10', 1000.00, 'open'),
  ('66666666-0006-0006-0006-000000000004', admin_id, 'found', 'Found Wallet with Cash', 'Found brown leather wallet with cash and cards. Al Nahda Sharjah.', 'wallet', ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'], '{"city": "Sharjah", "address": "Al Nahda"}', '{"phone": "+971501234500", "whatsapp": "+971501234500"}', '2026-01-17', NULL, 'open'),
  ('66666666-0006-0006-0006-000000000005', admin_id, 'lost', 'Lost Laptop Bag', 'Black laptop bag with MacBook and documents. Lost in taxi from Airport.', 'electronics', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'], '{"city": "Dubai", "address": "DXB Airport"}', '{"phone": "+971508901234", "whatsapp": "+971508901234"}', '2026-01-12', 1500.00, 'open'),
  ('66666666-0006-0006-0006-000000000006', admin_id, 'found', 'Found Set of Keys', 'Car keys with Toyota remote and house keys. Found at Deira City Centre.', 'keys', ARRAY['https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800'], '{"city": "Dubai", "address": "Deira City Centre"}', '{"phone": "+971509012345", "whatsapp": "+971509012345"}', '2026-01-16', NULL, 'open'),
  ('66666666-0006-0006-0006-000000000007', admin_id, 'lost', 'Lost Gold Chain', 'Gold necklace chain, lost near Abu Hail metro station.', 'jewelry', ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], '{"city": "Dubai", "address": "Abu Hail"}', '{"phone": "+971500123456", "whatsapp": "+971500123456"}', '2026-01-14', 800.00, 'open'),
  ('66666666-0006-0006-0006-000000000008', admin_id, 'found', 'Found Emirates ID', 'Found Emirates ID card. Owner please contact with details to verify.', 'documents', ARRAY['https://images.unsplash.com/photo-1559526324-593bc073d938?w=800'], '{"city": "Abu Dhabi", "address": "Khalidiya"}', '{"phone": "+971501234500", "whatsapp": "+971501234500"}', '2026-01-19', NULL, 'open'),
  ('66666666-0006-0006-0006-000000000009', admin_id, 'lost', 'Lost Camera - Canon', 'Canon DSLR camera in black case. Lost at Kite Beach. Photos are precious!', 'electronics', ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'], '{"city": "Dubai", "address": "Kite Beach"}', '{"phone": "+971508901234", "whatsapp": "+971508901234"}', '2026-01-11', 2000.00, 'open'),
  ('66666666-0006-0006-0006-000000000010', admin_id, 'lost', 'Lost Bag - African Kitenge Design', 'Colorful African fabric handbag. Lost at Global Village.', 'bags', ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'], '{"city": "Dubai", "address": "Global Village"}', '{"phone": "+971509012345", "whatsapp": "+971509012345"}', '2026-01-08', 200.00, 'resolved')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- DEMO NOTIFICATIONS (for admin)
-- ============================================
INSERT INTO public.notifications (id, user_id, message, type, is_read, link)
VALUES 
  ('77777777-0007-0007-0007-000000000001', admin_id, 'Welcome to CashLink Admin! Your dashboard is ready.', 'info', false, '/admin'),
  ('77777777-0007-0007-0007-000000000002', admin_id, '10 new demo businesses have been added.', 'success', false, '/businesses'),
  ('77777777-0007-0007-0007-000000000003', admin_id, '10 new demo events have been created.', 'success', false, '/events'),
  ('77777777-0007-0007-0007-000000000004', admin_id, '10 new demo marketplace items are live.', 'success', false, '/marketplace'),
  ('77777777-0007-0007-0007-000000000005', admin_id, 'Demo data seeded successfully!', 'success', false, '/admin')
ON CONFLICT (id) DO NOTHING;

END $$;


-- ============================================
-- DEMO EMERGENCY SERVICES (no FK required)
-- ============================================
INSERT INTO public.emergency_services (id, name, category, phone, description, location, is_active)
VALUES 
  ('88888888-0008-0008-0008-000000000001', 'UAE Emergency', 'emergency', '999', 'Police, Ambulance, Fire - 24/7 Emergency Services', '{"country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000002', 'Dubai Police', 'police', '901', 'Dubai Police non-emergency helpline', '{"city": "Dubai", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000003', 'Abu Dhabi Police', 'police', '800 2626', 'Abu Dhabi Police non-emergency', '{"city": "Abu Dhabi", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000004', 'Nigerian Embassy UAE', 'embassy', '+971 4 262 7733', 'Embassy of Nigeria in the UAE. Consular services.', '{"city": "Abu Dhabi", "address": "Al Hosn Area", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000005', 'Ugandan Embassy UAE', 'embassy', '+971 2 639 0088', 'Embassy of Uganda in Abu Dhabi', '{"city": "Abu Dhabi", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000006', 'Kenya Embassy UAE', 'embassy', '+971 2 666 5588', 'Embassy of Kenya in Abu Dhabi', '{"city": "Abu Dhabi", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000007', 'Rashid Hospital', 'hospital', '+971 4 219 2000', '24/7 Emergency Hospital - Dubai', '{"city": "Dubai", "address": "Oud Metha", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000008', 'DHA Health Authority', 'health', '800 342', 'Dubai Health Authority helpline', '{"city": "Dubai", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000009', 'African Community Support', 'community', '+971 50 123 4567', 'African community helpline - legal advice, emergency support', '{"city": "Dubai", "country": "UAE"}', true),
  ('88888888-0008-0008-0008-000000000010', 'Immigration Services', 'government', '800 5111', 'GDRFA - Visa and immigration inquiries', '{"country": "UAE"}', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- SUMMARY
-- ============================================
-- All demo content uses YOUR existing admin account as the owner.
-- Demo Data Created (10 each):
-- - Businesses
-- - Jobs  
-- - Events
-- - Marketplace Items
-- - Donations
-- - Lost Items
-- - Emergency Services
-- - Notifications (5 for admin)

SELECT 'Demo data seeded successfully!' AS status;
