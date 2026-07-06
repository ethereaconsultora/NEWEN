import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/talleres/[id]/pagar
 * Crea una preferencia de Mercado Pago para comprar un taller.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { consultante_id } = await request.json();
  if (!consultante_id) {
    return NextResponse.json({ error: "Falta consultante_id" }, { status: 400 });
  }

  // Obtener taller + counselor
  const { data: taller } = await supabase
    .from("talleres")
    .select("*, counselors(mp_access_token), users!counselors(id, nombre)")
    .eq("id", id)
    .single();

  if (!taller) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
  }

  const counselor = (taller as Record<string, unknown>).counselors as Record<string, unknown> | null;
  const counselorUser = (taller as Record<string, unknown>).users as Record<string, unknown> | null;
  const mpToken = counselor?.mp_access_token as string | undefined;

  if (!taller.gratuito && taller.precio_usd > 0 && !mpToken) {
    return NextResponse.json({ error: "El counselor no tiene configurado Mercado Pago" }, { status: 400 });
  }

  // Crear preferencia MP
  const mpUrl = taller.gratuito || taller.precio_usd === 0
    ? null
    : await createPreferenciaTaller({
        tallerId: id,
        titulo: taller.titulo,
        precioUsd: taller.precio_usd,
        mpToken: mpToken!,
        consultanteId: consultante_id,
      });

  // Registrar compra pendiente
  if (!taller.gratuito && taller.precio_usd > 0) {
    await supabase.from("compras_talleres").upsert({
      consultante_id: consultante_id,
      taller_id: id,
      estado: "pendiente",
    }, { onConflict: "consultante_id,taller_id" });
  }

  return NextResponse.json({ init_point: mpUrl });
}

async function createPreferenciaTaller(input: {
  tallerId: string; titulo: string; precioUsd: number;
  mpToken: string; consultanteId: string;
}) {
  const { MercadoPagoConfig, Preference } = await import("mercadopago");
  const client = new MercadoPagoConfig({ accessToken: input.mpToken });
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [{
        id: input.tallerId,
        title: `Taller: ${input.titulo}`,
        description: "Taller virtual — Newen",
        quantity: 1,
        currency_id: "USD",
        unit_price: input.precioUsd,
      }],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "https://newen-nu.vercel.app"}/talleres/${input.tallerId}?pago=exito`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "https://newen-nu.vercel.app"}/talleres/${input.tallerId}?pago=error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "https://newen-nu.vercel.app"}/talleres/${input.tallerId}`,
      },
      external_reference: `taller_${input.tallerId}_${input.consultanteId}`,
    },
  });

  return result.init_point!;
}
