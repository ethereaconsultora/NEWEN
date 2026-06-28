# Plan de Proyecto — Newen

## Fases y sprints

### Sprint 0 — Preparación (Junio 2026)
- Estructura base + docs raíz + spec/
- Git init + primer commit
- Duración: 1 sesión

### Sprint 1 — DB + Auth
- Script SQL en Supabase
- Google OAuth + email/password
- Middleware de protección por rol
- Pantalla login/registro
- Duración estimada: 1-2 sesiones

### Sprint 2 — Perfil y búsqueda
- API counselors
- Listado con filtros
- Perfil público
- Formulario postulación
- Duración estimada: 2-3 sesiones

### Sprint 3 — Reservas + Pagos
- Calendario + disponibilidad
- Flujo de reserva
- Mercado Pago integración
- Webhook + confirmación
- Duración estimada: 2-3 sesiones

### Sprint 4 — Videollamada + Evaluación
- Daily.co integración
- Pantalla de sesión (ambos lados)
- Evaluación post-sesión
- Duración estimada: 1-2 sesiones

### Sprint 5 — Panel Counselor
- Dashboard métricas
- Agenda
- Colaborativo
- Talleres
- Duración estimada: 2-3 sesiones

### Sprint 6 — Panel Admin
- Métricas globales
- Postulaciones + entrevistas
- Counselors + empresas
- Duración estimada: 1-2 sesiones

### Sprint 7 — PWA + Dólar + Producción
- PWA manifest + SW
- DolarBadge en todos los precios
- Rate limiting
- Tests + deploy Vercel
- Landing page
- Duración estimada: 1 sesión

## Timeline estimado

| Hito | Fecha estimada |
|---|---|
| MVP interno (Sprints 0-4) | Julio 2026 |
| Panel counselor (Sprint 5) | Julio 2026 |
| Panel admin (Sprint 6) | Julio 2026 |
| Dólar + PWA (Sprint 7) | Agosto 2026 |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Daily.co costo alto | Medio | Límite de 50 min por sesión |
| Mercado Pago rechazo | Alto | Manejo de errores + reintentos |
| Carga de counselors lenta | Alto | Waitlist + campaña de difusión |
| Evaluaciones falsas | Bajo | Solo consultantes con sesión real |
| iOS PWA limitaciones | Medio | Guía visual en landing |
| DolarAPI caída | Bajo | Fallback $1515 ARS hardcodeado |
| Tope 10 counselors lleno | Medio | Lista de espera + revisión trimestral |
