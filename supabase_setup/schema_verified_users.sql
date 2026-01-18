-- Add is_verified column to profiles if it doesn't exist
alter table public.profiles 
add column if not exists is_verified boolean default false;

-- Add policy or ensure logic uses it
-- (Profiles are usually public or readable by owner, writeable by owner?)
-- Just adding the column is enough for now if we use supabase service role or admin logic to update it.

-- Let's ensure admin can update this column.
-- The previous 'admin_policy_update.sql' covered service_requests. 
-- You might need to check if profiles RLS allows update.
