-- ============================================================
-- NEWEN — Schema inicial de base de datos
-- Ejecutar en: SQL Editor de Supabase (Database → SQL Editor)
-- Versión: v0.2.0 — 2026-06-28
-- ============================================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rol TEXT CHECK (rol IN ('consultante','counselor','admin')) DEFAULT 'consultante',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COUNSELORS (extiende users)
CREATE TABLE IF NOT EXISTS counselors (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  enfoque TEXT,
  especialidades TEXT[],
  modalidad TEXT CHECK (modalidad IN ('presencial','online','ambas')),
  provincia TEXT,
  experiencia_anios INT,
  aac_verificado BOOLEAN DEFAULT FALSE,
  estado TEXT CHECK (estado IN ('pendiente','entrevistado','activo','suspendido')) DEFAULT 'pendiente',
  promedio_estrellas DECIMAL(3,2) DEFAULT 0,
  total_sesiones INT DEFAULT 0,
  fee_pagado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT FALSE,
  mp_access_token TEXT,  -- Token de Mercado Pago del counselor. NUNCA se expone al frontend.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESIONES
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID REFERENCES counselors(id),
  consultante_id UUID REFERENCES users(id),
  fecha_hora TIMESTAMPTZ NOT NULL,
  duracion_min INT DEFAULT 50,
  modalidad TEXT CHECK (modalidad IN ('presencial','online')),
  estado TEXT CHECK (estado IN ('reservada','confirmada','en_curso','finalizada','cancelada')) DEFAULT 'reservada',
  tipo TEXT CHECK (tipo IN ('individual','corporativa')) DEFAULT 'individual',
  precio_usd DECIMAL(8,2) DEFAULT 18,
  precio_empresa_usd DECIMAL(8,2),
  daily_room_url TEXT,
  evaluacion_enviada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVALUACIONES
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID UNIQUE REFERENCES sesiones(id),
  counselor_id UUID REFERENCES counselors(id),
  consultante_id UUID REFERENCES users(id),
  estrellas INT CHECK (estrellas BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMPRESAS (Newen Workplace)
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  contacto_nombre TEXT,
  contacto_email TEXT,
  cantidad_empleados INT DEFAULT 5,
  precio_mensual_usd DECIMAL(8,2),
  ganancia_newen_usd DECIMAL(8,2),
  estado TEXT CHECK (estado IN ('activa','pausada','cancelada')) DEFAULT 'activa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EMPLEADOS CORPORATIVOS
CREATE TABLE IF NOT EXISTS empleados_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  user_id UUID REFERENCES users(id),
  sesiones_disponibles_mes INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TALLERES
CREATE TABLE IF NOT EXISTS talleres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID REFERENCES counselors(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  precio_usd DECIMAL(8,2) DEFAULT 0,
  gratuito BOOLEAN DEFAULT FALSE,
  modalidad TEXT CHECK (modalidad IN ('grabado','vivo')),
  fecha_hora TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. POSTULACIONES
CREATE TABLE IF NOT EXISTS postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  apellido TEXT,
  email TEXT UNIQUE NOT NULL,
  wsp TEXT,
  provincia TEXT,
  especialidades TEXT[],
  modalidad TEXT,
  enfoque TEXT,
  aac_estado TEXT,
  origen TEXT,
  estado TEXT CHECK (estado IN ('recibida','entrevista_pendiente','aprobada','rechazada')) DEFAULT 'recibida',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WAITLIST CONSULTANTES
CREATE TABLE IF NOT EXISTS waitlist_consultantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  email TEXT UNIQUE NOT NULL,
  busqueda TEXT,
  modalidad TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  accion TEXT,
  patron_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DISPONIBILIDAD (horarios semanales del counselor)
CREATE TABLE IF NOT EXISTS disponibilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID REFERENCES counselors(id) ON DELETE CASCADE,
  dia_semana INT CHECK (dia_semana BETWEEN 0 AND 6), -- 0=dom, 1=lun, ...
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(counselor_id, dia_semana)
);

-- Insertar disponibilidad default para counselors (lun-vie 9-18)
INSERT INTO disponibilidad (counselor_id, dia_semana, hora_inicio, hora_fin)
SELECT id, dia, '09:00', '18:00'
FROM counselors, generate_series(1, 5) AS dia
ON CONFLICT (counselor_id, dia_semana) DO NOTHING;

-- ============================================================
-- RLS — Row Level Security
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_consultantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;

-- Disponibilidad: lectura pública para counselors activos
CREATE POLICY "Disponibilidad visible públicamente"
  ON disponibilidad FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM counselors
    WHERE counselors.id = disponibilidad.counselor_id
    AND counselors.estado = 'activo'
  ));

-- Políticas básicas (refinar por tabla en iteraciones futuras)

-- Counselors: lectura pública para perfiles activos
CREATE POLICY "Perfiles activos visibles públicamente"
  ON counselors FOR SELECT
  USING (estado = 'activo');

-- Counselors: solo el propio counselor edita su perfil
CREATE POLICY "Counselor edita su propio perfil"
  ON counselors FOR UPDATE
  USING (auth.uid() = id);

-- Sesiones: consultante ve sus sesiones, counselor ve las propias
CREATE POLICY "Usuarios ven sus sesiones"
  ON sesiones FOR SELECT
  USING (auth.uid() = consultante_id OR auth.uid() = counselor_id);

-- Evaluaciones: consultante crea, counselor ve las que recibió
CREATE POLICY "Consultante crea su evaluación"
  ON evaluaciones FOR INSERT
  WITH CHECK (auth.uid() = consultante_id);

-- Postulaciones: inserción pública
CREATE POLICY "Cualquiera puede postularse"
  ON postulaciones FOR INSERT
  WITH CHECK (true);

-- Postulaciones: solo admin lee
CREATE POLICY "Admin lee postulaciones"
  ON postulaciones FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin'));

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_counselors_estado ON counselors(estado);
CREATE INDEX IF NOT EXISTS idx_counselors_especialidades ON counselors USING GIN(especialidades);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_sesiones_estado ON sesiones(estado);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_counselor ON evaluaciones(counselor_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX IF NOT EXISTS idx_counselors_activo ON counselors(activo);

-- ============================================================
-- FUNCIONES
-- ============================================================

-- Incrementar contador de sesiones de un counselor
CREATE OR REPLACE FUNCTION increment_counselor_sessions(counselor_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE counselors
  SET total_sesiones = total_sesiones + 1
  WHERE id = counselor_id;
END;
$$ LANGUAGE plpgsql;
