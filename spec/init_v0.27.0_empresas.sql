-- ============================================================
-- NEWEN — v0.27.0 — Área Empresa (espacio comercial multicliente)
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

-- 1. Ampliar el rol de users para incluir 'empresa'.
--    La columna rol usa un CHECK; lo recreamos sumando 'empresa'.
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

-- 7. DERIVACIONES — derivación de una persona a un counselor de newen.
CREATE TABLE IF NOT EXISTS public.derivaciones (
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

-- 8. MENSAJES — mensajería interna profesional ↔ quien deriva (por derivación).
CREATE TABLE IF NOT EXISTS public.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derivacion_id UUID REFERENCES public.derivaciones(id) ON DELETE CASCADE,
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
ALTER TABLE public.derivaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Organizaciones: lectura pública de las activas (página /e/slug).
CREATE POLICY "organizations_public_read" ON public.organizations
  FOR SELECT USING (estado = 'activa');

-- Organizaciones: miembros leen su propia organización.
CREATE POLICY "organizations_member_read" ON public.organizations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
  ));

-- Organizaciones: miembros actualizan su propia organización.
CREATE POLICY "organizations_member_update" ON public.organizations
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
  ));

-- Members: visibles para la propia organización.
CREATE POLICY "members_read_own" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.organization_members me
    WHERE me.organization_id = organization_members.organization_id AND me.user_id = auth.uid()
  ));

-- Clients: todo para miembros de la organización.
CREATE POLICY "clients_member_all" ON public.organization_clients
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = organization_clients.organization_id AND m.user_id = auth.uid()
  ));

-- Employees: todo para miembros de la organización del cliente.
CREATE POLICY "employees_member_all" ON public.organization_employees
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_clients c
    JOIN public.organization_members m ON m.organization_id = c.organization_id
    WHERE c.id = organization_employees.client_id AND m.user_id = auth.uid()
  ));

-- Tasks: todo para miembros de la organización del cliente.
CREATE POLICY "tasks_member_all" ON public.organization_tasks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_clients c
    JOIN public.organization_members m ON m.organization_id = c.organization_id
    WHERE c.id = organization_tasks.client_id AND m.user_id = auth.uid()
  ));

-- Derivaciones: todo para miembros de la organización.
CREATE POLICY "derivaciones_member_all" ON public.derivaciones
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = derivaciones.organization_id AND m.user_id = auth.uid()
  ));

-- Mensajes: todo para miembros de la organización de la derivación.
CREATE POLICY "mensajes_member_all" ON public.mensajes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.derivaciones d
    JOIN public.organization_members m ON m.organization_id = d.organization_id
    WHERE d.id = mensajes.derivacion_id AND m.user_id = auth.uid()
  ));

-- ============================================================
-- SEED — Espacio Crítico (organización demo)
-- ============================================================
INSERT INTO public.organizations (
  slug, nombre, tagline, rubro, sede, empleados, contacto, email, telefono,
  servicios, primary_color, accent_color, estado
) VALUES (
  'espacio-critico',
  'Espacio Crítico',
  'Counseling organizacional',
  'Consultoría organizacional',
  'Buenos Aires, Argentina',
  10,
  'Ari Mangini',
  'hola@espaciocritico.com.ar',
  '+54 9 11 0000 0000',
  ARRAY['Liderazgo Sostenible','Fortalecimiento de Equipos','Recuperación del Clima','Gestión de Conflictos','Prevención de Burnout','Onboarding','Campus Digital'],
  '#0a0806',
  '#c4a87e',
  'activa'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- VINCULAR TU CUENTA (manual, luego de ejecutar este script)
-- ============================================================
-- 1) Tu cuenta pasa a rol empresa (no modifica es_admin ni counselor):
--    UPDATE public.users SET rol = 'empresa' WHERE email = 'TU_EMAIL@example.com';
--
-- 2) Vincular la cuenta como owner de Espacio Crítico:
--    INSERT INTO public.organization_members (organization_id, user_id, rol)
--    SELECT o.id, u.id, 'owner'
--    FROM public.organizations o, public.users u
--    WHERE o.slug = 'espacio-critico' AND u.email = 'TU_EMAIL@example.com'
--    ON CONFLICT (organization_id, user_id) DO NOTHING;
