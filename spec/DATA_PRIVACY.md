# Privacidad de Datos — Newen

## Filosofía

Newen maneja información sensible de salud mental. La privacidad no es una feature, es un derecho del consultante y una obligación ética de la plataforma.

---

## Datos que recolectamos

| Dato | Propósito | Retención |
|---|---|---|
| Email | Login, notificaciones | Hasta que el usuario solicita baja |
| Nombre | Identificación en la plataforma | Hasta baja |
| Historial de sesiones | Registro para el consultante | Hasta baja |
| Evaluaciones (estrellas) | Calidad de la comunidad | Anonimizadas. Sin baja (agregado) |
| Contenido de videollamada | NO se almacena | 0 días (Daily.co no graba) |
| Mensajes de chat | Comunicación counselor-consultante | Duración de la sesión activa |
| Datos de pago | Mercado Pago | No almacenados por Newen (MP los retiene) |

---

## Datos que NO recolectamos

- ❌ Diagnósticos clínicos.
- ❌ Notas de sesión del counselor.
- ❌ Historial médico.
- ❌ Grabaciones de videollamada.
- ❌ Datos de menores de edad (no es un servicio para menores).

---

## Derechos del usuario

| Derecho | Cómo se ejerce |
|---|---|
| Acceso | El usuario puede ver todos sus datos desde Mi Cuenta |
| Rectificación | Puede editar nombre y email |
| Supresión (baja) | Solicitar a `ari@etherea.com.ar`. Se eliminan todos los datos personales |
| Portabilidad | Exportación de historial de sesiones (JSON) |
| No tracking | Sin cookies de terceros. Sin analytics invasivo |

---

## Seguridad técnica

- **Encriptación en tránsito**: HTTPS (Vercel + Supabase).
- **Encriptación en reposo**: Supabase PostgreSQL con TDE.
- **RLS**: cada usuario solo ve sus propios datos.
- **Evaluaciones anonimizadas**: el counselor ve promedio pero NO quién evaluó qué.
- **API keys**: nunca en frontend.

---

## Cumplimiento

| Norma | Estado |
|---|---|
| Ley 25.326 (Argentina — Datos Personales) | ✅ Alineado |
| GDPR (Europa) | ✅ Base legal: consentimiento + interés legítimo |
| HIPAA (EE.UU.) | ⚠️ No aplica (no es entidad médica), pero se siguen principios |

---

## Brecha de seguridad

En caso de brecha:
1. Notificar al fundador inmediatamente.
2. Evaluar alcance (¿qué datos se expusieron?).
3. Notificar a usuarios afectados en 72h.
4. Parche + commit `security:`.
5. Post-mortem en `logs/BUGS.md`.
