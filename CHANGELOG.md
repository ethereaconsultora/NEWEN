# Changelog — Newen

## [0.2.0] — 2026-06-28

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO

---

### Motivación
Migración a la spec v2.0 (NEWEN_PROMPT_EJECUTIVO_v2.md + newen_spec_negocio_v2.html).
Cambios principales: precios actualizados, dólar blue en tiempo real, tope de 10 counselors.

### Cambios realizados

#### Precios v2
- [x] Sesión: $22 → $18 USD
- [x] Plan corporativo base: $200 → $230 USD/mes
- [x] Empleado adicional: $20 → $46 USD/mes
- [x] Counselor siempre cobra $18 (sin distinguir individual/corporativo)
- [x] Newen retiene $50/mes base + $10 por empleado extra

#### Schema SQL v0.2.0
- [x] `counselors.activo` (boolean, default false)
- [x] `sesiones.precio_empresa_usd` (para auditoría corporativa)
- [x] `empresas.ganancia_newen_usd` (diferencial Newen)
- [x] `sesiones.precio_usd` con default 18
- [x] Índice `idx_counselors_activo`

#### Dólar blue
- [x] `lib/dolar.ts` — helper server-side
- [x] `hooks/useDolar.ts` — hook React (actualiza cada 5 min)
- [x] `components/ui/DolarBadge.tsx` — "$18 USD · ≈ $27.270 ARS"
- [x] `api/dolar/route.ts` — proxy para evitar CORS
- [x] `.env.local.example` — +DOLAR_API_URL +DOLAR_FALLBACK

#### Documentación
- [x] 14 archivos actualizados: spec/, types/, docs raíz
- [x] DESIGN_DECISIONS.md: +DD-10 (tope 10) +DD-11 (dólar blue)

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `spec/init_schema.sql` | MODIFICADO — +3 columnas, default 18 |
| `types/newen.ts` | MODIFICADO — +3 campos |
| `.env.local.example` | MODIFICADO — +dólar |
| `spec/DATA_MODEL.md` | MODIFICADO |
| `spec/DESIGN_DECISIONS.md` | MODIFICADO — DD-07, DD-09, +DD-10, +DD-11 |
| `spec/USE_CASES.md` | MODIFICADO — precios |
| `spec/API_CONTRACTS.md` | MODIFICADO — +dolar endpoint |
| `spec/PROJECT_PLAN.md` | MODIFICADO — +riesgos |
| `spec/ACCEPTANCE_CRITERIA.md` | MODIFICADO — precios |
| `spec/SPEC_MATRIX.md` | MODIFICADO |
| `lib/dolar.ts` | NUEVO |
| `hooks/useDolar.ts` | NUEVO |
| `components/ui/DolarBadge.tsx` | NUEVO |
| `app/api/dolar/route.ts` | NUEVO |
| `PRIMORDIAL.md` | MODIFICADO — precios, tope, dólar |
| `BACKLOG.md` | MODIFICADO — precios, dólar |
| `ARCHITECTURE.md` | MODIFICADO — stack, flujos |

---

## [0.1.0] — 2026-06-21

### Tipo: INIT
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: EN PROGRESO

---

### Motivación
Creación del proyecto Newen desde cero. Aplicación de los documentos fundacionales
(NEWEN_PROMPT_EJECUTIVO.md y newen_spec_negocio.html) para establecer la base
completa del ecosistema Newen.

### Cambios realizados

#### Paso 1 — Estructura base
- [x] Creación de directorios: `newen/`, `spec/`, `logs/`, `public/icons/`, `app/`
- [x] `PRIMORDIAL.md` — contexto esencial de Newen
- [x] `ARCHITECTURE.md` — flujo técnico con 3 shells
- [x] `WORKFLOW.md` — ciclo de desarrollo diario
- [x] `logs/README.md` + `logs/CHANGELOG_DEV.md` + `logs/BUGS.md`
- [x] `BACKLOG.md` — 7 sprints planificados
- [x] `SECURITY.md` — PSAI v1.3 aplicado a Newen
- [x] `SECURITY_SUMMARY.md` — referencia rápida
- [x] `AGENTS.md` — reglas para el ingeniero
- [ ] `spec/` — 15 artefactos SDD
- [ ] `README.md` + `package.json` + `.gitignore`
- [ ] `public/manifest.json` — PWA
- [ ] Git init + commit + push

---

### Próximo paso
Completar spec/, package.json, manifest.json, git init, commit y push.
Luego avanzar al Sprint 1 (Base de datos y autenticación).
