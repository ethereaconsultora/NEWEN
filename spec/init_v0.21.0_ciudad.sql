-- Agregar ciudad a counselors
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS ciudad TEXT;
