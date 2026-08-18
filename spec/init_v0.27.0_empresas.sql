-- ============================================================
-- NEWEN — v0.27.0 — Área Empresa (espacio comercial multicliente)
-- Ejecutar en Supabase → SQL Editor.
-- Idempotente: puede re-ejecutarse sin error.
-- ============================================================

-- 1. Ampliar el rol de users para incluir 'empresa'.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_rol_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_rol_check
  CHECK (rol IN ('consultante','counselor','admin','empresa'));

-- 2. ORGANIZATIONS — espacio comercial de una empresa dentro de newen.
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tagline TEXT,
  rubro TEXT,
  sede TEXT,
  empleados INT,
  contacto TEXT,
  email TEXT,
  telefono TEXT,
  servicios TEXT[] DEFAULT '{}',
  primary_color TEXT DEFAULT '#0a0806',
  accent_color  TEXT DEFAULT '#c4a87e',
  cover_color   TEXT,
  estado TEXT CHECK (estado IN ('activa','pausada','cancelada')) DEFAULT 'activa',
  campus_habilitado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATION_MEMBERS — usuarios con acceso al espacio de una organización.
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rol TEXT CHECK (rol IN ('owner','admin','member')) DEFAULT 'member',
  intervention_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 4. ORGANIZATION_CLIENTS — empresas cliente que atiende la organización.
CREATE TABLE IF NOT EXISTS public.organization_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cuit TEXT,
  rubro TEXT,
  sede TEXT,
  empleados INT,
  contacto TEXT,
  email TEXT,
  telefono TEXT,
  servicios TEXT[] DEFAULT '{}',
  estado TEXT CHECK (estado IN ('activo','pausado','cancelado')) DEFAULT 'activo',
  archivado BOOLEAN DEFAULT FALSE,
  fase INT CHECK (fase BETWEEN 1 AND 6) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORGANIZATION_EMPLOYEES — ficha personal de cada persona atendida.
CREATE TABLE IF NOT EXISTS public.organization_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.organization_clients(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  area TEXT,
  rol TEXT,
  avance INT DEFAULT 0,
  situacion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORGANIZATION_TASKS — seguimiento y anotaciones por tarea.
CREATE TABLE IF NOT EXISTS public.organization_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.organization_clients(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente','encurso','completada')) DEFAULT 'pendiente',
  anotaciones TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORGANIZATION_DERIVACIONES — derivación de una persona a un counselor de newen.
--    (Nombre distinto de `derivaciones`, que ya existe en v0.15.0 para derivaciones
--     entre counselors.)
CREATE TABLE IF NOT EXISTS public.organization_derivaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.organization_clients(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.organization_employees(id) ON DELETE SET NULL,
  persona TEXT NOT NULL,
  temas TEXT[] DEFAULT '{}',
  counselor TEXT,
  caso TEXT,
  quien_deriva TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORGANIZATION_MENSAJES — mensajería interna profesional ↔ quien deriva.
--    Limpia una tabla `mensajes` huérfana de una ejecución anterior fallida.
DROP TABLE IF EXISTS public.mensajes;

CREATE TABLE IF NOT EXISTS public.organization_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derivacion_id UUID REFERENCES public.organization_derivaciones(id) ON DELETE CASCADE,
  de TEXT CHECK (de IN ('espacio','profesional')) NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_derivaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_mensajes ENABLE ROW LEVEL SECURITY;

-- Organizaciones: lectura pública de las activas (página /e/slug).
DROP POLICY IF EXISTS "organizations_public_read" ON public.organizations;
CREATE POLICY "organizations_public_read" ON public.organizations
  FOR SELECT USING (estado = 'activa');

-- Organizaciones: miembros leen su propia organización.
DROP POLICY IF EXISTS "organizations_member_read" ON public.organizations;
CREATE POLICY "organizations_member_read" ON public.organizations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
  ));

-- Organizaciones: miembros actualizan su propia organización.
DROP POLICY IF EXISTS "organizations_member_update" ON public.organizations;
CREATE POLICY "organizations_member_update" ON public.organizations
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
  ));

-- Organizaciones: cualquier usuario autenticado puede crear su espacio (onboarding).
DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
CREATE POLICY "organizations_insert" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Members: visibles para la propia organización.
DROP POLICY IF EXISTS "members_read_own" ON public.organization_members;
CREATE POLICY "members_read_own" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organization_members me
    WHERE me.organization_id = organization_members.organization_id AND me.user_id = auth.uid()
  ));

-- Members: el usuario se vincula como miembro de su propia organización.
DROP POLICY IF EXISTS "members_insert_self" ON public.organization_members;
CREATE POLICY "members_insert_self" ON public.organization_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Clients: todo para miembros de la organización.
DROP POLICY IF EXISTS "clients_member_all" ON public.organization_clients;
CREATE POLICY "clients_member_all" ON public.organization_clients
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organization_clients.organization_id AND m.user_id = auth.uid()
  ));

-- Employees: todo para miembros de la organización del cliente.
DROP POLICY IF EXISTS "employees_member_all" ON public.organization_employees;
CREATE POLICY "employees_member_all" ON public.organization_employees
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_clients c
    JOIN public.organization_members m ON m.organization_id = c.organization_id
    WHERE c.id = organization_employees.client_id AND m.user_id = auth.uid()
  ));

-- Tasks: todo para miembros de la organización del cliente.
DROP POLICY IF EXISTS "tasks_member_all" ON public.organization_tasks;
CREATE POLICY "tasks_member_all" ON public.organization_tasks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_clients c
    JOIN public.organization_members m ON m.organization_id = c.organization_id
    WHERE c.id = organization_tasks.client_id AND m.user_id = auth.uid()
  ));

-- Derivaciones: todo para miembros de la organización.
DROP POLICY IF EXISTS "derivaciones_member_all" ON public.organization_derivaciones;
CREATE POLICY "derivaciones_member_all" ON public.organization_derivaciones
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organization_derivaciones.organization_id AND m.user_id = auth.uid()
  ));

-- Mensajes: todo para miembros de la organización de la derivación.
DROP POLICY IF EXISTS "mensajes_member_all" ON public.organization_mensajes;
CREATE POLICY "mensajes_member_all" ON public.organization_mensajes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_derivaciones d
    JOIN public.organization_members m ON m.organization_id = d.organization_id
    WHERE d.id = organization_mensajes.derivacion_id AND m.user_id = auth.uid()
  ));

-- ============================================================
-- CREAR TU ESPACIO (sin SQL)
-- ============================================================
-- El alta se hace desde la app: entrá a /empresas/crear (o tocá
-- "¿Sos una empresa? Creá tu espacio" en el login) y completá el formulario.
-- Eso crea la organization y te vincula como owner automáticamente.
--
-- Si ya ejecutaste una versión anterior de este script y quedó una fila de demo
-- con slug 'espacio-critico', eliminala para poder crear la tuya desde la app:
--    DELETE FROM public.organizations WHERE slug = 'espacio-critico';

-- ============================================================
-- VINCULAR TU CUENTA (alternativa manual, solo si NO usás la app)
-- ============================================================
-- Con el onboarding de /empresas/crear no hace falta nada de esto.
-- Si querés hacerlo a mano, con esta cuenta (misma de counselor/admin, sin cambiar rol):
--    INSERT INTO public.organization_members (organization_id, user_id, rol)
--    SELECT o.id, u.id, 'owner'
--    FROM public.organizations o, public.users u
--    WHERE o.slug = 'espacio-critico' AND u.email = 'TU_EMAIL@example.com'
--    ON CONFLICT (organization_id, user_id) DO NOTHING;
