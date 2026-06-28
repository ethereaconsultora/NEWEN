# Contexto Primordial — Newen

## Propósito
Definir en menos de 200 líneas el contexto esencial de Newen: qué es, por qué existe, para quién es y cómo debe funcionar.

## Visión general
Newen (mapuche: "fuerza, espíritu, energía vital") es una plataforma que conecta personas que atraviesan momentos difíciles con counselors humanistas verificados. Es una red social profesional para counselors y un espacio seguro para consultantes.

## Problema a resolver
Las personas en crisis emocional o psicológica necesitan encontrar ayuda profesional verificada de forma rápida, segura y sin fricción. Los counselors necesitan una plataforma ética donde ejercer sin comisiones abusivas ni intermediarios que lucren con la salud mental.

## Usuarios principales
- **Consultante individual**: busca acompañamiento profesional. Acceso gratuito a búsqueda. Paga $18 USD por sesión.
- **Counselor verificado**: profesional con verificación AAC. Fee único de ingreso ($18 USD). Gratuidad de por vida. Tope inicial de 10.
- **Admin (Clr. Ari Mangini)**: fundador. Único con acceso total. Aprueba counselors, sponsors y gestiona la plataforma.
- **Empresa (Newen Workplace)**: ofrece Newen como beneficio a empleados. Membresía desde $230 USD/mes (base 5 empleados).

## Qué hace la app
- Búsqueda de counselors por situación, especialidad, enfoque y modalidad.
- Perfiles completos de counselors con verificación AAC y promedio de estrellas.
- Reserva de sesiones con pago integrado (Mercado Pago).
- Videollamada integrada (Daily.co).
- Precios en USD con equivalente ARS en tiempo real (dolarapi.com).
- Evaluación obligatoria post-sesión (1-5 estrellas).
- Panel profesional para counselors (agenda, métricas, espacio colaborativo).
- Panel admin para gestión de postulaciones, entrevistas y métricas globales.
- Comunidad colaborativa: derivaciones e intervisión entre counselors.

## Stack tecnológico
- Frontend: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- Backend: Next.js API routes + Supabase SSR
- Base de datos: Supabase PostgreSQL + Auth + Storage + RLS
- Videollamada: Daily.co SDK
- Pagos: Mercado Pago (Checkout Pro + Webhooks)
- Email: Resend (transaccional)
- Dólar blue: dolarapi.com (cotización en tiempo real)
- Deploy: Vercel
- PWA: Distribución sin stores (Android + iOS)

## Identidad visual
- Paleta: fondo #0c1810, acento #7dba8f, cálido #c4a882
- Tipografía: DM Serif Display (títulos) + DM Sans (UI)
- Estética: oscura, terrosa, mapuche-humanista. NO clínica, NO corporativa.

## Tres shells — Un solo login
- **Shell consultante**: simple, emocional, sin ruido. Densidad baja.
- **Shell counselor**: profesional, funcional, comunitaria. Densidad media.
- **Shell admin**: control total. Densidad alta.

## Aspectos críticos
- Las API keys NUNCA se exponen al frontend.
- Datos de salud: manejo ético extremo. Encriptación + RLS + auditoría.
- Verificación AAC obligatoria para counselors. Sin excepción.
- Tope máximo de 10 counselors activos en fase inicial.
- Evaluación post-sesión obligatoria para reservar la próxima.
- Sponsors: solo con aprobación del fundador. Prohibidos religión, política, farmacéuticas, pseudociencia.
- El espíritu de Newen no se vende. Se auspicias.

## Entregables inmediatos
- `ARCHITECTURE.md`: flujo técnico de la app.
- `SECURITY.md`: PSAI aplicado a Newen.
- `SECURITY_SUMMARY.md`: referencia rápida.
- `spec/`: documentación SDD completa (15 artefactos).
- `logs/`: registro de desarrollo y bugs.
- `WORKFLOW.md`: ciclo de desarrollo diario.
