-- ACTUALIZADO: La tabla 'profiles' no tiene email, así que buscamos el ID en 'auth.users'

UPDATE profiles
SET role = 'admin', is_verified = true
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'lzaldivar157@gmail.com'
);

-- RECUERDA: Reemplaza 'TU_EMAIL_AQUI' con tu correo real.
-- Ejemplo: WHERE email = 'juan@ejemplo.com'
