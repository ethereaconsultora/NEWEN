# Protocolo de Reserva y Sesión — Newen

> Registro formal del flujo de reserva, pago, confirmación y reprogramación.
> Versión: 1.0 — 2026-06-28

---

## 1. Reserva y Pago Inmediato

El consultante elige día/hora en la agenda del counselor y **paga en ese momento** dentro de la plataforma. El pago congela el turno.

**Regla**: Sin pago no hay reserva confirmada. El estado "reservada" es transitorio (máx 15 minutos). Si no se completa el pago, el slot se libera automáticamente.

---

## 2. Confirmación y Acceso Automático

Al confirmarse el pago:
- Se crea la sala de videollamada (Daily.co).
- Se envía email de confirmación al consultante y al counselor vía Resend.
- El email incluye: fecha, hora, nombre del counselor/consultante, y botón de acceso directo a la videollamada.
- La videollamada se activa el día y hora de la sesión (el link funciona siempre, pero la sesión es a horario pactado).

---

## 3. Política de Flexibilidad (Anti-Miedo al Pago)

Antes de pagar, el consultante ve este aviso:

> *"¿Surgió un imprevisto? Tenés hasta 24 horas antes de la sesión para reprogramar tu turno sin perder el pago."*

**Reglas**:
- **+24 horas antes**: puede reprogramar sin costo. El pago se reutiliza.
- **-24 horas antes**: no se permite reprogramar. El pago no se devuelve.
- **No-show**: si no se presenta, el pago no se devuelve.

---

## 4. Reprogramación

El consultante entra a **Mi Cuenta** → ve sus sesiones → clic en **Reprogramar** (disponible solo si faltan +24h).

**Flujo**:
1. El sistema muestra la agenda del mismo counselor con slots disponibles.
2. El consultante elige nuevo día/hora.
3. El sistema actualiza `sesiones.fecha_hora` sin crear un nuevo pago.
4. Se envía nuevo email de confirmación con la fecha actualizada.
5. El counselor ve el cambio reflejado en su panel.

**Regla**: Solo se puede reprogramar una vez por sesión. Si necesita cambiar de nuevo, debe cancelar y reservar de cero.

---

## 5. Cancelación

- **+24 horas**: el consultante puede cancelar desde Mi Cuenta. El pago queda como crédito a favor (reutilizable en otra reserva con cualquier counselor, válido por 30 días).
- **-24 horas**: no se puede cancelar. El pago no se devuelve.
- **Counselor cancela**: el consultante recibe crédito automático + notificación.

---

## 6. Responsabilidades

| Actor | Responsabilidad |
|---|---|
| **Newen** | Gestiona agenda, pagos, videollamada, notificaciones. No intermedia en el contenido de la sesión. |
| **Counselor** | Mantiene su agenda actualizada. Se presenta a horario. Finaliza la sesión en la plataforma. |
| **Consultante** | Se presenta a horario. Evalúa la sesión al finalizar. Respeta la política de cancelación. |

---

## 7. Flujo visual

```
Home → Buscar → Perfil Counselor → Reservar
  → Elige día/hora → Ve política 24hs → Ir a pagar
  → Mercado Pago → Pago confirmado
  → Email confirmación (consultante + counselor)
  → Día de sesión → Videollamada Daily.co
  → Counselor finaliza → Consultante evalúa ★
  → Puede reservar de nuevo
```

---

*Protocolo oficial — Newen · Etherea · 2026*
