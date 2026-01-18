-- 1. Eliminar políticas conflictivas anteriores
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- 2. Asegurar que CUALQUIER usuario pueda ver su PROPIO perfil (esto es vital para verificar logueo)
CREATE POLICY "Users can verify their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Crear una función segura para verificar si soy admin
-- "SECURITY DEFINER" significa que corre con permisos de superusuario, bypasseando RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Política para que Admin vea TODO (usando la función segura)
CREATE POLICY "Admins can see all profiles"
ON profiles FOR SELECT
USING ( is_admin() );

-- 5. Política para que Admin actualice TODO
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING ( is_admin() );
