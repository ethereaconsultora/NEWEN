-- ============================================================
-- NEWEN — v0.20.0 — Talleres: preview, pagos, compras
-- ============================================================

-- 1. Agregar mp_preference_id a talleres
ALTER TABLE talleres ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;
ALTER TABLE talleres ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Tabla de compras de talleres
CREATE TABLE IF NOT EXISTS compras_talleres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  taller_id UUID NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
  mp_payment_id TEXT,
  estado TEXT CHECK (estado IN ('pendiente','aprobado','rechazado')) DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consultante_id, taller_id)
);

ALTER TABLE compras_talleres ENABLE ROW LEVEL SECURITY;

-- Consultante ve sus compras
CREATE POLICY "Consultante ve sus compras"
  ON compras_talleres FOR SELECT
  USING (auth.uid() = consultante_id);

-- Consultante crea compra
CREATE POLICY "Consultante crea compra"
  ON compras_talleres FOR INSERT
  WITH CHECK (auth.uid() = consultante_id);

-- Service role actualiza (webhook)
CREATE POLICY "Service actualiza compra"
  ON compras_talleres FOR UPDATE
  USING (true);
