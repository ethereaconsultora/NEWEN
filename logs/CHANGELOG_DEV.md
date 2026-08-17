# Registro de Desarrollo — Newen

## Reglas de registro
- **Cada acción de desarrollo se documenta.** Sin excepciones.
- Si algo falla, se registra ANTES de arreglarlo (no después).
- Los commits de Git referencian entradas de este changelog.

## Formato de entrada
```
### [YYYY-MM-DD] — Título resumen

**Prompt**: descripción de lo que se le pide al ingeniero.
**Acción esperada**: qué se hizo, con qué herramienta.
**Resultado**: qué pasó (éxito, error, warning).
**Archivos tocados**: lista de paths.
**Commit**: hash o mensaje.
**Próximo paso**: qué sigue.
```

## Historial

### [2026-08-17] — feat: v0.27.0 — Área Empresa (espacio comercial multicliente)

**Prompt**: Crear una nueva sección dentro de newen, distinta de profesional/admin/consultante:
un acceso para empresas que pagan por un espacio comercial, enlazado (si se paga) a un campus
digital. Caso concreto: "Espacio Crítico" con la estética de su web (oscura/dorada) y una consola
admin multicliente (clientes, 6 fases, informes, agenda, seguimiento, empleados y derivaciones).

**Acción esperada**: Migración SQL (`organizations`, `organization_members`, `organization_clients`,
`organization_employees`, `organization_tasks`, `derivaciones`, `mensajes` + RLS + seed), rol
`empresa` en users, middleware + callback, shell `(empresa)` con dashboard multicliente y stub de
campus, y página pública `/e/[slug]` con la estética de Espacio Crítico.

**Resultado**: Éxito. `npx tsc --noEmit` limpio y `npm run build` OK (rutas `/empresa`,
`/empresa/campus` y `/e/[slug]` compiladas).

**Archivos tocados**:
- `spec/init_v0.27.0_empresas.sql` (NUEVO)
- `app/(empresa)/layout.tsx` (NUEVO)
- `app/(empresa)/empresa/page.tsx` (NUEVO)
- `app/(empresa)/empresa/campus/page.tsx` (NUEVO)
- `app/(empresa)/empresa.module.css` (NUEVO)
- `app/e/[slug]/page.tsx` (NUEVO)
- `middleware.ts` + `app/auth/callback/route.ts` (MODIFICADOS)

**Commit**: (COMPLETAR)

**Próximo paso**: Ejecutar `spec/init_v0.27.0_empresas.sql` en Supabase y vincular la cuenta
(rol empresa + owner). Luego completar: mensajería interna, seguimiento por tarea, informes PDF
y derivación completa.

### [2026-08-17] — fix: formulario de paciente compartido + WhatsApp + textos

**Prompt**: "+ nuevo paciente" en vez de "agregar paciente"; un único botón en pacientes
y otro igual en agenda → nuevo turno; mismo formulario completo (con DNI y fecha de
nacimiento) en ambos; eliminar "agregar turno" (usar "+ nuevo turno") y que el botón
diga "Guardar turno"; botón de recordatorio por WhatsApp con el texto de Anima.

**Acción esperada**: componente `PacienteForm` compartido, modal en nuevo turno, botón
WhatsApp en detalle de turno y normalización de textos de botones.

**Resultado**: Éxito. Build OK.

**Archivos tocados**: 6 archivos.

**Commit**: `dce5ad9`

**Próximo paso**: Probar alta de paciente desde nuevo turno y recordatorio WhatsApp.

### [2026-08-17] — v0.26.0 (corregido): "Agregar paciente" en turno + previsualización en Ajustes

**Prompt**: No era lo que quería. Revertir la dualidad paciente/consultante. En "Nuevo
turno", botón "Agregar paciente" y que el principal diga "Agendar paciente". En Ajustes,
previsualizar paleta/tipografía al instante; "Guardar cambios" persiste lo previsualizado.

**Acción esperada**: Revertir consultante, agregar alta rápida de paciente en turno, y
mover la apariencia a un `ThemeProvider` (contexto) para previsualización en vivo.

**Resultado**: Éxito. Build OK.

**Archivos tocados**: 8 archivos.

**Commit**: `b6d833f`

**Próximo paso**: Probar previsualización y alta rápida de paciente.

### [2026-08-17] — v0.25.0: switch admin/profesional + Ajustes completos

**Prompt**: No tocar RLS; la cuenta queda como está con doble acceso. Switch admin/profesional
en el menú inferior, quitar Agenda obsoleta, terminar Ajustes con paletas/tipografías de Anima
y cambio de contraseña con doble confirmación. Mantener la historia clínica de Anima.

**Acción esperada**: Revertir RLS/rol, crear `RoleSwitch`, quitar tab Agenda, construir
apariencia del consultorio (temas/fuentes/tamaño) con migración v0.25.0, y password con
doble confirmación.

**Archivos previstos**: 13 archivos.

**Resultado**: Éxito. Build OK.

**Archivos tocados**: 13 archivos.

**Commit**: `3fe60a4`

**Próximo paso**: Ejecutar SQL v0.25.0 en Supabase de Newen.

### [2026-08-17] — fix v0.24.0: detección de counselor determinística (rol)

**Prompt**: No aparecía el selector. La detección de counselor dependía de la fila en
`counselors` bajo RLS (solo expone estado activo), lo que fallaba en algunas cuentas.

**Acción esperada**: Detección determinística: `esCounselor = rol = 'counselor'` y
`esAdmin = es_admin = true OR rol = 'admin'`. Migración: marcar la cuenta única con
`rol='counselor' + es_admin=true`, y actualizar la política RLS de postulaciones para
respetar `es_admin`.

**Resultado**: Éxito. Build OK. Sin dependencia de RLS para el selector.

**Archivos tocados**: `middleware.ts`, `app/auth/callback/route.ts`,
`hooks/useEsMultiRol.ts`, `app/elegir-rol/page.tsx`, `spec/init_v0.24.0_rol_selector.sql`.

**Commit**: `1d058dc`

**Próximo paso**: Ejecutar el paso 3 del SQL con el email real (rol='counselor' + es_admin=true).

### [2026-08-17] — fix v0.24.0: selector en login email/password + admin solo manual

**Prompt**: Aclaración — admin es solo del dueño, las demás cuentas admin se crean
manualmente. El selector debe aparecer apenas se loguea con la cuenta única.

**Acción esperada**: Hacer que el login email/password pase por el middleware (y así
por `/elegir-rol`); endurecer el trigger para que ningún registro público pueda
auto-asignarse `admin`.

**Resultado**: Éxito. Build OK. `handle_new_user` limitado a consultante/counselor.

**Archivos tocados**: `app/auth/login/page.tsx`, `spec/init_v0.24.0_rol_selector.sql`.

**Commit**: `bc4205a`

**Próximo paso**: Ejecutar SQL en Supabase de Newen.

### [2026-08-17] — v0.24.0: selector de rol (admin / profesional)

**Prompt**: Ingreso al panel admin con la misma cuenta del profesional. Poder elegir
una vez logueado si continuar como admin o como profesional, y logout automático a
los 10 minutos de inactividad.

**Acción esperada**: Agregar `users.es_admin`, detectar cuenta dual en middleware y
callback OAuth, crear pantalla `/elegir-rol`, switches de rol en ambos shells, y
confirmar `useAutoLogout` (10 min) en ambos.

**Archivos previstos**: 10 archivos (1 SQL + 5 código + 4 registros).

**Resultado**: Éxito. Build de Next exitoso, ruta `/elegir-rol` presente.

**Archivos tocados**: 10 archivos.

**Commit**: `92613ca`

**Próximo paso**: Ejecutar SQL en Supabase de Newen y marcar es_admin en la cuenta dual.

### [2026-08-17] — v0.23.0: módulo "Mi consultorio" (Anima) en panel counselor

**Prompt**: Integrar Anima como anexo importante dentro de Newen ("Mi consultorio"),
al igual que el Campus. Trabajar en las cuentas de Supabase, GitHub y Vercel de Newen
(las de Anima quedaron cerradas). Registrar todas las modificaciones.

**Acción esperada**: Crear tablas clínicas (pacientes, entradas, turnos, pagos) en
`spec/init_v0.23.0_consultorio.sql`; agregar pestaña "Consultorio" al layout counselor;
construir las rutas `/panel/consultorio/**` (Inicio, Pacientes, Agenda, Calendario,
Pagos, Resumen, Ajustes) con el design system de Newen.

**Archivos previstos**: 25 archivos (1 SQL + 21 módulo + 3 registros).

**Resultado**: Éxito. Build de Next exitoso (42/42 páginas). 3 errores de import de
CSS modules corregidos; migración renombrada de v0.22.0 a v0.23.0.

**Archivos tocados**: 25 archivos.

**Commit**: `045a421`

**Próximo paso**: Ejecutar SQL en Supabase de Newen y probar el módulo.

### [2026-06-21] — Inicio del proyecto Newen
**Prompt**: Crear app Newen desde zero. Documentos fundacionales: prompt ejecutivo + spec de modelo de negocio.

**Acción esperada**: Paso 1 del plan maestro — clonar ARCH BASE ORIGINALES → newen/. Crear estructura de carpetas, PRIMORDIAL.md, WORKFLOW.md, logs/, spec/.

**Archivos previstos**: +30 archivos (estructura base completa).

**Resultado**: Éxito. 32 archivos creados en commit inicial. Estructura base completa.

**Archivos tocados**: 32 archivos (15 docs raíz + 16 spec + 1 manifest + package.json + .gitignore + logs).

**Commit**: `298f724`

**Próximo paso**: Paso 2 — ARCHITECTURE.md + BACKLOG.md + SECURITY.md + AGENTS.md

### [2026-06-21] — Auth: login, registro, privacidad y términos

**Prompt**: Crear pantallas de login y registro estilo Anima/Lex-AR adaptadas a Newen. Elaborar políticas de privacidad y términos y condiciones tomados de Lex-AR y adaptados.

**Acción esperada**: Crear `globals.css` con paleta Newen, `layout.tsx` con fuentes, pantallas de login/registro con card centrada, callback OAuth, políticas legales, home consultante.

**Archivos previstos**:
- `app/globals.css` (NUEVO)
- `app/layout.tsx` (NUEVO)
- `app/page.tsx` (NUEVO)
- `app/auth/login/page.tsx` (NUEVO)
- `app/auth/registro/page.tsx` (NUEVO)
- `app/auth/callback/route.ts` (NUEVO)
- `app/privacidad/page.tsx` (NUEVO)
- `app/terminos/page.tsx` (NUEVO)

**Resultado**: Éxito. 18 archivos creados. Login/registro con card centrada + toggle + Google OAuth. Privacidad (10 secciones) y Términos (11 secciones) adaptados del espíritu Lex-AR.

**Archivos tocados**: 18 archivos (8 pages/components + 5 config + 2 lib + 1 types + 1 log + .env.example).

**Commit**: `676c976`

**Próximo paso**: Sprint 1 — Configurar Supabase + ejecutar init_schema.sql + middleware de auth

### [2026-06-28] — v0.2.0: migración a spec v2 (precios, dólar blue, tope 10)

**Prompt**: Revisar NEWEN_PROMPT_EJECUTIVO_v2.md y newen_spec_negocio_v2.html. Aplicar todos los cambios de la spec v2 al código existente.

**Acción esperada**: Actualizar precios ($22→$18), schema SQL (+3 columnas, default 18, tope 10), crear integración dólar blue (lib/dolar.ts, hook, badge, API proxy), actualizar 14 archivos de documentación.

**Archivos previstos**: 18 archivos (4 nuevos, 14 modificados).

**Resultado**: Éxito. 20 archivos actualizados/creados. Push a github.com/ethereaconsultora/NEWEN exitoso.

**Archivos tocados**: 20 archivos (4 nuevos + 16 modificados).

**Commit**: `ab39abf` + `cdc4556`

**Próximo paso**: Sprint 1 — Ejecutar init_schema.sql en Supabase + Google OAuth + middleware de auth

### [2026-06-28] — Sprint 1: DB + Auth (Supabase schema + middleware)

**Prompt**: Ejecutar init_schema.sql v0.2.0 en Supabase, configurar Google OAuth, crear middleware.ts de protección por rol.

**Acción esperada**: Crear 10 tablas en Supabase, índices, RLS, políticas. Google OAuth provider. Middleware con redirección por rol (consultante/counselor/admin).

**Archivos previstos**:
- Supabase: ejecutar `spec/init_schema.sql` (NO es archivo del repo)
- `middleware.ts` (NUEVO)

**Resultado**: (en ejecución)

**Archivos tocados**: (COMPLETAR al finalizar)

**Commit**: (COMPLETAR al finalizar)

**Próximo paso**: Test de auth + inicio de pantallas de consultante

### [2026-06-28] — Ecosistema: acceso sin fricción + Magic Link + rutas públicas

**Prompt**: Actualizar según spec de ecosistema Newen + Espacio Crítico. Home y búsqueda de counselors públicos. Magic Link en vez de password. Sin barreras de acceso.

**Acción esperada**: Middleware con más rutas públicas. Auth con Magic Link. Home pública con buscador. Guardar spec de ecosistema.

**Archivos previstos**: `middleware.ts` (MOD), `app/auth/login/page.tsx` (MOD), `app/page.tsx` (MOD), `spec/ECOSISTEMA.md` (NUEVO)

**Resultado**: (en ejecución)

**Archivos tocados**: (COMPLETAR al finalizar)

**Commit**: (COMPLETAR al finalizar)

**Próximo paso**: Pantallas de consultante (buscar, perfil counselor)

### [2026-06-28] — Prompt v3: Magic Link dedicado + /explorar + WA link

**Prompt**: Leer NEWEN_PROMPT_EJECUTIVO_v3.md. Crear página Magic Link dedicada, actualizar middleware con /explorar, agregar WA link.

**Acción esperada**: `/auth/magic-link` (solo email), middleware +/explorar, .env +NEXT_PUBLIC_WA_LINK.

**Archivos previstos**: `app/auth/magic-link/page.tsx` (NUEVO), `middleware.ts` (MOD), `.env.local.example` (MOD)

**Resultado**: (en ejecución)

**Archivos tocados**: (COMPLETAR al finalizar)

**Commit**: (COMPLETAR al finalizar)

**Próximo paso**: Pantallas públicas: buscar, perfil counselor

### [2026-06-28] — Pantallas públicas: buscar counselors + perfil + API

**Prompt**: Seguir con el desarrollo. Crear /buscar y /counselor/[id] públicos, API de counselors, componentes visuales.

**Acción esperada**: API GET /api/counselors con filtros. Páginas buscar y perfil con diseño Newen. Componentes CounselorCard, Stars, CounselorListado.

**Archivos previstos**: 7 archivos nuevos (3 pages, 1 API, 3 components)

**Resultado**: (en ejecución)

**Archivos tocados**: (COMPLETAR al finalizar)

**Commit**: (COMPLETAR al finalizar)

**Próximo paso**: Reserva de sesión + pago Mercado Pago

### [2026-06-28] — Sprint 3: Reserva + Pago Mercado Pago + disponibilidad

**Prompt**: Crear flujo completo de reserva: calendario, creación de sesión, checkout Mercado Pago, webhook de confirmación.

**Acción esperada**: Página /reservar/[id] con calendario y slots. API sesiones. API pagos (preferencia + webhook). Tabla disponibilidad. Lib Mercado Pago.

**Archivos previstos**: 6 archivos nuevos + SQL

**Resultado**: (en ejecución)

**Archivos tocados**: (COMPLETAR al finalizar)

**Commit**: (COMPLETAR al finalizar)

**Próximo paso**: Videollamada Daily.co + evaluación post-sesión
