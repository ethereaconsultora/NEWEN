import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearPreferenciaPago } from "@/lib/mercadopago";

/**
 * POST /api/sesiones
 * Crea una nueva sesión (reserva) y retorna la URL de pago de Mercado Pago.
 *
 * Body: { counselor_id, fecha_hora, modalidad, nombre, email }
 *
 * Si el usuario no está autenticado, se crea/vincula con Magic Link.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debés iniciar sesión para reservar." },
      { status: 401 }
    );
  }

  let body: {
    counselor_id: string;
    fecha_hora: string;
    modalidad: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { counselor_id, fecha_hora, modalidad } = body;

  if (!counselor_id || !fecha_hora || !modalidad) {
    return NextResponse.json(
      { error: "Faltan campos: counselor_id, fecha_hora, modalidad." },
      { status: 400 }
    );
  }

  if (!["online", "presencial"].includes(modalidad)) {
    return NextResponse.json(
      { error: "Modalidad inválida." },
      { status: 400 }
    );
  }

  // Verificar que el counselor existe, está activo y tiene MP configurado
  const { data: counselor, error: counselorError } = await supabase
    .from("counselors")
    .select("id, mp_access_token, users!inner(nombre)")
    .eq("id", counselor_id)
    .eq("estado", "activo")
    .single();

  if (counselorError || !counselor) {
    return NextResponse.json(
      { error: "Counselor no encontrado." },
      { status: 404 }
    );
  }

  if (!counselor.mp_access_token) {
    return NextResponse.json(
      { error: "Este counselor aún no configuró sus pagos. Volvé a intentar más tarde." },
      { status: 400 }
    );
  }

  // Verificar que el horario no está tomado
  const { data: existing } = await supabase
    .from("sesiones")
    .select("id")
    .eq("counselor_id", counselor_id)
    .eq("fecha_hora", fecha_hora)
    .neq("estado", "cancelada")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ese horario ya no está disponible." },
      { status: 409 }
    );
  }

  // Verificar que el consultante no tiene evaluaciones pendientes
  const { data: pendiente } = await supabase
    .from("sesiones")
    .select("id")
    .eq("consultante_id", user.id)
    .eq("estado", "finalizada")
    .eq("evaluacion_enviada", false)
    .maybeSingle();

  if (pendiente) {
    return NextResponse.json(
      {
        error:
          "Tenés una sesión pendiente de evaluación. Evaluá antes de reservar otra.",
        sesionPendienteId: pendiente.id,
      },
      { status: 403 }
    );
  }

  // Crear sesión
  const { data: sesion, error: sesionError } = await supabase
    .from("sesiones")
    .insert({
      counselor_id,
      consultante_id: user.id,
      fecha_hora,
      modalidad,
      precio_usd: 18,
      estado: "reservada",
    })
    .select()
    .single();

  if (sesionError || !sesion) {
    return NextResponse.json(
      { error: "Error al crear la sesión." },
      { status: 500 }
    );
  }

  // Obtener nombre del consultante y counselor para MP
  const { data: userData } = await supabase
    .from("users")
    .select("nombre, email")
    .eq("id", user.id)
    .single();

  const counselorUser = counselor.users as unknown as { nombre: string } | null;

  // Crear preferencia de pago con el token del counselor
  try {
    const { initPoint } = await crearPreferenciaPago({
      sesionId: sesion.id,
      counselorNombre: counselorUser?.nombre ?? "Counselor",
      precioUsd: 18,
      consultanteEmail: userData?.email ?? user.email ?? "",
      consultanteNombre: userData?.nombre ?? "Consultante",
      mpAccessToken: counselor.mp_access_token,
    });

    return NextResponse.json(
      {
        sesion,
        paymentUrl: initPoint,
      },
      { status: 201 }
    );
  } catch (mpError) {
    // Si falla MP, cancelamos la sesión
    await supabase
      .from("sesiones")
      .update({ estado: "cancelada" })
      .eq("id", sesion.id);

    return NextResponse.json(
      { error: "Error al crear el pago. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
