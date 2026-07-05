-- ============================================================
-- NEWEN — Fix v0.18.0
-- 1. Saca UNIQUE(counselor_id, dia_semana) que rompe slots múltiples
-- 2. Fix get_available_slots con DISTINCT
-- ============================================================

-- 1. Sacar UNIQUE constraint
ALTER TABLE disponibilidad DROP CONSTRAINT IF EXISTS disponibilidad_counselor_id_dia_semana_key;

-- 2. Recrear get_available_slots sin duplicados
CREATE OR REPLACE FUNCTION get_available_slots(
  p_counselor_id UUID,
  p_fecha DATE
)
RETURNS TABLE (hora TIME) AS $$
DECLARE
  dia INT;
BEGIN
  dia := EXTRACT(DOW FROM p_fecha);

  RETURN QUERY
  WITH raw_slots AS (
    SELECT DISTINCT d.hora_inicio AS hora
    FROM disponibilidad d
    WHERE d.counselor_id = p_counselor_id
      AND d.dia_semana = dia
  )
  SELECT rs.hora
  FROM raw_slots rs
  WHERE rs.hora NOT IN (
    SELECT (ses.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::TIME
    FROM sesiones ses
    WHERE ses.counselor_id = p_counselor_id
      AND ses.fecha_hora::DATE = p_fecha
      AND ses.estado IN ('reservada', 'confirmada', 'en_curso')
  )
  AND rs.hora NOT IN (
    SELECT b.hora_inicio
    FROM bloqueos b
    WHERE b.counselor_id = p_counselor_id
      AND b.fecha = p_fecha
  )
  ORDER BY rs.hora;
END;
$$ LANGUAGE plpgsql;
