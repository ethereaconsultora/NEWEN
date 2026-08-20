-- ============================================================
-- NEWEN — v0.37.0 — Campus digital (cursos, módulos, inscripciones,
-- progreso, certificados y encuentros con videollamada)
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente. NO desactiva RLS: crea tablas con RLS y policies
-- basadas en membresía (patrón seguro ya usado en organization_*).
-- ============================================================

-- ── Cursos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campus_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  color TEXT DEFAULT '#5a8a62',
  icono TEXT DEFAULT '🎓',
  duracion_hs INT DEFAULT 0,
  publicado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Módulos de un curso ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campus_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  orden INT DEFAULT 1,
  duracion_min INT DEFAULT 0,
  contenido TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Inscripciones (personas de la organización) ─────────────
CREATE TABLE IF NOT EXISTS public.campus_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.organization_clients(id) ON DELETE SET NULL,
  persona TEXT NOT NULL,
  estado TEXT CHECK (estado IN ('activa','pausada','completada')) DEFAULT 'activa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Progreso por módulo ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campus_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.campus_enrollments(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.campus_modules(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, module_id)
);

-- ── Certificados ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campus_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.campus_enrollments(id) ON DELETE CASCADE,
  codigo TEXT UNIQUE,
  emitido_el TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Encuentros / sesiones con sala de video ─────────────────
-- room_type: 'jitsi' (salas grupales del campus) | 'daily' (1-1 profesional)
CREATE TABLE IF NOT EXISTS public.campus_encuentros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.organization_clients(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('taller','encuentro','sesion','practica')) DEFAULT 'encuentro',
  room_type TEXT CHECK (room_type IN ('jitsi','daily')) DEFAULT 'jitsi',
  room_slug TEXT NOT NULL,
  fecha TEXT,
  hora TEXT,
  duracion_min INT DEFAULT 60,
  descripcion TEXT,
  estado TEXT CHECK (estado IN ('programado','en_vivo','finalizado','cancelado')) DEFAULT 'programado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (patrón seguro: solo miembros de la organización)
-- ============================================================
ALTER TABLE public.campus_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_encuentros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campus_courses_member_all" ON public.campus_courses;
CREATE POLICY "campus_courses_member_all" ON public.campus_courses
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = campus_courses.organization_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "campus_modules_member_all" ON public.campus_modules;
CREATE POLICY "campus_modules_member_all" ON public.campus_modules
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.campus_courses c
    JOIN public.organization_members m ON m.organization_id = c.organization_id
    WHERE c.id = campus_modules.course_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "campus_enrollments_member_all" ON public.campus_enrollments;
CREATE POLICY "campus_enrollments_member_all" ON public.campus_enrollments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = campus_enrollments.organization_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "campus_progress_member_all" ON public.campus_progress;
CREATE POLICY "campus_progress_member_all" ON public.campus_progress
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.campus_enrollments e
    JOIN public.organization_members m ON m.organization_id = e.organization_id
    WHERE e.id = campus_progress.enrollment_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "campus_certificates_member_all" ON public.campus_certificates;
CREATE POLICY "campus_certificates_member_all" ON public.campus_certificates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.campus_enrollments e
    JOIN public.organization_members m ON m.organization_id = e.organization_id
    WHERE e.id = campus_certificates.enrollment_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "campus_encuentros_member_all" ON public.campus_encuentros;
CREATE POLICY "campus_encuentros_member_all" ON public.campus_encuentros
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = campus_encuentros.organization_id AND m.user_id = auth.uid()
  ));
