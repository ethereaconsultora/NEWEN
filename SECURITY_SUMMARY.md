# Seguridad en 1 minuto — Newen

## Lo esencial

| Regla | Detalle |
|---|---|
| 🔑 API Keys | NUNCA en frontend. Solo `NEXT_PUBLIC_*` para keys anónimas. |
| 🛡️ RLS | Todas las tablas con Row Level Security. |
| 🚪 Middleware | Única puerta de entrada. Verifica sesión + rol. |
| 📝 Auditoría | `audit_logs` en cada operación sensible. |
| 🏥 Datos de salud | Encriptados en tránsito. No se almacena contenido de sesiones. |
| ⭐ Evaluaciones | Anonimizadas. Counselor ve promedio, no quién evaluó. |
| ✅ Counselors | Verificación AAC + entrevista + fee. Sin excepción. |
| 🚫 Sponsors | Solo con aprobación del fundador. Prohibidos: religión, política, farma, pseudociencia. |

## Ante cada feature nueva

1. ¿Requiere una API key nueva? → `.env.local` + NUNCA `NEXT_PUBLIC_*`.
2. ¿Toca datos de usuarios? → RLS + `audit_logs`.
3. ¿Acepta input del usuario? → Validación de esquema + sanitización.
4. ¿Se expone a otro rol? → Middleware debe proteger la ruta.

## Si algo falla

1. `logs/BUGS.md` con tag `[SEGURIDAD]`.
2. Commit con `security:` prefix.
3. Notificar al fundador.
