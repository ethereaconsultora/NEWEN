-- ============================================================
-- NEWEN — v0.24.0 — Selector de rol (admin / profesional)
-- Permite que una misma cuenta sea admin y counselor.
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

-- 1. Flag de capacidad admin, independiente del rol primario.
--    rol sigue indicando la identidad primaria (consultante/counselor/admin).
--    es_admin = true permite acceder al panel /admin aunque rol no sea 'admin'.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS es_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill: los admins existentes conservan su acceso admin.
UPDATE public.users
SET es_admin = true
WHERE rol = 'admin';

-- 3. CUENTA ÚNICA (profesional + admin) — ejecutá esto con TU email real:
--    Te deja como counselor (identidad profesional) con capacidad admin.
UPDATE public.users
SET rol = 'counselor', es_admin = true
WHERE email = 'TU_EMAIL@example.com';

-- 4. SEGURIDAD — Admin solo manual: el registro público NUNCA crea admin.
--    El trigger de alta queda limitado a 'consultante' o 'counselor'.
--    El rol 'admin' y la marca es_admin solo se asignan desde este SQL Editor.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, rol, es_admin, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.email),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'rol' = 'counselor' THEN 'counselor'
      ELSE 'consultante'
    END,
    false,
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 5. Política RLS de postulaciones: respeta es_admin (no solo rol='admin').
DROP POLICY IF EXISTS "Admin lee postulaciones" ON public.postulaciones;
CREATE POLICY "Admin lee postulaciones" ON public.postulaciones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (es_admin = true OR rol = 'admin')
  ));
