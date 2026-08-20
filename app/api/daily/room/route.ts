import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API = "https://api.daily.co/v1";

function cleanName(s: string) {
  return s
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

function headers(key: string) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

/**
 * POST /api/daily/room
 * - Con { reuse: true } (sala 1-1 del profesional): reutiliza la sala propia
 *   si ya existe y está VACÍA (mismo enlace, no acumula salas); si está
 *   ocupada, crea una nueva con sufijo (nadie pisa una sala en simultáneo).
 * - Sin { reuse } (encuentros del campus): crea una sala nueva por evento.
 * Devuelve { url: prebuilt, roomUrl, name, reused }.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  let body: { name?: string; reuse?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // body opcional
  }

  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Daily.co no está configurado todavía. Definí DAILY_API_KEY en el entorno." },
      { status: 500 }
    );
  }

  const uid = user.id.replace(/-/g, "").slice(0, 12);
  const baseName = `newen-1-1-${uid}`;

  let name: string;
  let reused = false;

  if (body.reuse) {
    name = baseName;
    // ¿La sala propia ya existe?
    const existing = await fetch(`${API}/rooms/${baseName}`, { headers: headers(apiKey) });
    if (existing.ok) {
      // ¿Está vacía? (presence.total_count > 0 → ocupada)
      const presence = await fetch(`${API}/rooms/${baseName}/presence`, {
        headers: headers(apiKey),
      }).catch(() => null);
      const total = presence?.ok ? (await presence.json()).total_count ?? 0 : 0;
      if (total > 0) {
        name = `${baseName}-${Date.now().toString(36)}`; // ocupada → sala nueva (no pisar)
      } else {
        reused = true; // vacía → reutilizar
      }
    }
  } else {
    name = `newen-${cleanName(body.name || "sala")}-${Date.now().toString(36)}`;
  }

  const res = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      name,
      privacy: "public",
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
    return NextResponse.json({ error: "Daily.co no devolvió una URL de sala válida." }, { status: 500 });
  }

  const origin = new URL(roomUrl).origin;
  const prebuiltUrl = `${origin}/prebuilt?roomUrl=${encodeURIComponent(roomUrl)}`;

  return NextResponse.json({ url: prebuiltUrl, roomUrl, name: data.name, reused });
}

/**
 * DELETE /api/daily/room  { name?: string }
 * Borra la sala indicada (o la sala propia del profesional si no se pasa name).
 * Así no se acumulan salas no usadas y el cupo queda libre.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Daily.co no está configurado." }, { status: 500 });
  }

  let body: { name?: string } = {};
  try {
    body = await request.json();
  } catch {
    // opcional
  }

  const baseName = `newen-1-1-${user.id.replace(/-/g, "").slice(0, 12)}`;
  const name = body.name ? cleanName(body.name) : baseName;

  await fetch(`${API}/rooms/${name}`, {
    method: "DELETE",
    headers: headers(apiKey),
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
