-- ============================================================
-- NEWEN — v0.40.0 — Renombrar columna sesiones.daily_room_url → jitsi_room_url
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente. Conserva los datos (solo renombra la columna).
-- NO desactiva RLS.
-- ============================================================

DO $$
BEGIN
  -- Si todavía existe la columna vieja, la renombramos (preserva datos).
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sesiones' AND column_name = 'daily_room_url'
  ) THEN
    ALTER TABLE public.sesiones RENAME COLUMN daily_room_url TO jitsi_room_url;
  END IF;
END $$;
