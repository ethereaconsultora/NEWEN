-- ============================================================
-- Talleres de prueba
-- Ejecutar después de tener al menos 1 counselor activo
-- ============================================================

INSERT INTO talleres (counselor_id, titulo, descripcion, precio_usd, gratuito, modalidad, estado, created_at)
SELECT id, 'Introducción al Mindfulness', 'Un espacio para aprender a estar presente. Técnicas de respiración, meditación guiada y ejercicios prácticos para incorporar el mindfulness en tu vida diaria.', 0, true, 'grabado', 'publicado', NOW()
FROM counselors WHERE estado = 'activo' LIMIT 1;

INSERT INTO talleres (counselor_id, titulo, descripcion, precio_usd, gratuito, modalidad, estado, created_at)
SELECT id, 'Gestión de la Ansiedad', 'Herramientas prácticas para reconocer, entender y gestionar la ansiedad. Basado en terapia cognitivo-conductual con ejercicios aplicables.', 5, false, 'grabado', 'publicado', NOW()
FROM counselors WHERE estado = 'activo' LIMIT 1;

INSERT INTO talleres (counselor_id, titulo, descripcion, precio_usd, gratuito, modalidad, estado, created_at)
SELECT id, 'Duelo: Transformar el dolor', 'Un recorrido por las etapas del duelo. Cómo transitar la pérdida con herramientas de contención emocional y acompañamiento.', 8, false, 'grabado', 'publicado', NOW()
FROM counselors WHERE estado = 'activo' LIMIT 1;

INSERT INTO talleres (counselor_id, titulo, descripcion, precio_usd, gratuito, modalidad, estado, created_at)
SELECT id, 'Autoestima y Amor Propio', 'Ejercicios y reflexiones para fortalecer la autoestima. Aprender a valorarte y construir una relación más amorosa con vos mismo.', 5, false, 'grabado', 'publicado', NOW()
FROM counselors WHERE estado = 'activo' LIMIT 1;

INSERT INTO talleres (counselor_id, titulo, descripcion, precio_usd, gratuito, modalidad, estado, created_at)
SELECT id, 'Comunicación No Violenta', 'Fundamentos de la CNV para mejorar tus relaciones. Aprender a expresar necesidades y escuchar con empatía.', 0, true, 'grabado', 'publicado', NOW()
FROM counselors WHERE estado = 'activo' LIMIT 1;
