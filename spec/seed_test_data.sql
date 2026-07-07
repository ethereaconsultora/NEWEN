-- ============================================================
-- Activar counselors + crear test + seed talleres con imágenes
-- ============================================================

-- 1. Activar TODOS los counselors
UPDATE counselors SET estado = 'activo', activo = true WHERE estado != 'activo' OR activo = false;

-- 2. Crear counselors de prueba (si no hay)
INSERT INTO users (id, email, nombre, rol) VALUES
  (gen_random_uuid(), 'test1@newen.app', 'María Gómez', 'counselor'),
  (gen_random_uuid(), 'test2@newen.app', 'Carlos Ruiz', 'counselor'),
  (gen_random_uuid(), 'test3@newen.app', 'Laura Díaz', 'counselor')
ON CONFLICT (email) DO NOTHING;

INSERT INTO counselors (id, especialidades, modalidad, provincia, ciudad, experiencia_anios, bio, enfoque, estado, activo)
SELECT u.id, ARRAY['Ansiedad','Duelo'], 'ambas', 'Córdoba', 'Córdoba Capital', 8, 'Especialista en terapia breve.', 'Centrado en Soluciones', 'activo', true
FROM users u WHERE u.email = 'test1@newen.app' AND NOT EXISTS (SELECT 1 FROM counselors WHERE id = u.id);

INSERT INTO counselors (id, especialidades, modalidad, provincia, ciudad, experiencia_anios, bio, enfoque, estado, activo)
SELECT u.id, ARRAY['Crecimiento personal','Autoestima'], 'online', 'Buenos Aires', 'La Plata', 5, 'Coach ontológico.', 'Coaching Humanista', 'activo', true
FROM users u WHERE u.email = 'test2@newen.app' AND NOT EXISTS (SELECT 1 FROM counselors WHERE id = u.id);

INSERT INTO counselors (id, especialidades, modalidad, provincia, ciudad, experiencia_anios, bio, enfoque, estado, activo)
SELECT u.id, ARRAY['Crisis vitales','Adicciones'], 'presencial', 'Mendoza', 'Mendoza Capital', 12, 'Acompañamiento en procesos de cambio.', 'Psicología Positiva', 'activo', true
FROM users u WHERE u.email = 'test3@newen.app' AND NOT EXISTS (SELECT 1 FROM counselors WHERE id = u.id);

-- 3. Imágenes ficticias para talleres (Unsplash pics)
UPDATE talleres SET video_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800' WHERE titulo LIKE '%Mindfulness%';
UPDATE talleres SET video_url = 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800' WHERE titulo LIKE '%Ansiedad%';
UPDATE talleres SET video_url = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800' WHERE titulo LIKE '%Duelo%';
UPDATE talleres SET video_url = 'https://images.unsplash.com/photo-1518459036862-3d5b5e5e5e5e?w=800' WHERE titulo LIKE '%Amor Propio%';
UPDATE talleres SET video_url = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800' WHERE titulo LIKE '%Comunicación%';
