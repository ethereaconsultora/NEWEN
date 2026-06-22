# Backlog — Newen

## Sprint 0 — Preparación (EN CURSO)
- [x] Crear estructura de carpetas + `logs/`
- [x] Crear `PRIMORDIAL.md` + `ARCHITECTURE.md`
- [x] Crear `WORKFLOW.md` + `logs/` inicializados
- [ ] Crear `SECURITY.md` + `SECURITY_SUMMARY.md`
- [ ] Crear `AGENTS.md` + `CHANGELOG.md` + `README.md`
- [ ] Crear `spec/` (15 artefactos SDD)
- [ ] Inicializar Git + primer commit + push

## Sprint 1 — Base de datos y autenticación
- [ ] Script SQL completo → ejecutar en Supabase
- [ ] Google OAuth + email/pass configurado en Supabase
- [ ] Middleware de autenticación por rol (`middleware.ts`)
- [ ] Cliente Supabase SSR en `lib/supabase/`
- [ ] Tipos TypeScript generados de Supabase
- [ ] Pantalla de login / registro (`app/auth/`)

## Sprint 2 — Perfil y búsqueda de counselors
- [ ] API CRUD de counselors (`app/api/counselors/`)
- [ ] Pantalla de listado con filtros (`buscar/`)
- [ ] Perfil público del counselor (`counselor/[id]/`)
- [ ] Formulario de postulación counselor → tabla `postulaciones`

## Sprint 3 — Reserva de sesiones + pagos
- [ ] Calendario de disponibilidad del counselor
- [ ] Flujo de reserva (`reservar/[id]/`)
- [ ] Integración Mercado Pago (Checkout Pro)
- [ ] Webhook de confirmación de pago (`api/pagos/`)
- [ ] Creación automática de sala Daily.co

## Sprint 4 — Videollamada y evaluación
- [ ] Integración Daily.co SDK (`VideoRoom.tsx`)
- [ ] Pantalla de sesión consultante (`sesion/[id]/`)
- [ ] Pantalla de sesión counselor (`panel/sesion/[id]/`)
- [ ] Evaluación post-sesión obligatoria (`evaluar/[id]/`)
- [ ] Bloqueo de próxima reserva hasta evaluar

## Sprint 5 — Panel del counselor
- [ ] Dashboard con métricas (`panel/`)
- [ ] Gestión de agenda (`panel/agenda/`)
- [ ] Espacio colaborativo (`panel/colaborativo/`)
- [ ] Gestión de talleres (`panel/talleres/`)
- [ ] Editar perfil público (`panel/perfil/`)

## Sprint 6 — Panel admin
- [ ] Métricas globales (`admin/`)
- [ ] Gestión de postulaciones (`admin/postulaciones/`)
- [ ] Videollamada de entrevista (`admin/entrevista/[id]/`)
- [ ] Gestión de counselors activos (`admin/counselors/`)
- [ ] Gestión de empresas (`admin/empresas/`)

## Sprint 7 — PWA y producción
- [ ] PWA manifest + service worker
- [ ] Rate limiting en endpoints sensibles
- [ ] Validación de esquema en todos los inputs
- [ ] Tests de contrato contra `openapi.yaml`
- [ ] Deploy en Vercel (staging → producción)
- [ ] Landing page en `buscanos.com.ar`

---

## Guía de colaboración

### Clr. Ari Mangini (Founder & Project Owner)
- Define prioridades y flujos de usuario.
- Valida criterios de aceptación.
- Aprueba cada sprint antes de avanzar.
- Único autorizado para aprobar counselors y sponsors.

### DeepSeek (Ingeniero principal)
- Implementa el código.
- Asegura que los endpoints cumplan `openapi.yaml`.
- Mantiene seguridad PSAI y `logs/` actualizados.

### Copilot Free + DeepSeek V4 (Asistencia)
- Autocompletado rápido y boilerplate.
- NUNCA tomar decisiones de seguridad o arquitectura.
- Siempre revisado por DeepSeek antes de commit.

---

## Notas
- Evitar crear carpetas hasta que un sprint lo requiera.
- `logs/CHANGELOG_DEV.md` se actualiza en cada paso.
- `logs/BUGS.md` se actualiza ante cualquier error.
- Las API keys NUNCA en el frontend.
- El espíritu de Newen no se vende. Se auspicias.
