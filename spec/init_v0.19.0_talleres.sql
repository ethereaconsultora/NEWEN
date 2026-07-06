-- ============================================================
-- NEWEN — v0.19.0 — Talleres
-- Agrega estado, video_url y RLS a la tabla talleres
-- ============================================================

ALTER TABLE talleres ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'borrador';
ALTER TABLE talleres ADD COLUMN IF NOT EXISTS video_url TEXT;

-- RLS: lectura pública de talleres publicados
DROP POLICY IF EXISTS "Talleres publicados visibles" ON talleres;
CREATE POLICY "Talleres publicados visibles"
  ON talleres FOR SELECT
  USING (estado = 'publicado' OR auth.uid() = counselor_id);

-- RLS: counselor crea sus talleres
DROP POLICY IF EXISTS "Counselor crea taller" ON talleres;
CREATE POLICY "Counselor crea taller"
  ON talleres FOR INSERT
  WITH CHECK (auth.uid() = counselor_id);

-- RLS: counselor edita sus talleres
DROP POLICY IF EXISTS "Counselor edita taller" ON talleres;
CREATE POLICY "Counselor edita taller"
  ON talleres FOR UPDATE
  USING (auth.uid() = counselor_id);

-- RLS: counselor elimina sus talleres
DROP POLICY IF EXISTS "Counselor elimina taller" ON talleres;
CREATE POLICY "Counselor elimina taller"
  ON talleres FOR DELETE
  USING (auth.uid() = counselor_id);
