-- Add amenities column to listings table if it doesn't exist
-- Using jsonb for flexibility and easy querying
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '{}'::jsonb;

-- Example of how to query:
-- SELECT * FROM listings WHERE amenities->>'pet_friendly' = 'true';
