-- ============================================================
-- NEWEN — v0.44.0 — Sistema de plantillas comerciales
-- Página pública configurable por empresa (TenantSiteConfig).
-- PLANTILLA_COMERCIAL_EMPRESA_STANDARD.md
-- Ejecutar en Supabase → SQL Editor. Idempotente.
-- NO toca RLS: la lectura pública activa ya existe
-- (organizations_public_read) y el UPDATE de miembros ya existe
-- (organizations_member_update). Solo agregamos la columna JSONB.
-- ============================================================

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS site_config JSONB;
