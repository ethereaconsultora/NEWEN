-- ============================================================
-- NEWEN — Fix v0.17.0
-- Arregla el trigger handle_new_user para crear fila en counselors
-- y popula filas faltantes para counselors existentes
-- ============================================================

-- 1. Actualizar el trigger para que también cree fila en counselors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_rol TEXT;
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data ->> 'rol', 'consultante');

  INSERT INTO public.users (id, email, nombre, rol, created_at)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.email),
    v_rol, NOW());

  -- Si es counselor, crear fila en counselors
  IF v_rol = 'counselor' THEN
    INSERT INTO public.counselors (id) VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Popular counselors faltantes para usuarios existentes con rol=counselor
INSERT INTO public.counselors (id)
SELECT u.id FROM public.users u
LEFT JOIN public.counselors c ON c.id = u.id
WHERE u.rol = 'counselor' AND c.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Asegurar que el usuario actual tenga fila en counselors
-- (reemplazá el email si es necesario)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE rol = 'counselor') THEN
    INSERT INTO public.counselors (id)
    SELECT id FROM public.users WHERE rol = 'counselor'
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
