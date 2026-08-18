import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/organizations
 * Crea el espacio comercial de una organización y vincula al usuario como owner.
 *
 * Si el slug ya existe pero la organización está huérfana (sin miembros, ej. la fila de
 * demo), la "reclama": actualiza sus datos y vincula al usuario.
 *
 * Body: { slug, nombre, tagline, rubro, sede, contacto, email, telefono,
 *         servicios, primary_color, accent_color, cover_gradient }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  let body: {
    slug?: string;
    nombre?: string;
    tagline?: string | null;
    rubro?: string | null;
    sede?: string | null;
    contacto?: string | null;
    email?: string | null;
    telefono?: string | null;
    servicios?: string[];
    primary_color?: string;
    accent_color?: string;
    cover_gradient?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const slug = (body.slug || "").trim();
  const nombre = (body.nombre || "").trim();
  if (!nombre || !slug) {
    return NextResponse.json({ error: "Faltan nombre o slug." }, { status: 400 });
  }

  const admin = createAdminClient();

  const payload = {
    nombre,
    tagline: body.tagline || null,
    rubro: body.rubro || null,
    sede: body.sede || null,
    contacto: body.contacto || null,
    email: body.email || null,
    telefono: body.telefono || null,
    servicios: body.servicios || [],
    primary_color: body.primary_color || "#0a0806",
    accent_color: body.accent_color || "#c4a87e",
    cover_gradient: body.cover_gradient || null,
  };

  // ¿El slug ya existe?
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    // Si ya tiene miembros, no permitir reclamarlo.
    const { count } = await admin
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", existing.id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Ese identificador (slug) ya está en uso por otra organización." },
        { status: 409 }
      );
    }

    // Organización huérfana (demo): la reclamamos y actualizamos sus datos.
    const { error: updErr } = await admin
      .from("organizations")
      .update(payload)
      .eq("id", existing.id);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    const { error: membErr } = await admin.from("organization_members").insert({
      organization_id: existing.id,
      user_id: user.id,
      rol: "owner",
    });
    if (membErr) {
      return NextResponse.json({ error: membErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug });
  }

  // Crear la organización y vincular al owner.
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({ slug, ...payload })
    .select("id")
    .single();

  if (orgErr) {
    return NextResponse.json({ error: orgErr.message }, { status: 500 });
  }

  const { error: membErr } = await admin.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    rol: "owner",
  });
  if (membErr) {
    return NextResponse.json({ error: membErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
