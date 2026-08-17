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

-- 3. IMPORTANTE — Cuenta dual (admin + profesional):
--    Si tu cuenta es counselor y querés que además sea admin, ejecutá:
--    UPDATE public.users SET es_admin = true WHERE email = 'TU_EMAIL@example.com';
--    (reemplazá por el email real de tu cuenta profesional)
--
--    Si tu cuenta es admin (rol='admin') y además tenés perfil de counselor,
--    ya queda cubierta por el paso 2 + la existencia de su fila en public.counselors.
