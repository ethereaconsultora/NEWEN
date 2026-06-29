-- ============================================================
-- NEWEN — Migración v0.5.1
-- Solo lo NUEVO desde la última ejecución.
-- Ejecutar en: SQL Editor de Supabase
-- Fecha: 2026-06-28
-- ============================================================

-- 1. Campo mp_access_token en counselors
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS mp_access_token TEXT;

-- 2. Tabla disponibilidad
CREATE TABLE IF NOT EXISTS disponibilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID REFERENCES counselors(id) ON DELETE CASCADE,
  dia_semana INT CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(counselor_id, dia_semana)
);

-- 3. RLS para disponibilidad
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;

-- 4. Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Disponibilidad visible públicamente'
    AND tablename = 'disponibilidad'
  ) THEN
    CREATE POLICY "Disponibilidad visible públicamente"
      ON disponibilidad FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM counselors
        WHERE counselors.id = disponibilidad.counselor_id
        AND counselors.estado = 'activo'
      ));
  END IF;
END $$;

-- 5. Disponibilidad default (lun-vie 9-18)
INSERT INTO disponibilidad (counselor_id, dia_semana, hora_inicio, hora_fin)
SELECT id, dia, '09:00', '18:00'
FROM counselors, generate_series(1, 5) AS dia
ON CONFLICT (counselor_id, dia_semana) DO NOTHING;

-- 6. Índice counselors.activo
CREATE INDEX IF NOT EXISTS idx_counselors_activo ON counselors(activo);

-- 7. Función incrementar sesiones
CREATE OR REPLACE FUNCTION increment_counselor_sessions(counselor_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE counselors
  SET total_sesiones = total_sesiones + 1
  WHERE id = counselor_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Verificación
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('counselors', 'disponibilidad')
ORDER BY table_name, ordinal_position;
