-- Función Segura para obtener usuarios con emails
-- Solo accesible por admins (verificamos is_admin() dentro de la función o mediante RLS si fuera una vista)
-- Al ser SECURITY DEFINER corre con todos los permisos (necesario para leer auth.users)

CREATE OR REPLACE FUNCTION public.get_users_with_email()
RETURNS TABLE (
  id uuid,
  email varchar,
  full_name text,
  role text, -- 'text' porque en profiles es text/varchar
  is_verified boolean,
  created_at timestamptz
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si el usuario que llama es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN; -- Retorna vacío si no es admin
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email::varchar,     -- Casting explícito para asegurar tipo
    p.full_name,
    p.role::text,          -- Casting explícito
    p.is_verified,
    au.created_at
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;
