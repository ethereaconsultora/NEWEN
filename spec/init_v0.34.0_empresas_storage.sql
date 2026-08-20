-- ============================================================
-- NEWEN — v0.34.0 — Empresa: slogan, tipografía/tamaño, logo/banner storage
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente.
-- ============================================================

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slogan TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS font_id TEXT NOT NULL DEFAULT 'newen';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS font_size TEXT NOT NULL DEFAULT 'mediana';

-- Bucket público para logos y banners de organizaciones.
INSERT INTO storage.buckets (id, name, public) VALUES ('organizations', 'organizations', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "organizations_bucket_public_read" ON storage.objects;
CREATE POLICY "organizations_bucket_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'organizations');

DROP POLICY IF EXISTS "organizations_bucket_insert" ON storage.objects;
CREATE POLICY "organizations_bucket_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'organizations' AND auth.uid() IS NOT NULL);
