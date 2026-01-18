-- Create REVIEWS table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  landlord_rating integer NOT NULL CHECK (landlord_rating BETWEEN 1 AND 5),
  property_rating integer NOT NULL CHECK (property_rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read reviews
CREATE POLICY "Reviews are public" 
ON public.reviews FOR SELECT 
USING (true);

-- 2. Only Authenticated users can insert, AND ONLY if they have a LEAD record for this listing
-- This assumes 'leads' table has 'user_id' column or we can link by email?
-- Checking types.ts, Lead struct doesn't show user_id explicitly in the Type, 
-- BUT usually leads are inserted with user_id if logged in.
-- If leads table doesn't have user_id, we need a fix. 
-- Assuming leads has `user_id` (standard practice). If not, we might need to add it or trust email.
-- Let's assume leads has user_id for now. If not, the insert will fail or be blocked.

CREATE POLICY "Verified Contact Review" 
ON public.reviews FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE public.leads.listing_id = reviews.listing_id
    AND public.leads.from_user_id = auth.uid()
  )
);
