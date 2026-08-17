-- ============================================================
-- NEWEN — v0.22.0 — Módulo "Mi consultorio" (Anima)
-- Tablas clínicas privadas del counselor.
-- user_id = auth.uid() del counselor (consistente con users/counselors).
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

-- ── Función de updated_at (idempotente) ──
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── 1. pacientes ──
CREATE TABLE IF NOT EXISTS public.pacientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  telefono        TEXT,
  email           TEXT,
  dni             TEXT,
  fecha_nacimiento DATE,
  modalidad       TEXT CHECK (modalidad IN ('virtual','presencial')),
  obra_social     TEXT,
  estado_animo    TEXT DEFAULT 'Estable',
  motivo_consulta TEXT,
  notas           TEXT,
  notas_iniciales TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pacientes_user   ON public.pacientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON public.pacientes(nombre);
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Propietario pacientes" ON public.pacientes;
CREATE POLICY "Propietario pacientes" ON public.pacientes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS pacientes_updated_at ON public.pacientes;
CREATE TRIGGER pacientes_updated_at BEFORE UPDATE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. entradas (historia clínica) ──
CREATE TABLE IF NOT EXISTS public.entradas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  estado_animo    TEXT,
  tipo_sesion     TEXT,
  motivo_consulta TEXT,
  estado_actual   TEXT,
  tareas          TEXT,
  topics          JSONB NOT NULL DEFAULT '[]'::jsonb,
  texto           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entradas_paciente ON public.entradas(paciente_id);
ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Propietario entradas" ON public.entradas;
CREATE POLICY "Propietario entradas" ON public.entradas
  USING (
    EXISTS (SELECT 1 FROM public.pacientes p WHERE p.id = entradas.paciente_id AND p.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.pacientes p WHERE p.id = entradas.paciente_id AND p.user_id = auth.uid())
  );

-- ── 3. turnos (agenda clínica del consultorio) ──
CREATE TABLE IF NOT EXISTS public.turnos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id   UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  fecha         DATE NOT NULL,
  hora          TIME NOT NULL,
  duracion      INTEGER DEFAULT 50,
  modalidad     TEXT CHECK (modalidad IN ('presencial','online','mixto')),
  tipo          TEXT NOT NULL DEFAULT 'Sesión individual',
  estado        TEXT NOT NULL DEFAULT 'confirmado' CHECK (estado IN ('confirmado','realizado','cancelado','ausente')),
  patient_name  TEXT,
  patient_phone TEXT,
  notas         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_turnos_user  ON public.turnos(user_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON public.turnos(fecha);
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Propietario turnos" ON public.turnos;
CREATE POLICY "Propietario turnos" ON public.turnos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS turnos_updated_at ON public.turnos;
CREATE TRIGGER turnos_updated_at BEFORE UPDATE ON public.turnos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. pagos (cobros del consultorio) ──
CREATE TABLE IF NOT EXISTS public.pagos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  monto       NUMERIC(12,2) NOT NULL,
  fecha       DATE NOT NULL,
  fecha_pago  DATE,
  estado      TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado')),
  descripcion TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pagos_user   ON public.pagos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON public.pagos(estado);
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Propietario pagos" ON public.pagos;
CREATE POLICY "Propietario pagos" ON public.pagos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS pagos_updated_at ON public.pagos;
CREATE TRIGGER pagos_updated_at BEFORE UPDATE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
