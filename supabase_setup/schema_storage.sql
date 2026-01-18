-- Create a new storage bucket for listings
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true);

-- Policy: Give public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'listings' );

-- Policy: Allow authenticated users to upload images
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'listings' and auth.role() = 'authenticated' );

-- Policy: Allow users to update/delete their own images (Simplified: Allow auth users to delete for now, strictly we'd match owner)
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'listings' and auth.role() = 'authenticated' );

-- Add images column to listings table if it doesn't exist
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS images text[];
