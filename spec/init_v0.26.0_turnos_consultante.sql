-- ============================================================
-- NEWEN — v0.26.0 — Turnos del consultorio con consultante (plataforma)
-- Permite agendar tanto un "paciente" (clínico) como un
-- "consultante" (cliente de la plataforma newen).
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

ALTER TABLE public.turnos
  ADD COLUMN IF NOT EXISTS consultante_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
