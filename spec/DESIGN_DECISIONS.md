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
**Decisión**: Counselors pagan $18 USD una sola vez al ingresar. Luego nunca más.
**Motivo**: Filosofía fundacional: la plataforma no debe lucrar con el trabajo de los counselors. El negocio está en el segmento corporativo, no en cobrar comisiones a profesionales de la salud.
**Riesgo**: Ingresos limitados si no hay empresas. Mitigación: modelo proyectado a 3 escenarios (lanzamiento, mes 3, año 1).

## DD-08 — Admin único (Clr. Ari Mangini)
**Decisión**: El rol `admin` es hardcodeado para un solo email (`ADMIN_EMAIL` en `.env`).
**Motivo**: Control total del fundador sobre quién entra a la plataforma. Las decisiones de aceptación de counselors y sponsors son personales e intransferibles.
**Riesgo**: Single point of failure. Mitigación: el admin puede delegar tareas operativas a futuro si es necesario.

## DD-09 — Counselor siempre cobra $18 USD
**Decisión**: El counselor recibe $18 USD por sesión, sin importar si es individual o corporativa. No sabe el origen del consultante.
**Motivo**: Horizontalidad total. Evitar sesgos. El counselor trata a todos los consultantes igual.
**Consecuencia**: La diferencia entre lo que paga la empresa ($230/mes base) y lo que recibe el counselor ($18/sesión × 2 sesiones × empleado) es ganancia de Newen.

## DD-10 — Tope máximo de 10 counselors
**Decisión**: Newen arranca con un máximo de 10 counselors verificados activos.
**Motivo**: Garantizar trabajo real para cada profesional. No repetir el anti-modelo de "cientos de counselors sin sesiones". La calidad de la comunidad es el producto.
**Consecuencia**: Validación en API + trigger SQL. El tope se revisa cuando la demanda lo justifique.

## DD-11 — Dólar blue en tiempo real
**Decisión**: Todos los precios se fijan en USD. El equivalente ARS se muestra usando la cotización del dólar blue vía dolarapi.com.
**Motivo**: Argentina tiene múltiples tipos de cambio. El dólar blue es la referencia real para transacciones. La API es pública y gratuita.
**Consecuencia**: Se crea `lib/dolar.ts` (helper), `hooks/useDolar.ts` (hook React), `DolarBadge.tsx` (componente visual), y `api/dolar/route.ts` (proxy para evitar CORS). Fallback: $1515 ARS si la API falla.
**Riesgo**: La cotización cambia minuto a minuto. El precio en ARS es orientativo. Mitigación: se muestra "≈ aproximado" y el cargo real es en USD.
