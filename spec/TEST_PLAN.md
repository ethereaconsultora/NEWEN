# Plan de Testing — Newen

## Estrategia

Testing manual para MVP. Automatización post-MVP.

## Niveles

| Nivel | Alcance | Herramienta |
|---|---|---|
| Unitario | Funciones de validación, cálculo de precios | Vitest (futuro) |
| Integración | API endpoints + Supabase | Thunder Client / Postman |
| E2E | Flujos completos de usuario | Playwright (futuro) |
| Manual | UX, PWA, videollamada | Navegador + dispositivo real |

## Test Cases críticos

### TC-01 — Registro y login
1. Registrar nuevo consultante (email + password) → éxito, redirige a home.
2. Login con Google OAuth → éxito, redirige a shell correcto.
3. Login con credenciales inválidas → mensaje de error, sin redirección.
4. Consultante intenta acceder a `/panel` → redirigido a `/`.
5. Counselor intenta acceder a `/admin` → redirigido a `/panel`.

### TC-02 — Búsqueda de counselors
1. Buscar "ansiedad" → al menos 1 resultado si hay counselors con esa especialidad.
2. Filtrar por "online" → solo counselors con modalidad online o ambas.
3. Filtrar por provincia → solo counselors de esa provincia.
4. Sin resultados → mensaje "No encontramos counselors".

### TC-03 — Reserva y pago
1. Seleccionar horario disponible → redirige a Mercado Pago.
2. Pago exitoso (test) → sesión cambia a "confirmada", se crea sala Daily.
3. Pago fallido → mensaje de error, sesión no se confirma.
4. Horario ya tomado → no se puede seleccionar.

### TC-04 — Evaluación
1. Sesión finalizada → al entrar a la app, modal de evaluación.
2. Evaluar 3 estrellas → registrado en DB.
3. Sin evaluar → intentar reservar → bloqueado con mensaje.
4. Evaluación completada → puede reservar de nuevo.

### TC-05 — Videollamada
1. Entrar a sesión en horario → sala Daily.co carga.
2. Video y audio del otro participante visible.
3. Salir de la sala → sesión sigue en curso hasta que counselor la finaliza.

### TC-06 — Panel counselor
1. Dashboard muestra métricas correctas.
2. Agenda permite agregar/quitar horarios.
3. Próximas sesiones visibles.

### TC-07 — PWA
1. Chrome Android → "Agregar a pantalla de inicio" disponible.
2. Instalar → abre en standalone, sin barra del navegador.
3. Icono y splash screen correctos.
4. Safari iOS → "Agregar a pantalla de inicio" disponible.

## Datos de prueba

| Recurso | Dato |
|---|---|
| Counselor test | `test+counselor@newen.app` |
| Consultante test | `test+consultante@newen.app` |
| Tarjeta MP test | `5031 7557 3453 0604` (Mastercard test) |
| Daily.co test room | API key de sandbox |
