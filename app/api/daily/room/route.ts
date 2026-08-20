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
 *   NEXT_PUBLIC_DAILY_DOMAIN  → ej: "newen" (sin .daily.co)
 *   DAILY_API_KEY             → key del panel de Daily.co (solo servidor)
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

  const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
  const apiKey = process.env.DAILY_API_KEY;

  if (!domain || !apiKey) {
    return NextResponse.json(
      {
        error:
          "Daily.co no está configurado todavía. Definí NEXT_PUBLIC_DAILY_DOMAIN y DAILY_API_KEY en el entorno.",
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
      properties: {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // expira en 3 h
        enable_prejoin_ui: true,
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

  // Normaliza el dominio: acepta "newen", "newen.daily.co" o una URL completa,
  // y siempre produce https://<dominio>.daily.co/prebuilt...
  const base = domain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/\.daily\.co$/i, "");

  const prebuiltUrl = `https://${base}.daily.co/prebuilt?roomUrl=${encodeURIComponent(data.url)}`;

  return NextResponse.json({ url: prebuiltUrl, roomUrl: data.url, name: data.name });
}
