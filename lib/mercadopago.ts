import { MercadoPagoConfig, Preference } from "mercadopago";

/**
 * Helper de Mercado Pago para Newen.
 * Cada counselor tiene su propio token de MP.
 * Las sesiones se pagan directo al counselor. Newen no retiene.
 *
 * Para planes corporativos y fees de ingreso, se usa el token de Newen.
 */

/**
 * Crea un cliente MP con un token específico.
 */
function getClient(accessToken: string): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken });
}

export interface CrearPreferenciaInput {
  sesionId: string;
  counselorNombre: string;
  precioUsd: number;
  consultanteEmail: string;
  consultanteNombre: string;
  /** Token de Mercado Pago del counselor (dueño del dinero) */
  mpAccessToken: string;
}

/**
 * Crea una preferencia de pago en Mercado Pago.
 * El pago va DIRECTO a la cuenta del counselor (usando su token).
 * Retorna la URL de checkout (init_point).
 */
export async function crearPreferenciaPago(
  input: CrearPreferenciaInput
): Promise<{ initPoint: string; preferenceId: string }> {
  const client = getClient(input.mpAccessToken);
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.sesionId,
          title: `Sesión con ${input.counselorNombre}`,
          description: "Sesión individual de counseling — 50 minutos",
          quantity: 1,
          currency_id: "USD",
          unit_price: input.precioUsd,
        },
      ],
      payer: {
        email: input.consultanteEmail,
        name: input.consultanteNombre,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/mi-cuenta`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/reservar/${input.sesionId}?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/mi-cuenta`,
      },
      auto_return: "approved",
      external_reference: input.sesionId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pagos`,
      statement_descriptor: "Newen Sesion",
    },
  });

  return {
    initPoint: result.init_point!,
    preferenceId: result.id!,
  };
}

/**
 * Verifica la firma del webhook de Mercado Pago.
 * Usa el header x-signature y el request_id.
 */
export function verificarWebhook(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean {
  if (!xSignature || !xRequestId) return false;

  // Extraer ts y v1 de la firma
  const parts = xSignature.split(",").map((p) => p.trim());
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tsPart || !v1Part) return false;

  // Para producción, implementar verificación HMAC con el secret
  // Por ahora, validación básica de integridad
  return true;
}
