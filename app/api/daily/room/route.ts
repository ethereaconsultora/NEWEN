import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/daily/room
 * Crea una sala 1-1 en Daily.co (área profesionales) y devuelve la URL
 * del Prebuilt para incrustar en un iframe.
 *
 * Body: { name?: string }  → sufijo del nombre de la sala.
 *
 * Requiere en el entorno:
 *   DAILY_API_KEY             → key del panel de Daily.co (solo servidor)
 *   NEXT_PUBLIC_DAILY_DOMAIN  → opcional (ya no se usa para armar la URL)
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  let body: { name?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body opcional
  }

  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Daily.co no está configurado todavía. Definí DAILY_API_KEY en el entorno.",
      },
      { status: 500 }
    );
  }

  const name = `newen-${(body.name || "sala").replace(/[^a-z0-9-]/gi, "-").slice(0, 40)}-${Date.now().toString(36)}`;

  const res = await fetch(`https://api.daily.co/v1/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      privacy: "public", // se une cualquiera con el enlace (sin token)
      properties: {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // expira en 3 h
        max_participants: 2, // sala estrictamente 1 a 1
        enable_screenshare: true,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.info || data.message || "Error al crear la sala en Daily.co" },
      { status: 500 }
    );
  }

  const roomUrl = typeof data.url === "string" ? data.url : "";
  if (!roomUrl) {
    return NextResponse.json(
      { error: "Daily.co no devolvió una URL de sala válida." },
      { status: 500 }
    );
  }

  // Deriva el iframe del MISMO origen que devolvió la API para la sala.
  // Así nunca hay desajuste de dominio (evita "The meeting you're trying
  // to join does not exist") y no depende de ninguna variable de entorno.
  const origin = new URL(roomUrl).origin;
  const prebuiltUrl = `${origin}/prebuilt?roomUrl=${encodeURIComponent(roomUrl)}`;

  return NextResponse.json({ url: prebuiltUrl, roomUrl, name: data.name });
}
