-- ============================================================
-- NEWEN — Fix v0.15.3
-- Trigger para auto-poblar public.users cuando auth.users recibe un nuevo registro.
-- Sin esto, ningún login (email, Google, Magic Link) puede leer el rol.
-- ============================================================

-- 1. Función que copia el nuevo usuario de auth.users a public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, rol, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'rol', 'consultante'),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 2. Trigger que ejecuta la función en cada INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Si ya hay usuarios en auth.users sin fila en public.users, populalos ahora
INSERT INTO public.users (id, email, nombre, rol, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'nombre', au.email),
  COALESCE(au.raw_user_meta_data ->> 'rol', 'consultante'),
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- 4. Si este usuario debe ser counselor, actualizalo
UPDATE public.users
SET rol = 'counselor'
WHERE email = 'TU_EMAIL_DE_COUNSELOR@example.com';
-- ↑ Reemplazá con tu email real de counselor ↑
