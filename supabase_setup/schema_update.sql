-- Create service_requests table
create table if not exists public.service_requests (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  service_type text not null check (service_type in ('verification', 'featured', 'posted_by_us')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'rejected')),
  notes text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.service_requests enable row level security;

-- Policies
create policy "Users can insert their own requests"
  on public.service_requests for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Users can view their own requests"
  on public.service_requests for select
  to authenticated
  using (auth.uid() = owner_id);

-- Note: You may need to add a policy for Admins to view/update all requests.
-- Example if you have a profiles table with role:
-- create policy "Admins can do everything"
--   on public.service_requests for all
--   prior to authenticated
--   using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
