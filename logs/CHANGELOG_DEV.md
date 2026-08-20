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

### [2026-08-20] — fix: sala 1-1 — reemplazar daily-js por iframe Prebuilt

**Prompt**: Tras el fix anterior, daily-js seguía fallando: "No se pudo iniciar la videollamada:
error desconocido" (la sala sí se creaba bien).

**Causa**: daily-js crea el iframe insertándolo manualmente en un `<div>` que React también
gestiona; el re-render de React borra el iframe y `join()` falla.

**Acción esperada**: Reemplazar daily-js por el iframe Prebuilt (URL `https://<dominio>/prebuilt?
roomUrl=...` generada por la API con el origen derivado de la URL de la sala), renderizado por
React directamente. Desinstalar `@daily-co/daily-js`.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK (sala 1-1 vuelve a ~2 kB).

**Archivos tocados**:
- `app/(counselor)/panel/sala-1-1/page.tsx` (RECREADO — iframe Prebuilt)
- `package.json` (sin `@daily-co/daily-js`)

**Commit**: por registrar

**Próximo paso**: probar la sala 1-1 tras el deploy.

### [2026-08-20] — fix: sala 1-1 Daily.co — "The meeting you're trying to join does not exist"

**Prompt**: Al crear la sala 1-1 desde el perfil profesional, Daily muestra "The meeting you're trying
to join does not exist".

**Acción esperada**: (1) Derivar el origen del iframe Prebuilt de la URL que devuelve la API (evita
desajuste de dominio), `privacy: public`, y solo requerir `DAILY_API_KEY`. (2) Migrar la sala 1-1 a
daily-js (`createFrame()` + `join({ url })`), la vía oficial recomendada, con el nombre del profesional.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK (sala 1-1 usa daily-js).

**Archivos tocados**:
- `app/api/daily/room/route.ts` (MODIFICADO — origen derivado + privacy public)
- `app/(counselor)/panel/sala-1-1/page.tsx` (RECREADO — daily-js)
- `package.json` (+`@daily-co/daily-js`)

**Commit**: por registrar

**Próximo paso**: probar la sala 1-1 tras el deploy.

### [2026-08-20] — fix: URL Daily.co duplicada + ojo de vuelta al espacio empresa

**Prompt**: (1) Desde la página pública no se podía volver al espacio empresa; se quiere un "ojo" de
vista clientes que al activarse/desactivarse devuelva al espacio empresa. (2) Al crear la sala 1-1
la URL de Daily queda `newen.daily.co.daily.co/prebuilt...` (dominio duplicado).

**Acción esperada**: Normalizar el dominio en `/api/daily/room` (acepta `newen`, `newen.daily.co` o
URL completa); componente flotante `OjoVistaEmpresa` en `/e/[slug]` visible solo para el dueño/miembro
que navega a `/empresa`.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK.

**Archivos tocados**:
- `app/api/daily/room/route.ts` (MODIFICADO — normalización del dominio)
- `components/empresa/OjoVistaEmpresa.tsx` (NUEVO)
- `app/e/[slug]/page.tsx` (MODIFICADO)

**Commit**: por registrar

**Próximo paso**: probar la sala 1-1 (URL correcta) y el ojo en `/e/espacio-critico`.

### [2026-08-20] — feat: v0.37.0 — Campus digital real + videollamadas (Jitsi grupal / Daily 1-1)

**Prompt**: Diseñar el campus según la maqueta y la necesidad de videollamada: Daily.co para el
área profesionales (1-1) y Jitsi Meet + OBS en servidores pagos para el campus. ¿Qué conviene hacer
ahora? Se acuerda el Paso 1 completo (campus real + salas, sin infraestructura paga).

**Acción esperada**: Schema `campus_*` con RLS; `/empresa/campus` real (diseño de maqueta, nav
lateral); salas Jitsi (grupal) y Daily.co (1-1); `/api/daily/room`; tab "Sala 1-1" en /panel.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK. RLS intacto.

**Archivos tocados**:
- `spec/init_v0.37.0_campus.sql` (NUEVO)
- `app/(empresa)/empresa/campus/page.tsx` (RECREADO)
- `app/(empresa)/empresa.module.css` (MODIFICADO)
- `app/api/daily/room/route.ts` (NUEVO)
- `app/(counselor)/panel/sala-1-1/page.tsx` (NUEVO)
- `app/(counselor)/layout.tsx` (MODIFICADO)

**Commit**: por registrar

**Próximo paso**: ejecutar `init_v0.37.0_campus.sql` en Supabase; configurar
`NEXT_PUBLIC_DAILY_DOMAIN` + `DAILY_API_KEY` (y `NEXT_PUBLIC_JITSI_BASE`). Fase 2: Jitsi en Hetzner
+ OBS/streaming en DigitalOcean.

### [2026-08-20] — fix: v0.36.0 — recursión infinita en RLS de organization_members

**Prompt**: `Error al cargar: infinite recursion detected in policy for relation
"organization_members"` al dar de alta un cliente en /empresa.

**Acción esperada**: Corregir la política `members_read_own` que se autoreferenciaba dentro de su
propio `SELECT`. Sin desactivar RLS.

**Resultado**: Éxito (SQL). RLS intacto.

**Archivos tocados**:
- `spec/init_v0.36.0_fix_rls_recursion.sql` (NUEVO)
- `spec/init_v0.27.0_empresas.sql` (MODIFICADO — política corregida)

**Commit**: `1c02cd8`

**Próximo paso**: ejecutar `init_v0.36.0_fix_rls_recursion.sql` en Supabase y volver a dar de alta
un cliente.

### [2026-08-19] — fix: v0.35.0 — restaurar menús del panel Empresa + mostrar logo/banner

**Prompt**: (1) No muestra el banner ni el logo del espacio creado. (2) Le faltan "mil menús" que
estaban desarrollados en la maqueta. (3) Terminantemente prohibido quitar cualquier RLS de la base.

**Acción esperada**: Reescribir el dashboard con las 6 pestañas de la maqueta + archivados +
mensajería interna + informes PDF; mostrar logo/banner en vidriera, panel y sitio público; modo
edición del espacio con errores de subida visibles; `PATCH /api/organizations`. Sin tocar RLS.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK. RLS intacto.

**Archivos tocados**:
- `app/(empresa)/empresa/page.tsx` (RECREADO)
- `app/(empresa)/empresa.module.css` (MODIFICADO)
- `app/empresas/page.tsx` (MODIFICADO)
- `app/empresas/crear/page.tsx` (MODIFICADO)
- `app/api/organizations/route.ts` (MODIFICADO — PATCH)

**Commit**: `6e725a5`

**Próximo paso**: probar `/empresa` y re-subir logo/banner desde "🖼 Editar mi espacio" si quedaron
sin guardar en el alta original.

### [2026-08-19] — fix: detectar organización del usuario vía API (service role)

**Prompt**: El panel `/empresa` seguía mostrando "Sin organización vinculada" pese a que el
usuario era miembro (el lookup client-side con RLS podía dar falso negativo).

**Acción esperada**: Nueva `GET /api/organizations/mine` que devuelve la organización del usuario
con service role; el dashboard pasa a usarla.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK.

**Archivos tocados**:
- `app/api/organizations/mine/route.ts` (NUEVO)
- `app/(empresa)/empresa/page.tsx` (MODIFICADO)

**Commit**: `b76c2a7`

**Próximo paso**: Probar `/empresa` tras el deploy.

### [2026-08-19] — fix: slug existente + usuario miembro → redirigir en vez de 409

**Prompt**: `409 "slug ya está en uso"` al crear el espacio, cuando en realidad el usuario ya era
miembro de esa organización.

**Acción esperada**: En `POST /api/organizations`, si el slug ya existe y el usuario es miembro,
devolver `{ok, already}` y redirigir a `/empresa` en vez de devolver error.

**Resultado**: Éxito.

**Archivos tocados**: `app/api/organizations/route.ts`, `app/empresas/crear/page.tsx`.

**Commit**: `a2baebb`

**Próximo paso**: Probar el alta con un slug ya existente.

### [2026-08-19] — feat: logo de Newen en hub/login/magic-link

**Prompt**: Usar el logo de Newen adjunto (`logo-hd.jpg`).

**Acción esperada**: Componente `LogoNewen` (imagen con fallback a texto) aplicado al hub, login
y magic-link; archivo copiado a `public/logo-newen.jpg`.

**Resultado**: Éxito.

**Archivos tocados**: `components/LogoNewen.tsx`, `app/page.tsx`, `app/auth/login/page.tsx`,
`app/auth/magic-link/page.tsx`, `public/logo-newen.jpg`.

**Commit**: `ce70a83`

**Próximo paso**: Verificar que el logo se vea en el hub.

### [2026-08-19] — fix: botón "Crear mi espacio" cuando no hay organización vinculada

**Prompt**: En el estado "Sin organización vinculada" del panel faltaba el botón para crear el
espacio.

**Acción esperada**: Agregar el botón "+ Crear mi espacio" (link a `/empresas/crear`) y "Ver la
vidriera" en el estado vacío del panel.

**Resultado**: Éxito.

**Archivos tocados**: `app/(empresa)/empresa/page.tsx`.

**Commit**: `c71e0bc`

**Próximo paso**: Probar el alta desde el botón.

### [2026-08-19] — feat: v0.33.0 + v0.34.0 — apariencia global + rediseño alta empresa

**Prompt**: (1) Arreglar que la apariencia de Anima no persiste y aplicarla a todo el perfil,
sacándola del consultorio a un menú general de la barra. (2) Rediseñar el alta de empresa: subir
imágenes de logo/banner, slogan, servicios escribibles, paleta/tipografía/tamaño de Anima.
(3) Usar el logo de Newen adjunto.

**Acción esperada**: policy UPDATE en users + trigger anti-escalación; ThemeProvider movido al
shell counselor; nueva página `/panel/apariencia`; alta de empresa con storage, slogan y
apariencia; componente `LogoNewen`.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK.

**Archivos tocados**:
- `spec/init_v0.33.0_apariencia_global.sql` (NUEVO)
- `spec/init_v0.34.0_empresas_storage.sql` (NUEVO)
- `app/(counselor)/layout.tsx` (RECREADO — ThemeProvider global)
- `app/(counselor)/panel/apariencia/page.tsx` (NUEVO)
- `app/(counselor)/panel/consultorio/layout.tsx` + `ajustes/page.tsx` (MODIFICADOS)
- `app/empresas/crear/page.tsx` (RECREADO — uploads/slogan/apariencia)
- `app/e/[slug]/page.tsx` (RECREADO — slogan/font/logo/banner)
- `app/api/organizations/route.ts` (MODIFICADO)
- `components/LogoNewen.tsx` (NUEVO) + hub/login/magic-link

**Commit**: `0955f69`

**Próximo paso**: Ejecutar v0.33.0 y v0.34.0 en Supabase; guardar el logo como
`public/logo-newen.png`; probar alta y apariencia.

### [2026-08-17] — fix: v0.32.0 — alta de organización vía API (crea o reclama)

**Prompt**: Error al crear: duplicate key value violates unique constraint "organizations_slug_key".

**Acción esperada**: Nueva API `/api/organizations` que crea la organización + membresía con
service role, y si el slug ya existe pero está huérfano (sin miembros), lo "reclama" para el
usuario. El onboarding deja de hacer inserts directos y usa esta API.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK (ruta `/api/organizations`).

**Archivos tocados**:
- `app/api/organizations/route.ts` (NUEVO)
- `app/empresas/crear/page.tsx` (MODIFICADO — usa la API)

**Commit**: `7c3edb9`

**Próximo paso**: Probar el alta y el reclamo del espacio demo.

### [2026-08-17] — feat: v0.31.0 — login con contraseña para EMPRESA/PROFESIONAL, sin ADMIN en el hub

**Prompt**: No quiero más el magic link para esto. Quiero el login con contraseña tanto para
EMPRESA como para PROFESIONAL. Sacá el ADMIN del hub (por ahora solo yo; después vemos cómo
asigno otro admin).

**Acción esperada**: Quitar ADMIN del hub; botones EMPRESA/PROFESIONAL llevan a `/auth/login`
con redirect; el login respeta el destino; middleware manda `/panel`, `/empresa` y `/admin` al
login con contraseña (el consultante conserva magic link).

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK.

**Archivos tocados**: `app/page.tsx`, `app/auth/login/page.tsx`, `middleware.ts`.

**Commit**: `4f6f4d7`

**Próximo paso**: Probar login con contraseña desde el hub para ambas áreas.

### [2026-08-17] — feat: v0.30.0 — hub de acceso en la home (EMPRESA / PROFESIONAL / ADMIN)

**Prompt**: Sigo ingresando desde el mismo lugar y caigo en Profesional; al poner /empresa me
manda a magic link y vuelve a profesional. No tengo acceso a la página principal. Quiero que
todos los logins se generen en la página principal con botones grandes y claros EMPRESA y
PROFESIONAL, según rol o suscripción.

**Acción esperada**: Convertir `/` en un hub con botones grandes por área (según rol), quitar
el redirect automático de `/`, y que el magic-link/callback respeten el destino elegido.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK.

**Archivos tocados**:
- `app/page.tsx` (RECREADO — hub)
- `middleware.ts` (MODIFICADO)
- `app/auth/callback/route.ts` (MODIFICADO)
- `app/auth/magic-link/page.tsx` (MODIFICADO)

**Commit**: `b14e2f4`

**Próximo paso**: Probar el flujo de acceso por botón y ajustar estilos.

### [2026-08-17] — feat: v0.29.0 — logo/banner + vista previa en el onboarding

**Prompt**: "Seguimos en ese orden" → paso 1 de los próximos pasos: logo/banner +
previsualización en el onboarding de organizaciones.

**Acción esperada**: Columnas `logo_url`, `cover_url`, `cover_gradient` en `organizations`;
en el onboarding, selector de banner (degradés curados), logo por iniciales + color, y una
vista previa en vivo del espacio. La página pública usa `cover_gradient`.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK.

**Archivos tocados**:
- `spec/init_v0.29.0_empresas_apariencia.sql` (NUEVO)
- `app/empresas/crear/page.tsx` (RECREADO)
- `app/e/[slug]/page.tsx` (MODIFICADO)

**Commit**: `534c220`

**Próximo paso**: Subida real de logo/banner a Storage, luego pago del plan.

### [2026-08-17] — feat: v0.28.0 — vidriera pública + onboarding de organizaciones

**Prompt**: Pausa. Hacer el registro/onboarding de organizaciones para poder crear desde cero
una "página empresa" (como perfiles en Shopify). ¿Desde dónde se carga? Hace falta una página
principal que sea la vidriera de esas ventas; hacer ese paso primero si no está.

**Acción esperada**: Página pública `/empresas` (vidriera con todos los espacios activos) y
onboarding `/empresas/crear` (formulario que crea `organizations` + `organization_members`
y redirige a `/empresa`). Policies INSERT para organizaciones y miembros.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK (rutas `/empresas` y
`/empresas/crear`).

**Archivos tocados**:
- `app/empresas/page.tsx` (NUEVO)
- `app/empresas/crear/page.tsx` (NUEVO)
- `middleware.ts` (MODIFICADO)
- `spec/init_v0.27.0_empresas.sql` (MODIFICADO — policies INSERT)

**Commit**: `7d46114`

**Próximo paso**: Probar el alta de un espacio y ajustar el onboarding (pago, logo, banner).

### [2026-08-17] — feat: acceso a /empresa con la misma cuenta (sin cambiar rol)

**Prompt**: ¿Por dónde accedo al área empresas? ¿Puedo usar el mismo mail de counselor/admin?
¿Lo cargo en el SQL v27?

**Acción esperada**: Detectar el acceso a Empresa por membresía en `organization_members`
(sin exigir `rol = 'empresa'`), sumar el segmento "Empresa" al switch de rol y ajustar el
comentario del SQL para no requerir cambio de rol.

**Resultado**: Éxito. `npx tsc --noEmit` y `npm run build` OK. El acceso a /empresa
ahora se habilita por membresía en `organization_members` (misma cuenta counselor/admin/empresa)
y el switch de rol suma el segmento "Empresa".

**Archivos tocados**: `middleware.ts`, `app/auth/callback/route.ts`,
`hooks/useEsMultiRol.ts`, `components/RoleSwitch.tsx`, `app/(counselor)/layout.tsx`,
`app/(admin)/layout.tsx`, `spec/init_v0.27.0_empresas.sql`.

**Commit**: `63fe9f6`

**Próximo paso**: Ejecutar el SQL, insertar la membresía y acceder a /empresa.

### [2026-08-17] — fix: v0.27.0 — colisión de nombre `derivaciones` en la migración

**Prompt**: Error al correr `init_v0.27.0_empresas.sql`: `42703: column
derivaciones.organization_id does not exist`.

**Acción esperada**: La tabla `derivaciones` ya existía (v0.15.0, derivaciones entre
counselors). Renombrar las tablas nuevas a `organization_derivaciones` y
`organization_mensajes`, limpiar la tabla huérfana `mensajes` y hacer las policies
idempotentes (`DROP POLICY IF EXISTS`) para poder re-ejecutar el script.

**Resultado**: Éxito. Migración corregida (tablas `organization_derivaciones` y
`organization_mensajes`, limpieza de `mensajes` huérfana, policies idempotentes con
`DROP POLICY IF EXISTS`). `npx tsc --noEmit` limpio.

**Archivos tocados**: `spec/init_v0.27.0_empresas.sql`, `app/(empresa)/empresa/page.tsx`.

**Commit**: `73fadd0`

**Próximo paso**: Re-ejecutar la migración en Supabase.

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

**Commit**: `06cb8a1`

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
