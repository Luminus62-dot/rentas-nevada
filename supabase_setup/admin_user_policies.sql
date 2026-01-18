-- Allow admins to see ALL profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Allow admins to update anyone's profile (e.g. to set is_verified)
create policy "Admins can update any profile"
  on profiles for update
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );
