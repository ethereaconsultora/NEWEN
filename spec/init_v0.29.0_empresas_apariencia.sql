-- ============================================================
-- NEWEN — v0.29.0 — Apariencia del espacio (logo / banner)
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente.
-- ============================================================

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cover_gradient TEXT;
