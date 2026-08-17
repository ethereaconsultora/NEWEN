-- ============================================================
-- NEWEN — v0.25.0 — Apariencia del consultorio (temas/fuentes/tamaño)
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

-- Preferencias de apariencia del módulo "Mi consultorio" por counselor.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS theme_id   TEXT NOT NULL DEFAULT 'newen';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS font_id    TEXT NOT NULL DEFAULT 'newen';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS font_size  TEXT NOT NULL DEFAULT 'mediana';
