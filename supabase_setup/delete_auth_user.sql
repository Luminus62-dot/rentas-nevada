-- Cuando borras usuarios de la tabla 'profiles', NO se borran de la autenticación de Supabase (auth.users).
-- Este script borra al usuario de la tabla de autenticación para que puedas registrarte de nuevo.

DELETE FROM auth.users 
WHERE email = 'lzaldivar157@gmail.com';

-- Ejecuta esto y luego intenta registrarte nuevamente en la web.
