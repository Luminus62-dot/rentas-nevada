-- Drop existing policies if any to avoid conflicts
drop policy if exists "Admins can do everything" on public.service_requests;

-- Allow Admins to View, Insert, Update, and Delete service_requests
create policy "Admins can do everything"
  on public.service_requests
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
