# Despliegue — Newen

## Entornos

| Entorno | URL | Rama |
|---|---|---|
| Producción | `app.buscanos.com.ar` | `main` |
| Staging | `staging.newen.vercel.app` | `develop` |
| Local | `localhost:3000` | cualquier rama |

## Requisitos previos

1. Cuenta de Vercel vinculada a GitHub.
2. Proyecto de Supabase creado.
3. Cuenta de Daily.co con API key.
4. Cuenta de Mercado Pago con credenciales de producción.
5. Cuenta de Resend con API key.
6. Dominio `buscanos.com.ar` configurado.

## Variables de entorno (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DAILY_API_KEY=
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
NEXT_PUBLIC_MP_PUBLIC_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=ari@etherea.com.ar
NEXT_PUBLIC_APP_URL=https://app.buscanos.com.ar
```

## Deploy inicial

```bash
# 1. Push a main
git push origin main

# 2. Vercel detecta el push y hace deploy automático
# 3. Verificar en Vercel Dashboard que el build es exitoso
# 4. Configurar dominio personalizado: app.buscanos.com.ar
# 5. Configurar variables de entorno en Vercel
```

## Post-deploy

```bash
# 1. Ejecutar init_schema.sql en SQL Editor de Supabase
# 2. Verificar RLS en todas las tablas
# 3. Crear usuario admin manualmente en Supabase
# 4. Probar flujo completo: registro → búsqueda → reserva → pago → videollamada → evaluación
```

## Rollback

```bash
# Revertir a commit anterior
git revert <commit-hash>
git push origin main
# Vercel hace deploy automático del rollback
```
