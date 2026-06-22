# Contratos de API — Newen

## Autenticación

Todas las rutas protegidas requieren sesión de Supabase. El middleware (`middleware.ts`) verifica el token y el rol.

## Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/auth/callback` | No | Callback OAuth de Supabase |
| POST | `/auth/login` | No | Login email/password |
| POST | `/auth/registro` | No | Registro nuevo usuario |

### Counselors
| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/api/counselors` | No* | — | Listado público con filtros |
| GET | `/api/counselors/[id]` | No | — | Perfil público del counselor |
| PUT | `/api/counselors/[id]` | Sí | counselor | Editar perfil propio |
| POST | `/api/postulaciones` | No | — | Formulario de postulación |

### Sesiones
| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| POST | `/api/sesiones` | Sí | consultante | Crear reserva |
| GET | `/api/sesiones` | Sí | todos | Listar sesiones del usuario |
| GET | `/api/sesiones/[id]` | Sí | todos | Detalle de sesión |
| PUT | `/api/sesiones/[id]` | Sí | counselor | Cambiar estado (finalizar) |

### Pagos
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/pagos` | No | Webhook Mercado Pago |
| POST | `/api/pagos/create-preference` | Sí | Crear preferencia de pago |

### Daily.co
| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| POST | `/api/daily/create-room` | Sí | todos | Crear sala de videollamada |

### Evaluaciones
| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| POST | `/api/evaluaciones` | Sí | consultante | Crear evaluación post-sesión |
| GET | `/api/evaluaciones/[id]` | Sí | todos | Ver evaluación |

### Admin
| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/api/admin/postulaciones` | Sí | admin | Listar postulaciones |
| PUT | `/api/admin/postulaciones/[id]` | Sí | admin | Cambiar estado postulación |
| GET | `/api/admin/metrics` | Sí | admin | Métricas globales |
| POST | `/api/admin/empresas` | Sí | admin | Crear empresa |
| GET | `/api/admin/counselors` | Sí | admin | Listar counselors |

\* Ruta pública. Datos sensibles protegidos por RLS en Supabase.
