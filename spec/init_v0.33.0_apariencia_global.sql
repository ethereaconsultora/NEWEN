-- ============================================================
-- NEWEN — v0.33.0 — Apariencia global + fix de persistencia
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente.
-- ============================================================

-- 1. Los usuarios pueden actualizar su propia fila (arregla que
--    "Guardar cambios" de apariencia no persistía: no había policy de UPDATE).
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Seguridad: nadie puede cambiarse su rol ni es_admin por UPDATE.
CREATE OR REPLACE FUNCTION public.users_lock_rol()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.rol := OLD.rol;
  NEW.es_admin := OLD.es_admin;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_lock_rol_trigger ON public.users;
CREATE TRIGGER users_lock_rol_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.users_lock_rol();
