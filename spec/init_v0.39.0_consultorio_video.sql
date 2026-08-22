-- ============================================================
-- NEWEN — v0.39.0 — Videollamadas 1-1 del consultorio con Jitsi
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente. NO desactiva RLS (solo agrega una columna).
--
-- Cada profesional (espacio) puede configurar la base de Jitsi que
-- usa para sus sesiones 1-1 (por defecto meet.jit.si). Cada turno
-- genera su propia sala: newen-<id-prof>-<id-turno>.
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS jitsi_base TEXT DEFAULT 'https://meet.jit.si';
