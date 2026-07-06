import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/talleres/webhook
 * Recibe notificaciones de Mercado Pago para pagos de talleres.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  try {
    const paymentId = body.data?.id || body.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Sin payment ID" }, { status: 400 });
    }

    // Verificar pago con MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    const payment = await mpRes.json();

    if (payment.status === "approved") {
      const ref = payment.external_reference || "";
      // Formato: taller_{tallerId}_{consultanteId}
      const match = ref.match(/^taller_(.+)_(.+)$/);
      if (match) {
        await supabase
          .from("compras_talleres")
          .update({ estado: "aprobado", mp_payment_id: String(paymentId) })
          .eq("taller_id", match[1])
          .eq("consultante_id", match[2]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook taller error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
