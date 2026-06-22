# Decisiones de Diseño — Newen

## DD-01 — Tres shells con Route Groups
**Decisión**: Usar Next.js Route Groups `(consultante)`, `(counselor)`, `(admin)`.
**Motivo**: Cada rol tiene su propio layout, navbar y densidad visual. Los route groups permiten layouts anidados sin afectar la URL.
**Alternativas**: Un solo layout con condicionales (descartado: código spaghetti). Apps separadas (descartado: over-engineering para MVP).

## DD-02 — Paleta custom, no temas Etherea
**Decisión**: Newen usa su propia paleta (verde oscuro + terracota) en vez de los temas A/B/C de Etherea.
**Motivo**: La identidad visual mapuche-humanista requiere colores específicos que transmiten calma, tierra y naturaleza. Los temas estándar de Etherea están pensados para apps de salud (Anima) y legales (Lex-AR).
**Consecuencia**: `globals.css` define variables CSS custom. No usa `data-theme`.

## DD-03 — PWA sin stores
**Decisión**: Distribución exclusiva vía PWA desde `buscanos.com.ar`. Sin App Store ni Google Play.
**Motivo**: Sin comisiones del 30%. Actualizaciones instantáneas. Control total de la experiencia. Alineado con la filosofía de no lucrar con la salud mental.
**Riesgo**: Usuarios iOS pueden no conocer el flujo "Agregar a pantalla de inicio". Mitigación: landing explica el proceso.

## DD-04 — Daily.co para videollamada
**Decisión**: Daily.co sobre alternativas (Zoom API, Whereby, Jitsi).
**Motivo**: SDK React nativo, sin descargas para el usuario, WebRTC, precios predecibles. Zoom API requiere app installation. Jitsi es open-source pero requiere self-hosting.
**Riesgo**: Costo escala con minutos. Mitigación: sesiones de 50 min máximo.

## DD-05 — Mercado Pago como único gateway de pago
**Decisión**: Mercado Pago (Checkout Pro + Webhooks). Sin Stripe.
**Motivo**: Argentina es el mercado inicial. Mercado Pago tiene mejor penetración que Stripe en LATAM. Checkout Pro maneja todo el flujo de pago.
**Riesgo**: Expansión internacional requeriría Stripe. Mitigación: abstraer lógica de pago en `lib/mercadopago.ts` para facilitar migración futura.

## DD-06 — Evaluación obligatoria antes de reservar
**Decisión**: El consultante NO puede reservar una nueva sesión si tiene una evaluación pendiente.
**Motivo**: Garantizar calidad de la comunidad. Sin evaluaciones, no hay autorregulación. La obligatoriedad asegura datos para todos los counselors.
**Riesgo**: Fricción para el usuario. Mitigación: la evaluación son 10 segundos (solo estrellas, comentario opcional).

## DD-07 — Fee único para counselors, gratuidad de por vida
**Decisión**: Counselors pagan $22 USD una sola vez al ingresar. Luego nunca más.
**Motivo**: Filosofía fundacional: la plataforma no debe lucrar con el trabajo de los counselors. El negocio está en el segmento corporativo, no en cobrar comisiones a profesionales de la salud.
**Riesgo**: Ingresos limitados si no hay empresas. Mitigación: modelo proyectado a 3 escenarios (mínimo, medio, escalado).

## DD-08 — Admin único (Clr. Ari Mangini)
**Decisión**: El rol `admin` es hardcodeado para un solo email (`ADMIN_EMAIL` en `.env`).
**Motivo**: Control total del fundador sobre quién entra a la plataforma. Las decisiones de aceptación de counselors y sponsors son personales e intransferibles.
**Riesgo**: Single point of failure. Mitigación: el admin puede delegar tareas operativas a futuro si es necesario.

## DD-09 — Counselor no sabe si la sesión es corporativa
**Decisión**: El tipo de sesión (individual vs corporativa) es transparente para el counselor. Siempre cobra, solo varía el monto ($22 vs $35).
**Motivo**: Evitar sesgos. El counselor trata a todos los consultantes igual, sin distinguir si vienen de empresa o particular.
