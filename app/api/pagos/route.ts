import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/pagos
 * Webhook de Mercado Pago.
 * Recibe notificaciones de pago y actualiza el estado de la sesión.
 *
 * También acepta GET /api/pagos?sesion_id=xxx para consultar estado.
 */

export async function POST(request: Request) {
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const action = body.action as string | undefined;
  const data = body.data as { id?: string } | undefined;
  const type = body.type as string | undefined;

  // Solo procesar notificaciones de pago
  if (type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  if (!data?.id) {
    return NextResponse.json({ error: "Falta data.id." }, { status: 400 });
  }

  // Obtener detalles del pago desde Mercado Pago
  const mpResponse = await fetch(
    `https://api.mercadopago.com/v1/payments/${data.id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    }
  );

  if (!mpResponse.ok) {
    return NextResponse.json(
      { error: "Error al consultar Mercado Pago." },
      { status: 500 }
    );
  }

  const payment = await mpResponse.json();
  const sesionId = payment.external_reference;
  const status = payment.status; // "approved" | "pending" | "rejected" | etc.

  if (!sesionId) {
    return NextResponse.json({ ok: true });
  }

  if (status === "approved") {
    // Actualizar sesión a confirmada
    const { error } = await supabase
      .from("sesiones")
      .update({
        estado: "confirmada",
      })
      .eq("id", sesionId)
      .eq("estado", "reservada"); // solo si sigue en reservada

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar sesión." },
        { status: 500 }
      );
    }

    // Incrementar contador de sesiones del counselor
    const { data: sesion } = await supabase
      .from("sesiones")
      .select("counselor_id")
      .eq("id", sesionId)
      .single();

    if (sesion) {
      await supabase.rpc("increment_counselor_sessions", {
        counselor_id: sesion.counselor_id,
      });
    }
  }

  if (status === "rejected" || status === "cancelled") {
    await supabase
      .from("sesiones")
      .update({ estado: "cancelada" })
      .eq("id", sesionId);
  }

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/pagos?sesion_id=xxx
 * Consulta el estado de pago de una sesión.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sesionId = searchParams.get("sesion_id");

  if (!sesionId) {
    return NextResponse.json({ error: "Falta sesion_id." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sesiones")
    .select("id, estado")
    .eq("id", sesionId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Sesión no encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ estado: data.estado });
}
