-- Add location fields to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Optional: Add a column for privacy radius if we want it to be configurable
-- ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS privacy_radius INTEGER DEFAULT 250;
