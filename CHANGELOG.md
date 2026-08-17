# Changelog — Newen

## [0.28.0] — 2026-08-17

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO

---

### Motivación
Resolver el arranque del producto Empresa: falta una **vidriera pública** (página principal
que lista los espacios, como perfiles de Shopify) y un **onboarding** para crear un espacio
desde cero.

### Cambios realizados

- [x] Página pública `/empresas` — vidriera con todos los espacios activos (cards + link al espacio)
- [x] Onboarding `/empresas/crear` — formulario que crea `organizations` + `organization_members`
      (owner) y redirige al dashboard `/empresa`
- [x] Policies INSERT (`organizations_insert`, `members_insert_self`) en la migración
- [x] Middleware: `/empresas` público y corrección para no confundir `/empresa` con `/empresas`

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `app/empresas/page.tsx` | NUEVO — vidriera pública |
| `app/empresas/crear/page.tsx` | NUEVO — onboarding |
| `middleware.ts` | MODIFICADO — público + matcher |
| `spec/init_v0.27.0_empresas.sql` | MODIFICADO — policies INSERT |
| `logs/2026-08-17-feature-v0.28.0.md` | NUEVO |

---

### Próximo paso
Probar el alta de un espacio desde `/empresas/crear` y ajustar el onboarding (pago, logo,
banner, previsualización).

---

## [0.27.0] — 2026-08-17

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO (primera integración)

---

### Motivación
Agregar una cuarta área en newen, distinta de profesional/admin/consultante: un acceso para
**empresas que pagan por un espacio comercial** dentro de la plataforma, enlazado (si se paga)
a un **campus digital**. Caso de validación: **Espacio Crítico** (counseling organizacional),
con la estética de su web (oscura/dorada) y una consola admin multicliente.

### Cambios realizados

- [x] Rol `empresa` en `users` (migración) + protección de `/empresa` y ruta pública `/e/[slug]`
- [x] Tablas nuevas: `organizations`, `organization_members`, `organization_clients`,
      `organization_employees`, `organization_tasks`, `derivaciones`, `mensajes` (con RLS)
- [x] Shell `(empresa)` con estética propia (CSS Module oscuro/dorado) y logout automático
- [x] Dashboard multicliente: selector de cliente, KPIs, sistema de 6 fases, empleados con
      derivación a Newen, alta/edición/archivado de clientes
- [x] Stub del campus digital (`/empresa/campus`)
- [x] Página pública `/e/[slug]` con la estética de Espacio Crítico (server component)

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `spec/init_v0.27.0_empresas.sql` | NUEVO — esquema + RLS + seed |
| `app/(empresa)/layout.tsx` | NUEVO |
| `app/(empresa)/empresa/page.tsx` | NUEVO — dashboard |
| `app/(empresa)/empresa/campus/page.tsx` | NUEVO — stub campus |
| `app/(empresa)/empresa.module.css` | NUEVO |
| `app/e/[slug]/page.tsx` | NUEVO — página pública |
| `middleware.ts` | MODIFICADO — rol empresa |
| `app/auth/callback/route.ts` | MODIFICADO — redirect empresa |
| `logs/2026-08-17-feature-v0.27.0.md` | NUEVO |

---

### Próximo paso
Ejecutar `spec/init_v0.27.0_empresas.sql` en Supabase y vincular la cuenta (rol empresa +
owner). Luego completar: mensajería interna, seguimiento por tarea, informes PDF y derivación
completa.

---

## [0.26.0] — 2026-08-17

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO

---

### Motivación
Corrección del alcance: revertir la dualidad paciente/consultante en la agenda. En su
lugar, dentro de "Nuevo turno" se agrega el botón "Agregar paciente" (alta rápida sin
salir del formulario) y el botón pasa a decir "Agendar paciente". Además, en Ajustes la
paleta de colores y las tipografías se previsualizan al instante; "Guardar cambios" solo
persiste lo que se está previsualizando.

### Cambios realizados

- [x] Revertida la dualidad paciente/consultante (se elimina `turnos.consultante_id`)
- [x] Botón "+ Agregar paciente" con alta rápida inline en "Nuevo turno"
- [x] Botón principal "Agendar paciente"
- [x] Previsualización instantánea de paleta/tipografía/tamaño en Ajustes (contexto reactivo)
- [x] "Guardar cambios" persiste la apariencia previsualizada
- [x] Formulario de paciente compartido (`PacienteForm`) con DNI y fecha de nacimiento
- [x] "+ Nuevo paciente" en agenda → nuevo turno (modal con el mismo formulario completo)
- [x] Botón "Guardar turno" y normalización de "+ Nuevo turno"
- [x] Botón "Recordar por WhatsApp" con el texto de recordatorio de Anima

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `components/consultorio/ThemeProvider.tsx` | NUEVO |
| `agenda/nuevo/page.tsx` | MODIFICADO — alta rápida paciente |
| `agenda/page.tsx`, `AgendaClient.tsx`, `agenda/[id]/page.tsx` | REVERTIDOS — sin consultante |
| `consultorio/layout.tsx` | MODIFICADO — ThemeProvider |
| `consultorio/ajustes/page.tsx` | MODIFICADO — previsualización |
| `spec/init_v0.26.0_turnos_consultante.sql` | ELIMINADO |
| `logs/2026-08-17-feature-v0.26.0.md` | NUEVO (corregido) |

---

### Próximo paso
Sin SQL pendiente para v0.26.0 (la columna de apariencia sigue siendo v0.25.0).

---

## [0.25.0] — 2026-08-17

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO

---

### Motivación
Reemplazar el selector post-login por un switch admin/profesional en la barra inferior,
quitar la agenda obsoleta del menú counselor y completar Ajustes del consultorio con las
paletas/tipografías de Anima y cambio de contraseña con doble confirmación. Sin tocar RLS.

### Cambios realizados

- [x] Switch "Profesional | Admin" en la barra inferior de ambos shells
- [x] Se quita la pestaña "Agenda" del menú counselor (la agenda real está en el consultorio)
- [x] Ajustes del consultorio: 9 paletas (Newen + 8 de Anima), 10 tipografías (Newen + 9 de Anima) y 4 tamaños de letra
- [x] Cambio de contraseña con doble confirmación
- [x] Revertido: sin cambios de RLS ni de rol en la cuenta
- [x] Se elimina `/elegir-rol` (reemplazado por el switch)

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `components/RoleSwitch.tsx` | NUEVO |
| `lib/consultorio-apariencia.ts` | NUEVO |
| `components/consultorio/FontLoader.tsx` | NUEVO |
| `spec/init_v0.25.0_consultorio_apariencia.sql` | NUEVO |
| `app/(counselor)/layout.tsx` | MODIFICADO — sin Agenda + switch |
| `app/(admin)/layout.tsx` | MODIFICADO — switch |
| `middleware.ts` + `app/auth/callback/route.ts` | MODIFICADO — sin /elegir-rol |
| `app/elegir-rol/page.tsx` | ELIMINADO |
| consultorio `layout/nav/css/ajustes` | MODIFICADO — apariencia + estructura |
| `logs/2026-08-17-feature-v0.25.0.md` | NUEVO |

---

### Próximo paso
Ejecutar `spec/init_v0.25.0_consultorio_apariencia.sql` en Supabase de Newen.

---

## [0.24.0] — 2026-08-17

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO

---

### Motivación
El usuario ingresa al panel admin con la misma cuenta de su perfil profesional.
Necesita elegir al ingresar si continuar como admin o como profesional, y contar
con logout automático a los 10 minutos de inactividad.

### Cambios realizados

- [x] `users.es_admin` — flag de capacidad admin independiente del rol primario
- [x] Detección de cuenta dual (admin + counselor) en middleware y callback OAuth
- [x] Pantalla `/elegir-rol` para elegir entre Panel admin y Panel profesional
- [x] Switch "Profesional" en el shell admin y "Admin" en el shell counselor (solo cuentas duales)
- [x] Logout automático a los 10 min de inactividad en ambos shells y en `/elegir-rol`
- [x] Login email/password redirige a `/` → el middleware decide (selector para cuentas duales)
- [x] Trigger `handle_new_user` limitado a consultante/counselor (admin solo manual)

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `spec/init_v0.24.0_rol_selector.sql` | NUEVO — columna es_admin + backfill |
| `middleware.ts` | MODIFICADO — capacidades dual + redirect a elegir-rol |
| `app/auth/callback/route.ts` | MODIFICADO — redirect post-OAuth |
| `app/auth/login/page.tsx` | MODIFICADO — redirect a / (selector dual) |
| `hooks/useEsMultiRol.ts` | NUEVO — hook de capacidades |
| `app/elegir-rol/page.tsx` | NUEVO — selector de rol |
| `app/(admin)/layout.tsx` | MODIFICADO — switch Profesional |
| `app/(counselor)/layout.tsx` | MODIFICADO — switch Admin |
| `logs/CHANGELOG_DEV.md` | MODIFICADO — entrada 2026-08-17 |
| `logs/2026-08-17-feature-v0.24.0.md` | NUEVO — log detallado |

---

### Próximo paso
Ejecutar `spec/init_v0.24.0_rol_selector.sql` en Supabase de Newen y marcar la
cuenta profesional con `es_admin = true` si corresponde.

---

## [0.23.0] — 2026-08-17

### Tipo: FEATURE
### Autor: Clr. Ari Mangini (asistido por DeepSeek V4 Pro — GitHub Copilot)
### Estado: COMPLETADO

---

### Motivación
Integrar la app Anima (gestión clínica) dentro de Newen como **"Mi consultorio"**,
anexo del panel counselor. Se trabaja únicamente con las cuentas de
Supabase / GitHub / Vercel de Newen (las de Anima quedaron cerradas).

### Cambios realizados

#### Base de datos
- [x] `spec/init_v0.23.0_consultorio.sql` — tablas `pacientes`, `entradas`, `turnos`, `pagos` con RLS por counselor

#### Navegación
- [x] Pestaña "Consultorio" primera en la barra inferior del panel counselor

#### Módulo consultorio (`/panel/consultorio`)
- [x] Inicio: KPIs, próximos turnos, accesos rápidos
- [x] Pacientes: listado, buscador, alta, ficha, edición
- [x] Historia clínica: registrar sesión + historial (motivo, estado, tareas, temas, notas)
- [x] Agenda: turnos con filtros, alta, detalle, cambio de estado, recordatorio WhatsApp
- [x] Calendario: vista mensual con días ocupados
- [x] Pagos: cobros pendientes/pagados, alta, marcar pagado
- [x] Resumen: KPIs, ingresos por mes, modalidad de atención
- [x] Ajustes: perfil + apariencia (hereda identidad visual de Newen)

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `spec/init_v0.23.0_consultorio.sql` | NUEVO — 4 tablas clínicas + RLS |
| `app/(counselor)/layout.tsx` | MODIFICADO — pestaña Consultorio |
| `app/(counselor)/panel/consultorio/**` | NUEVO — 21 archivos del módulo |
| `logs/CHANGELOG_DEV.md` | MODIFICADO — entrada 2026-08-17 |
| `logs/2026-08-17-feature-v0.23.0.md` | NUEVO — log detallado |

---

### Próximo paso
Ejecutar `spec/init_v0.23.0_consultorio.sql` en Supabase de Newen y probar el módulo.

---

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
