import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarConfirmacionConsultante, enviarConfirmacionCounselor } from "@/lib/resend";

/**
 * PATCH /api/sesiones/[id]
 * Reprogramar o cancelar una sesión (solo consultante).
 *
 * Body: { action: "reprogramar" | "cancelar", nueva_fecha_hora?: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // Obtener sesión
  const { data: sesion, error: sesionError } = await supabase
    .from("sesiones")
    .select("*")
    .eq("id", id)
    .eq("consultante_id", user.id)
    .single();

  if (sesionError || !sesion) {
    return NextResponse.json(
      { error: "Sesión no encontrada." },
      { status: 404 }
    );
  }

  let body: { action: string; nueva_fecha_hora?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  // ── REPROGRAMAR ──
  if (body.action === "reprogramar") {
    if (!body.nueva_fecha_hora) {
      return NextResponse.json(
        { error: "Falta nueva_fecha_hora." },
        { status: 400 }
      );
    }

    // Verificar 24hs de anticipación
    const ahora = new Date();
    const fechaSesion = new Date(sesion.fecha_hora);
    const horasRestantes =
      (fechaSesion.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24) {
      return NextResponse.json(
        {
          error:
            "Solo se puede reprogramar con más de 24 horas de anticipación.",
        },
        { status: 403 }
      );
    }

    // Verificar que el nuevo slot está libre
    const { data: ocupado } = await supabase
      .from("sesiones")
      .select("id")
      .eq("counselor_id", sesion.counselor_id)
      .eq("fecha_hora", body.nueva_fecha_hora)
      .neq("estado", "cancelada")
      .maybeSingle();

    if (ocupado) {
      return NextResponse.json(
        { error: "Ese horario ya no está disponible." },
        { status: 409 }
      );
    }

    // Actualizar
    const { error: updateError } = await supabase
      .from("sesiones")
      .update({ fecha_hora: body.nueva_fecha_hora })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Error al reprogramar." },
        { status: 500 }
      );
    }

    // Enviar nuevos emails (mejor esfuerzo)
    try {
      const { data: consultante } = await supabase
        .from("users")
        .select("email, nombre")
        .eq("id", sesion.consultante_id)
        .single();

      const { data: counselor } = await supabase
        .from("counselors")
        .select("id, users!inner(email, nombre)")
        .eq("id", sesion.counselor_id)
        .single();

      const cUser = counselor?.users as unknown as { email: string; nombre: string } | null;

      if (consultante?.email) {
        await enviarConfirmacionConsultante({
          email: consultante.email,
          nombre: consultante.nombre ?? "",
          counselorNombre: cUser?.nombre ?? "",
          fechaHora: body.nueva_fecha_hora,
          sesionId: id,
        });
      }
      if (cUser?.email) {
        await enviarConfirmacionCounselor({
          email: cUser.email,
          nombre: cUser.nombre ?? "",
          consultanteNombre: consultante?.nombre ?? "",
          fechaHora: body.nueva_fecha_hora,
          sesionId: id,
        });
      }
    } catch {
      // No bloqueante
    }

    return NextResponse.json({ ok: true, mensaje: "Sesión reprogramada." });
  }

  // ── CANCELAR ──
  if (body.action === "cancelar") {
    const ahora = new Date();
    const fechaSesion = new Date(sesion.fecha_hora);
    const horasRestantes =
      (fechaSesion.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24) {
      return NextResponse.json(
        {
          error:
            "No se puede cancelar con menos de 24 horas de anticipación.",
        },
        { status: 403 }
      );
    }

    const { error: cancelError } = await supabase
      .from("sesiones")
      .update({ estado: "cancelada" })
      .eq("id", id);

    if (cancelError) {
      return NextResponse.json(
        { error: "Error al cancelar." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Sesión cancelada. El pago queda como crédito para tu próxima reserva (30 días).",
    });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}
