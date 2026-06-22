# Deployment Checklist — Newen

## Pre-deploy (staging)

- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] Variables de entorno configuradas en Vercel
- [ ] `init_schema.sql` ejecutado en Supabase staging
- [ ] RLS habilitado en todas las tablas
- [ ] Middleware protege rutas por rol
- [ ] API keys NUNCA en frontend (`NEXT_PUBLIC_*` solo anon key + MP public key)
- [ ] `public/manifest.json` válido (validar con Chrome DevTools)
- [ ] Iconos PWA en `public/icons/` (192px + 512px)
- [ ] `.gitignore` incluye `.env*.local`

## Deploy (producción)

- [ ] Rama `main` actualizada
- [ ] Build en Vercel exitoso
- [ ] Dominio `app.buscanos.com.ar` configurado + SSL
- [ ] Variables de entorno de producción configuradas
- [ ] Supabase producción: `init_schema.sql` ejecutado
- [ ] Admin user creado en Supabase
- [ ] Mercado Pago: credenciales de producción (no test)
- [ ] Daily.co: API key de producción
- [ ] Resend: API key de producción + dominio verificado

## Post-deploy (verificación)

- [ ] `https://app.buscanos.com.ar` carga
- [ ] Registro de consultante funciona
- [ ] Login funciona (Google + email)
- [ ] Búsqueda de counselors funciona
- [ ] Reserva + pago (test $1) funciona
- [ ] Webhook Mercado Pago recibe y confirma
- [ ] Videollamada Daily.co funciona
- [ ] Evaluación funciona
- [ ] PWA "Agregar a pantalla de inicio" funciona
- [ ] `buscanos.com.ar` landing redirige a `app.buscanos.com.ar`
- [ ] Sin errores en consola
- [ ] Sin errores en logs de Vercel
- [ ] Sin errores en logs de Supabase
