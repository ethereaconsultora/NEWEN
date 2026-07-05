-- ============================================================
-- NEWEN — Fix v0.15.2
-- Agrega políticas RLS para la tabla users
-- Sin estas políticas, NADIE puede leer users.rol
-- ============================================================

-- 1. Usuarios pueden leer su propia fila
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- 2. Lectura básica para usuarios autenticados (nombre, rol)
-- Necesario para: middleware, login redirect, counselor cards
CREATE POLICY "Authenticated users can read basic info"
  ON users FOR SELECT
  USING (auth.uid() IS NOT NULL);
