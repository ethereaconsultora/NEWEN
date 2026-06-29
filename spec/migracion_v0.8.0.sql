-- ============================================================
-- NEWEN — Migración v0.8.0: Agenda profesional del counselor
-- Bloques múltiples por día + bloqueos manuales
-- Ejecutar en: SQL Editor de Supabase
-- Fecha: 2026-06-28
-- ============================================================

-- 1. Eliminar constraint UNIQUE para permitir múltiples bloques por día
ALTER TABLE disponibilidad DROP CONSTRAINT IF EXISTS disponibilidad_counselor_id_dia_semana_key;

-- 2. Tabla de bloqueos (vacaciones, eventos externos, etc.)
CREATE TABLE IF NOT EXISTS bloqueos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID REFERENCES counselors(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloqueos_counselor_fecha ON bloqueos(counselor_id, fecha);

ALTER TABLE bloqueos ENABLE ROW LEVEL SECURITY;

-- Solo el counselor ve/edita sus bloqueos
CREATE POLICY "Counselor gestiona sus bloqueos"
  ON bloqueos FOR ALL
  USING (auth.uid() = counselor_id);

-- 3. Función para calcular slots disponibles
-- Dado un counselor y una fecha, devuelve los horarios libres
CREATE OR REPLACE FUNCTION get_available_slots(
  p_counselor_id UUID,
  p_fecha DATE
)
RETURNS TABLE (hora TIME) AS $$
DECLARE
  dia INT;
BEGIN
  dia := EXTRACT(DOW FROM p_fecha); -- 0=dom, 1=lun, ...

  RETURN QUERY
  WITH RECURSIVE slots AS (
    -- Generar todos los slots de 1 hora dentro de los bloques de disponibilidad
    SELECT
      d.hora_inicio AS hora
    FROM disponibilidad d
    WHERE d.counselor_id = p_counselor_id
      AND d.dia_semana = dia

    UNION ALL

    SELECT
      (s.hora + INTERVAL '1 hour')::TIME AS hora
    FROM slots s
    JOIN disponibilidad d ON d.counselor_id = p_counselor_id AND d.dia_semana = dia
    WHERE (s.hora + INTERVAL '1 hour')::TIME < d.hora_fin
  )
  SELECT s.hora
  FROM slots s
  WHERE s.hora NOT IN (
    -- Excluir sesiones ya reservadas
    SELECT (ses.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::TIME
    FROM sesiones ses
    WHERE ses.counselor_id = p_counselor_id
      AND ses.fecha_hora::DATE = p_fecha
      AND ses.estado IN ('reservada', 'confirmada', 'en_curso')
  )
  AND s.hora NOT IN (
    -- Excluir bloqueos manuales
    SELECT b.hora_inicio
    FROM bloqueos b
    WHERE b.counselor_id = p_counselor_id
      AND b.fecha = p_fecha
  )
  ORDER BY s.hora;
END;
$$ LANGUAGE plpgsql;
