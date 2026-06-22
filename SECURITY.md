# Seguridad — Newen

> **Protocolo base**: PSAI v1.3 (ver `PROTOCOLOS/PSAI_v1.3.md`)
> **Referencia rápida**: `SECURITY_SUMMARY.md`

---

## 1. Aplicación de PSAI v1.3 a Newen

### B1 — Validación de inputs (Gateway)
| Medida | Aplicación en Newen |
|---|---|
| B1A: Normalización de texto | Todo input de búsqueda, formularios de postulación, mensajes de chat |
| B1B: Clasificador local | Detección de contenido malicioso en postulaciones, reseñas, mensajes |
| Rate limiting | Endpoints de auth, reservas, pagos |

### B2 — Protección SSRF
| Medida | Aplicación |
|---|---|
| DNS resolution + IP fijada | Llamadas a Daily.co, Mercado Pago, Resend |
| Header Host original | Todas las requests externas desde API routes |

### B3 — Auditoría
| Medida | Aplicación |
|---|---|
| `audit_logs` | Cada modificación de perfil, sesión, pago, evaluación |
| `patron_id` opaco | Sin exposición de datos sensibles en logs |

### B4 — Sanitización de outputs
| Medida | Aplicación |
|---|---|
| Sanitización de respuestas | Perfiles públicos, reseñas, mensajes de chat |
| Sin renderizado de HTML/JS | Todo contenido generado por usuarios |

---

## 2. API Keys y secretos

| Variable | Dónde | Exposición |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` → Vercel | NUNCA frontend |
| `DAILY_API_KEY` | `.env.local` → Vercel | NUNCA frontend |
| `MP_ACCESS_TOKEN` | `.env.local` → Vercel | NUNCA frontend |
| `RESEND_API_KEY` | `.env.local` → Vercel | NUNCA frontend |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Pública |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Vercel | Pública |
| `ADMIN_EMAIL` | Vercel | Solo server |

---

## 3. Protección de datos de salud

Newen maneja información sensible de salud mental. Medidas adicionales:

- **RLS estricto**: counselors solo ven sus propios consultantes. Consultantes solo ven sus propias sesiones.
- **Encriptación en tránsito**: HTTPS obligatorio (Vercel + Supabase).
- **No almacenamiento de contenido de sesiones**: Daily.co no graba. El chat no se persiste más allá de la sesión activa.
- **Evaluaciones anonimizadas**: el counselor ve el promedio pero NO quién evaluó qué.
- **Derecho al olvido**: el consultante puede solicitar baja total de sus datos.

---

## 4. Roles y permisos

| Rol | Acceso |
|---|---|
| `consultante` | Buscar counselors, reservar, sesiones propias, evaluar |
| `counselor` | Perfil propio, agenda, sesiones con consultantes, métricas propias, colaborativo |
| `admin` | Todo. Postulaciones, entrevistas, counselors, empresas, métricas globales |

---

## 5. Verificación de counselors

1. AAC: validación de jura del Código de Ética (obligatorio, sin excepción).
2. Entrevista personal: videollamada con el fundador dentro de la plataforma.
3. Fee único: pago de $22 USD vía Mercado Pago.
4. Activación manual por admin.

---

## 6. Respuesta a incidentes

1. Detección → `logs/BUGS.md` con tag `[SEGURIDAD]`.
2. Contención → desactivar acceso del counselor/consultante involucrado.
3. Análisis → revisar `audit_logs`.
4. Corrección → fix + commit con `security:` prefix.
5. Notificación → al fundador.
