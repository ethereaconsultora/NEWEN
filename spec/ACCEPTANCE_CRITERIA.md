# Criterios de Aceptación — Newen

## AC-01 — Búsqueda de counselors
- [ ] Home muestra preguntas guía para búsqueda por situación.
- [ ] Al escribir "ansiedad", aparecen counselors con esa especialidad.
- [ ] Filtros por modalidad y provincia funcionan.
- [ ] Cards muestran: foto, nombre, estrellas, especialidades (máx 3 tags).
- [ ] Sin counselors para un filtro → mensaje: "No encontramos counselors para esta búsqueda. Probá con otros filtros."

## AC-02 — Perfil de counselor
- [ ] Muestra foto (o avatar default), nombre, provincia.
- [ ] Badge "AAC Verificado" visible si `aac_verificado = true`.
- [ ] Estrellas visibles (ej: ★★★★☆ 4.2).
- [ ] Tags de especialidades.
- [ ] Bio y enfoque legibles.
- [ ] Botón "Reservar sesión" funcionando.

## AC-03 — Reserva de sesión
- [ ] Calendario muestra solo días/horarios disponibles.
- [ ] No se puede reservar un horario ya tomado.
- [ ] Precio visible: $22 USD.
- [ ] Redirección a Mercado Pago funciona.
- [ ] Sesión cambia a "confirmada" tras webhook exitoso.
- [ ] Consultante ve confirmación con fecha, hora, counselor, link.

## AC-04 — Pago
- [ ] Checkout Pro de Mercado Pago carga correctamente.
- [ ] Webhook recibe notificación y actualiza estado.
- [ ] Pago fallido → sesión no se confirma, mensaje de error.
- [ ] Pago exitoso → se crea sala Daily.co automáticamente.

## AC-05 — Videollamada
- [ ] Sala Daily.co se carga embebida en la app.
- [ ] Video y audio funcionan.
- [ ] No requiere instalar nada (WebRTC).
- [ ] Counselor puede marcar sesión como "finalizada".
- [ ] Al finalizar, se dispara evaluación.

## AC-06 — Evaluación post-sesión
- [ ] Modal aparece al entrar a la app si hay sesión sin evaluar.
- [ ] Estrellas 1-5 clickeables.
- [ ] Comentario opcional.
- [ ] No se puede reservar nueva sesión sin evaluar la anterior.
- [ ] Evaluación registrada en DB.

## AC-07 — Panel counselor
- [ ] Dashboard muestra: sesiones del mes, ingresos estimados, promedio.
- [ ] Agenda permite marcar días/horarios disponibles.
- [ ] Próximas sesiones visibles con nombre del consultante y horario.
- [ ] Espacio colaborativo accesible.

## AC-08 — Postulación counselor
- [ ] Formulario público accesible desde landing.
- [ ] Todos los campos obligatorios validados.
- [ ] Email único (no se puede postular dos veces con mismo email).
- [ ] Postulación aparece en panel admin como "recibida".

## AC-09 — Admin
- [ ] Puede ver lista de postulaciones y cambiar estado.
- [ ] Puede ver métricas globales (sesiones, counselors, ingresos).
- [ ] Puede crear/editar empresas.
- [ ] Puede suspender counselors.

## AC-10 — PWA
- [ ] "Agregar a pantalla de inicio" funciona en Android e iOS.
- [ ] App abre en modo standalone (sin barra del navegador).
- [ ] Icono y nombre correctos.
- [ ] Splash screen con color de fondo #0c1810.
