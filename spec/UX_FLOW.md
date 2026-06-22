# UX Flow — Newen

## Usuarios clave
- **Consultante**: persona buscando ayuda emocional/psicológica.
- **Counselor**: profesional verificado.
- **Admin**: fundador (Clr. Ari Mangini).

## Principios de diseño
- **Claridad**: lenguaje simple, sin jerga técnica.
- **Calma**: paleta oscura terrosa, tipografía serif humanista.
- **Seguridad**: el consultante siempre sabe dónde está y qué va a pasar.
- **Feedback**: cada acción tiene confirmación visual.
- **Consistencia**: mismos patrones en los 3 shells.

---

## Flujo 1 — Consultante busca y reserva

```
Home (búsqueda por situación)
  → Escribe "ansiedad"
  → Listado de counselors filtrado
  → Toca una card
  → Perfil completo del counselor
  → Toca "Reservar sesión"
  → Calendario con horarios disponibles
  → Selecciona día + hora
  → Confirma → va a Mercado Pago
  → Paga → vuelve a Newen
  → Pantalla de confirmación: fecha, hora, counselor, link sesión
```

## Flujo 2 — Consultante tiene su sesión

```
Mi Cuenta (o notificación)
  → Entra a la sesión en el horario
  → Videollamada Daily.co embebida
  → 50 minutos de sesión
  → Counselor finaliza
  → Consultante vuelve a home
  → Modal: "¿Cómo fue tu sesión con [Nombre]?"
  → 1-5 estrellas + comentario opcional
  → Evalúa → puede reservar de nuevo
```

## Flujo 3 — Counselor se postula

```
Landing (buscanos.com.ar)
  → "¿Sos counselor?"
  → Formulario: datos + especialidades + AAC + enfoque
  → Envía
  → "Gracias. Nos pondremos en contacto."
  → Admin recibe notificación
  → Admin agenda entrevista
  → Videollamada de entrevista
  → Admin aprueba
  → Counselor paga fee único ($22 USD)
  → Acceso a /panel
```

## Flujo 4 — Counselor gestiona su práctica

```
Panel (dashboard)
  → Ve métricas: sesiones del mes, ingresos, estrellas
  → Ve próximas sesiones del día
  → Va a Agenda → marca disponibilidad
  → Va a Colaborativo → deriva o consulta con colegas
  → Va a Talleres → crea/edita talleres
  → Va a Perfil → edita bio, foto, especialidades
```

## Flujo 5 — Admin gestiona

```
Admin Panel
  → Métricas globales
  → Postulaciones pendientes → agenda entrevista
  → Entrevista por videollamada → aprueba/rechaza
  → Counselors activos → puede suspender
  → Empresas → da de alta, pausa, gestiona
```

---

## Notas de UI

### Shell consultante
- Navbar inferior: 🔍 Buscar · 📅 Sesiones · 👤 Cuenta
- Home: pregunta abierta "¿Qué te está pasando?" con chips de sugerencias.
- Cards de counselor: foto circular, nombre, ⭐, 3 tags máx.
- Sin métricas. Sin complejidad.

### Shell counselor
- Navbar inferior: 📊 Panel · 📅 Agenda · 🤝 Comunidad · 👤 Perfil
- Dashboard: KPIs grandes, próximas sesiones en lista.
- Densidad media. Información accionable.

### Shell admin
- Navbar completa (no bottom nav, sidebar o top tabs).
- Densidad alta. Tablas, métricas, acciones masivas.

### Botón de crisis
- Visible en home del consultante.
- No reemplaza líneas de ayuda profesional (098 123 123 en Uruguay, 135 en Argentina).
- Redirige a counselors disponibles AHORA (si los hay) o muestra líneas de ayuda.
