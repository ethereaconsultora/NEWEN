-- ============================================================
-- NEWEN — v0.36.0 — Fix: recursión infinita en RLS de organization_members
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente.
--
-- NO desactiva RLS. Corrige la política `members_read_own`, que se
-- referenciaba a sí misma dentro de su propia cláusula SELECT, lo que
-- producía "infinite recursion detected in policy for relation
-- organization_members" (ej. al dar de alta un cliente desde /empresa).
-- ============================================================

-- Antes:
--   FOR SELECT USING (user_id = auth.uid() OR EXISTS (
--     SELECT 1 FROM organization_members me
--     WHERE me.organization_id = organization_members.organization_id
--       AND me.user_id = auth.uid()
--   ));
-- La subconsulta lee organization_members dentro de la política de
-- organization_members → recursión infinita.
DROP POLICY IF EXISTS "members_read_own" ON public.organization_members;

CREATE POLICY "members_read_own" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Nota: las políticas de organizations / organization_clients / _employees /
-- _tasks / _derivaciones / _mensajes siguen usando subconsultas a
-- organization_members, pero ya no son recursivas porque la política de
-- members ahora solo filtra por `user_id = auth.uid()`.
