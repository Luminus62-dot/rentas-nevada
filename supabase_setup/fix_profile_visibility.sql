-- Fix profiles RLS to allow users to see each other's profiles
-- This is necessary for the profile page and the chat system to show names.

-- 1. Permite que CUALQUIER usuario autenticado vea la información básica de otros perfiles
-- (id, full_name, role, is_verified, created_at)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Nota: Si quieres que los perfiles sean públicos incluso para no logueados, cambia 'authenticated' a 'public'
-- CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT TO public USING (true);
