import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/evaluaciones — Crear evaluación (primera vez)
 * PUT  /api/evaluaciones — Actualizar evaluación (corrección)
 *
 * Body: { sesion_id, estrellas, comentario? }
 */
export async function POST(request: Request) {
  return handleEvaluacion(request, "create");
}

export async function PUT(request: Request) {
  return handleEvaluacion(request, "update");
}

async function handleEvaluacion(
  request: Request,
  mode: "create" | "update"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: { sesion_id: string; estrellas: number; comentario?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { sesion_id, estrellas, comentario } = body;

  if (!sesion_id || !estrellas || estrellas < 1 || estrellas > 5) {
    return NextResponse.json(
      { error: "Faltan campos o estrellas inválidas (1-5)." },
      { status: 400 }
    );
  }

  // Verificar que la sesión pertenece al usuario y está finalizada
  const { data: sesion, error: sesionError } = await supabase
    .from("sesiones")
    .select("id, counselor_id, consultante_id, estado, evaluacion_enviada")
    .eq("id", sesion_id)
    .eq("consultante_id", user.id)
    .single();

  if (sesionError || !sesion) {
    return NextResponse.json(
      { error: "Sesión no encontrada." },
      { status: 404 }
    );
  }

  if (sesion.estado !== "finalizada") {
    return NextResponse.json(
      { error: "La sesión aún no finalizó." },
      { status: 400 }
    );
  }

  if (mode === "create") {
    // Verificar que no existe evaluación previa
    const { data: existente } = await supabase
      .from("evaluaciones")
      .select("id")
      .eq("sesion_id", sesion_id)
      .maybeSingle();

    if (existente) {
      return NextResponse.json(
        {
          error: "Ya evaluaste esta sesión. Usá PUT para corregir.",
          evaluacionId: existente.id,
        },
        { status: 409 }
      );
    }

    // Crear evaluación
    const { data: evaluacion, error: insertError } = await supabase
      .from("evaluaciones")
      .insert({
        sesion_id,
        counselor_id: sesion.counselor_id,
        consultante_id: user.id,
        estrellas,
        comentario: comentario ?? null,
      })
      .select()
      .single();

    if (insertError || !evaluacion) {
      return NextResponse.json(
        { error: "Error al guardar la evaluación." },
        { status: 500 }
      );
    }

    // Marcar sesión como evaluada
    await supabase
      .from("sesiones")
      .update({ evaluacion_enviada: true })
      .eq("id", sesion_id);

    // Actualizar promedio del counselor
    await actualizarPromedio(supabase, sesion.counselor_id);

    return NextResponse.json({ evaluacion, mensaje: "¡Gracias por evaluar!" }, { status: 201 });
  }

  // mode === "update"
  const { data: existente, error: existenteError } = await supabase
    .from("evaluaciones")
    .select("id")
    .eq("sesion_id", sesion_id)
    .single();

  if (existenteError || !existente) {
    return NextResponse.json(
      { error: "No hay evaluación para corregir. Usá POST." },
      { status: 404 }
    );
  }

  const { data: evaluacion, error: updateError } = await supabase
    .from("evaluaciones")
    .update({
      estrellas,
      comentario: comentario ?? null,
    })
    .eq("id", existente.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Error al actualizar." },
      { status: 500 }
    );
  }

  await actualizarPromedio(supabase, sesion.counselor_id);

  return NextResponse.json({ evaluacion, mensaje: "Evaluación actualizada." });
}

async function actualizarPromedio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  counselorId: string
) {
  const { data } = await supabase
    .from("evaluaciones")
    .select("estrellas")
    .eq("counselor_id", counselorId);

  if (data && data.length > 0) {
    const promedio =
      data.reduce((sum, e) => sum + e.estrellas, 0) / data.length;
    await supabase
      .from("counselors")
      .update({ promedio_estrellas: Math.round(promedio * 100) / 100 })
      .eq("id", counselorId);
  }
}
