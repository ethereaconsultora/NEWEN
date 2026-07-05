-- ============================================================
-- NEWEN — Migración v0.16.0
-- Agrega: foto_url a counselors, video_url a publicaciones
--         Storage buckets: counselors, publicaciones
-- Ejecutar en: SQL Editor de Supabase
-- ============================================================

-- 1. Agregar foto_url a counselors
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Agregar video_url a publicaciones
ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Storage buckets (ejecutar en Storage → New Bucket o por SQL)
-- Bucket: counselors (para fotos de perfil)
-- Bucket: publicaciones (para videos)

-- Si tu Supabase permite SQL para storage:
-- SELECT storage.create_bucket('counselors', '{"public": true}');
-- SELECT storage.create_bucket('publicaciones', '{"public": true, "file_size_limit": 104857600}');

-- 4. RLS para storage: counselors bucket
-- (si no se ejecuta por SQL, configurar manualmente en Supabase Storage UI)
/*
CREATE POLICY "Counselors pueden subir su foto"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'counselors' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Fotos públicas de counselors"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'counselors');

CREATE POLICY "Counselors pueden actualizar su foto"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'counselors' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS para storage: publicaciones bucket
CREATE POLICY "Counselors pueden subir videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'publicaciones' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Videos públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'publicaciones');
*/
