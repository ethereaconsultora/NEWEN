# Matriz de Especificación — Newen

| Artefacto | Propósito | Fase | Archivo | Estado |
|---|---|---|---|---|
| User Stories | Definir requisitos de usuario | Descubrimiento | `USER_STORIES.md` | ✅ |
| Use Cases | Flujos funcionales detallados | MVP / Core | `USE_CASES.md` | ✅ |
| API Contracts | Contratos de endpoints | MVP / Core | `API_CONTRACTS.md` | ✅ |
| OpenAPI Spec | Especificación de API | MVP / Core | `openapi.yaml` | ✅ |
| Data Model | Esquema de datos | MVP / Core | `DATA_MODEL.md` | ✅ |
| SQL Schema | Script de base de datos | MVP / Core | `init_schema.sql` | ✅ |
| Acceptance Criteria | Criterios de entrega | MVP / Core / Prod | `ACCEPTANCE_CRITERIA.md` | ✅ |
| Architecture | Diseño técnico | Descubrimiento | `../ARCHITECTURE.md` | ✅ |
| Security | Protocolo de seguridad | Todo el ciclo | `../SECURITY.md` | ✅ |
| Security Summary | Referencia rápida | Todo el ciclo | `../SECURITY_SUMMARY.md` | ✅ |
| Changelog | Registro de cambios | Todo el ciclo | `../CHANGELOG.md` | ✅ |
| Design Decisions | Rationale de diseño | Core / Prod | `DESIGN_DECISIONS.md` | ✅ |
| Project Plan | Planificación | Descubrimiento | `PROJECT_PLAN.md` | ✅ |
| Deployment | Guía de deploy | Prod | `DEPLOYMENT.md` | ✅ |
| Deployment Checklist | Checklist pre-deploy | Prod | `DEPLOYMENT_CHECKLIST.md` | ✅ |
| Test Plan | Estrategia de testing | Core / Prod | `TEST_PLAN.md` | ✅ |
| UX Flow | Flujos de usuario | Descubrimiento / MVP | `UX_FLOW.md` | ✅ |
| Data Privacy | Privacidad de datos | Todo el ciclo | `DATA_PRIVACY.md` | ✅ |

## Trazabilidad

| User Story | Use Case | Endpoint | Criterio |
|---|---|---|---|
| US-01: Buscar counselor | UC-01 | GET /counselors | AC-01 |
| US-02: Ver perfil | UC-02 | GET /counselors/:id | AC-02 |
| US-03: Reservar sesión | UC-03 | POST /sesiones | AC-03 |
| US-04: Pagar sesión | UC-04 | POST /pagos | AC-04 |
| US-05: Videollamada | UC-05 | POST /daily/rooms | AC-05 |
| US-06: Evaluar sesión | UC-06 | POST /evaluaciones | AC-06 |
| US-07: Panel counselor | UC-07 | GET /panel/* | AC-07 |
| US-08: Postularse | UC-08 | POST /postulaciones | AC-08 |
| US-09: Admin gestiona | UC-09 | GET/POST /admin/* | AC-09 |
| US-10: Empresa corporate | UC-10 | POST /empresas | AC-10 |
