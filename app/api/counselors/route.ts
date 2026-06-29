import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/counselors
 * Listado público de counselors activos con filtros opcionales.
 * No requiere autenticación.
 *
 * Query params:
 *   q       — búsqueda por texto (bio, enfoque, nombre)
 *   especialidad — filtrar por especialidad
 *   modalidad    — online | presencial | ambas
 *   provincia    — filtrar por provincia
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const especialidad = searchParams.get("especialidad") ?? "";
  const modalidad = searchParams.get("modalidad") ?? "";
  const provincia = searchParams.get("provincia") ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("counselors")
    .select(
      `
      id,
      bio,
      enfoque,
      especialidades,
      modalidad,
      provincia,
      experiencia_anios,
      aac_verificado,
      promedio_estrellas,
      total_sesiones,
      users!inner(nombre)
    `
    )
    .eq("estado", "activo")
    .order("promedio_estrellas", { ascending: false });

  // Búsqueda por texto
  if (q) {
    query = query.or(`bio.ilike.%${q}%,enfoque.ilike.%${q}%`);
  }

  // Filtro por especialidad (array contiene)
  if (especialidad) {
    query = query.contains("especialidades", [especialidad]);
  }

  // Filtro por modalidad
  if (modalidad && modalidad !== "todas") {
    if (modalidad === "online" || modalidad === "presencial") {
      query = query.or(`modalidad.eq.${modalidad},modalidad.eq.ambas`);
    }
  }

  // Filtro por provincia
  if (provincia) {
    query = query.ilike("provincia", `%${provincia}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Error al buscar counselors." },
      { status: 500 }
    );
  }

  // Aplanar la relación users(nombre)
  const counselors = (data ?? []).map((c: Record<string, unknown>) => {
    const user = c.users as unknown as { nombre: string } | null;
    return {
      ...c,
      nombre: user?.nombre ?? "Sin nombre",
      users: undefined,
    };
  });

  return NextResponse.json(counselors, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
