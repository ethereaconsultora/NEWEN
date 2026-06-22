# Casos de Uso — Newen

## UC-01 — Buscar counselor

**Actor**: Consultante
**Precondición**: Ninguna (público)
**Flujo principal**:
1. Consultante llega a la home.
2. Ve preguntas guía: "¿Qué te está pasando?" / "¿Cómo te sentís?"
3. Escribe o selecciona una situación (ansiedad, duelo, pareja, trabajo, etc.).
4. El sistema muestra counselors que atienden esa temática.
5. Puede filtrar por modalidad (online/presencial), provincia, enfoque.
6. Ve cards con foto, nombre, estrellas, especialidades.
7. Toca una card → va al perfil completo.
**Postcondición**: Consultante ve listado filtrado de counselors.

## UC-02 — Ver perfil de counselor

**Actor**: Consultante
**Precondición**: Llegó desde búsqueda o link directo.
**Flujo principal**:
1. Ve foto, nombre, provincia, años de experiencia.
2. Bio, enfoque, especialidades (tags).
3. Promedio de estrellas (1-5) y cantidad de sesiones.
4. Modalidad (online, presencial, ambas).
5. Verificación AAC visible (badge).
6. Botón "Reservar sesión".
**Postcondición**: Consultante decide si reserva.

## UC-03 — Reservar sesión

**Actor**: Consultante
**Precondición**: Autenticado como consultante. Perfil de counselor visto.
**Flujo principal**:
1. Ve calendario con días/horarios disponibles del counselor.
2. Selecciona día y hora.
3. Elige modalidad (online/presencial).
4. Ve precio: $22 USD.
5. Redirige a Mercado Pago (Checkout Pro).
6. Pago exitoso → webhook confirma → sesión cambia a "confirmada".
7. Se crea sala de Daily.co.
8. Consultante ve pantalla de confirmación con datos de la sesión.
**Flujo alternativo**: Pago falla → mensaje de error, puede reintentar.
**Postcondición**: Sesión reservada y confirmada.

## UC-04 — Videollamada

**Actor**: Consultante o Counselor
**Precondición**: Sesión en estado "confirmada" o "en_curso". Horario correcto.
**Flujo principal**:
1. Usuario entra a la pantalla de sesión.
2. Ve sala de Daily.co embebida.
3. Se conecta con video y audio.
4. Al finalizar, el counselor marca sesión como "finalizada".
**Postcondición**: Sesión finalizada. Se dispara solicitud de evaluación.

## UC-05 — Evaluar sesión

**Actor**: Consultante
**Precondición**: Sesión finalizada. No hay evaluación pendiente de otra sesión.
**Flujo principal**:
1. Al entrar a la app, ve modal: "¿Cómo fue tu sesión con [Nombre]?"
2. Selecciona 1-5 estrellas.
3. Opcional: escribe comentario.
4. Confirma.
5. Se libera la posibilidad de reservar nueva sesión.
**Flujo alternativo**: Intenta reservar sin evaluar → mensaje: "Primero evaluá tu sesión anterior."
**Postcondición**: Evaluación registrada. Consultante puede reservar de nuevo.

## UC-06 — Postularse como counselor

**Actor**: Counselor (no verificado)
**Precondición**: Ninguna (público)
**Flujo principal**:
1. Entra a formulario de postulación (desde landing o app).
2. Completa: nombre, apellido, email, WhatsApp, provincia, especialidades, modalidad, enfoque, estado AAC.
3. Adjunta constancia AAC o declara estado.
4. Envía.
5. Admin recibe notificación.
**Postcondición**: Postulación en estado "recibida". Admin la revisa.

## UC-07 — Entrevista (admin)

**Actor**: Admin
**Precondición**: Postulación en estado "recibida".
**Flujo principal**:
1. Admin ve postulación.
2. Cambia estado a "entrevista_pendiente".
3. Coordina fecha/hora con el postulante (fuera de la app por ahora).
4. En la fecha, admin y postulante entran a videollamada de entrevista.
5. Admin aprueba o rechaza.
6. Si aprueba: counselor paga fee único ($22 USD) → estado "activo".
**Postcondición**: Counselor activo o rechazado.

## UC-08 — Dashboard counselor

**Actor**: Counselor
**Precondición**: Autenticado, estado "activo".
**Flujo principal**:
1. Ve métricas: sesiones del mes, ingresos estimados, promedio de estrellas.
2. Ve próximas sesiones (hoy y esta semana).
3. Accede a agenda, colaborativo, talleres, perfil.
**Postcondición**: Counselor informado.

## UC-09 — Newen Workplace (empresa)

**Actor**: Admin
**Precondición**: Empresa interesada.
**Flujo principal**:
1. Admin da de alta empresa: nombre, contacto, cantidad empleados.
2. Sistema calcula precio: $200 base + $20 por empleado extra.
3. Empresa recibe link de pago o factura (manual por ahora).
4. Admin activa empresa.
5. Empleados se registran con email corporativo → vinculados a la empresa.
6. Empleados reservan sesiones → precio corporativo ($35 USD).
**Postcondición**: Empresa activa, empleados pueden reservar.
