import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/counselors/[id]/slots?fecha=YYYY-MM-DD
 * Devuelve los slots disponibles para un counselor en una fecha.
 * Público — cualquiera puede consultar para reservar.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");

  if (!fecha) {
    return NextResponse.json(
      { error: "Falta parámetro fecha (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Verificar que el counselor existe y está activo
  const { data: counselor } = await supabase
    .from("counselors")
    .select("id")
    .eq("id", id)
    .eq("estado", "activo")
    .single();

  if (!counselor) {
    return NextResponse.json(
      { error: "Counselor no encontrado." },
      { status: 404 }
    );
  }

  // Llamar a la función SQL
  const { data: slots, error } = await supabase.rpc("get_available_slots", {
    p_counselor_id: id,
    p_fecha: fecha,
  });

  if (error) {
    return NextResponse.json(
      { error: "Error al consultar disponibilidad." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      fecha,
      slots: (slots ?? []).map((s: { hora: string }) => s.hora.slice(0, 5)), // HH:MM
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=10",
      },
    }
  );
}
