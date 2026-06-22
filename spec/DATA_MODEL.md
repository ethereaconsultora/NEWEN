# Modelo de Datos — Newen

## Diagrama de entidades

```
users ─────────────┬── counselors (1:1)
                   │
                   ├── sesiones (1:N como consultante)
                   │
                   └── evaluaciones (1:N como consultante)

counselors ────────┬── sesiones (1:N como counselor)
                   │
                   ├── evaluaciones (1:N como evaluado)
                   │
                   └── talleres (1:N)

empresas ──────────── empleados_empresa (1:N)

empleados_empresa ─── users (N:1)
```

## Tablas (10)

### users
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| email | TEXT UNIQUE | |
| nombre | TEXT | |
| rol | enum(consultante, counselor, admin) | Default: consultante |
| created_at | TIMESTAMPTZ | |

### counselors
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK FK → users | |
| bio | TEXT | |
| enfoque | TEXT | Humanista, Rogeriano, etc. |
| especialidades | TEXT[] | Tags: ansiedad, duelo, etc. |
| modalidad | enum(presencial, online, ambas) | |
| provincia | TEXT | |
| experiencia_anios | INT | |
| aac_verificado | BOOLEAN | |
| estado | enum(pendiente, entrevistado, activo, suspendido) | |
| promedio_estrellas | DECIMAL(3,2) | |
| total_sesiones | INT | |
| fee_pagado | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

### sesiones
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| counselor_id | UUID FK → counselors | |
| consultante_id | UUID FK → users | |
| fecha_hora | TIMESTAMPTZ | |
| duracion_min | INT | Default: 50 |
| modalidad | enum(presencial, online) | |
| estado | enum(reservada, confirmada, en_curso, finalizada, cancelada) | |
| tipo | enum(individual, corporativa) | |
| precio_usd | DECIMAL(8,2) | |
| daily_room_url | TEXT | |
| evaluacion_enviada | BOOLEAN | Default: false |
| created_at | TIMESTAMPTZ | |

### evaluaciones
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| sesion_id | UUID UNIQUE FK → sesiones | Una evaluación por sesión |
| counselor_id | UUID FK → counselors | |
| consultante_id | UUID FK → users | |
| estrellas | INT CHECK(1-5) | |
| comentario | TEXT | Opcional |
| created_at | TIMESTAMPTZ | |

### empresas
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| nombre | TEXT | |
| contacto_nombre | TEXT | |
| contacto_email | TEXT | |
| cantidad_empleados | INT | Default: 5 |
| precio_mensual_usd | DECIMAL(8,2) | |
| estado | enum(activa, pausada, cancelada) | |
| created_at | TIMESTAMPTZ | |

### empleados_empresa
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| empresa_id | UUID FK → empresas | |
| user_id | UUID FK → users | |
| sesiones_disponibles_mes | INT | Default: 2 |
| created_at | TIMESTAMPTZ | |

### talleres
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| counselor_id | UUID FK → counselors | |
| titulo | TEXT | |
| descripcion | TEXT | |
| precio_usd | DECIMAL(8,2) | Default: 0 |
| gratuito | BOOLEAN | Default: false |
| modalidad | enum(grabado, vivo) | |
| fecha_hora | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### postulaciones
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| nombre | TEXT | |
| apellido | TEXT | |
| email | TEXT UNIQUE | |
| wsp | TEXT | |
| provincia | TEXT | |
| especialidades | TEXT[] | |
| modalidad | TEXT | |
| enfoque | TEXT | |
| aac_estado | TEXT | Constancia AAC |
| origen | TEXT | Cómo llegó |
| estado | enum(recibida, entrevista_pendiente, aprobada, rechazada) | |
| created_at | TIMESTAMPTZ | |

### waitlist_consultantes
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| nombre | TEXT | |
| email | TEXT UNIQUE | |
| busqueda | TEXT | Qué busca |
| modalidad | TEXT | Online/presencial |
| created_at | TIMESTAMPTZ | |

### audit_logs (seguridad)
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| accion | TEXT | |
| patron_id | TEXT | Identificador opaco |
| created_at | TIMESTAMPTZ | |
