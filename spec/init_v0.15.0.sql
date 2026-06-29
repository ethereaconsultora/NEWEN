-- ============================================================
-- NEWEN — Migración v0.15.0
-- Agrega: publicaciones, derivaciones
-- Ejecutar en: SQL Editor de Supabase
-- ============================================================

-- 1. PUBLICACIONES (posts del counselor)
CREATE TABLE IF NOT EXISTS publicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para publicaciones
ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;

-- Counselors pueden leer sus propias publicaciones
CREATE POLICY "counselors_own_publicaciones"
  ON publicaciones FOR SELECT
  USING (counselor_id = auth.uid());

-- Counselors pueden crear publicaciones
CREATE POLICY "counselors_insert_publicaciones"
  ON publicaciones FOR INSERT
  WITH CHECK (counselor_id = auth.uid());

-- Counselors pueden eliminar sus publicaciones
CREATE POLICY "counselors_delete_publicaciones"
  ON publicaciones FOR DELETE
  USING (counselor_id = auth.uid());

-- Consultantes pueden ver publicaciones de counselors activos
CREATE POLICY "public_read_publicaciones"
  ON publicaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.id = publicaciones.counselor_id
      AND counselors.estado = 'activo'
    )
  );


-- 2. DERIVACIONES (referencia de consultantes entre counselors)
CREATE TABLE IF NOT EXISTS derivaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  counselor_origen_id UUID NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  counselor_destino_id UUID REFERENCES counselors(id) ON DELETE SET NULL,
  motivo TEXT,
  estado TEXT CHECK (estado IN ('pendiente','aceptada','rechazada')) DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para derivaciones
ALTER TABLE derivaciones ENABLE ROW LEVEL SECURITY;

-- Counselors pueden ver derivaciones donde participan
CREATE POLICY "counselors_own_derivaciones"
  ON derivaciones FOR SELECT
  USING (
    counselor_origen_id = auth.uid()
    OR counselor_destino_id = auth.uid()
  );

-- Counselors pueden crear derivaciones
CREATE POLICY "counselors_insert_derivaciones"
  ON derivaciones FOR INSERT
  WITH CHECK (counselor_origen_id = auth.uid());

-- Counselors pueden actualizar derivaciones (aceptar/rechazar)
CREATE POLICY "counselors_update_derivaciones"
  ON derivaciones FOR UPDATE
  USING (counselor_destino_id = auth.uid());


-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_publicaciones_counselor ON publicaciones(counselor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_derivaciones_origen ON derivaciones(counselor_origen_id);
CREATE INDEX IF NOT EXISTS idx_derivaciones_destino ON derivaciones(counselor_destino_id);
CREATE INDEX IF NOT EXISTS idx_derivaciones_estado ON derivaciones(estado);
