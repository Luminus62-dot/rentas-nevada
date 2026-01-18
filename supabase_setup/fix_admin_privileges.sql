-- ==========================================
-- FIX ADMIN PRIVILEGES
-- Otorgar permisos totales a administradores
-- ==========================================

-- 1. Asegurar que la función is_admin() existe y es robusta
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. LISTINGS: Políticas para Administradores
-- Borramos políticas previas de admin si existen para evitar duplicados
DROP POLICY IF EXISTS "Admins can do everything on listings" ON public.listings;

CREATE POLICY "Admins can do everything on listings"
ON public.listings
FOR ALL
TO authenticated
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- 3. REPORTS: Políticas para Administradores
DROP POLICY IF EXISTS "Admins can view and manage reports" ON public.reports;

CREATE POLICY "Admins can view and manage reports"
ON public.reports
FOR ALL
TO authenticated
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- 4. SERVICE_REQUESTS: Reforzar políticas
DROP POLICY IF EXISTS "Admins can do everything" ON public.service_requests;

CREATE POLICY "Admins can do everything on service_requests"
ON public.service_requests
FOR ALL
TO authenticated
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- 5. AUDIT_LOGS: Asegurar que se pueden ver
DROP POLICY IF EXISTS "Admins can see logs" ON public.audit_logs;

CREATE POLICY "Admins can see logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING ( is_admin() );
