import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSiteConfig } from "@/lib/public-site/normalize";

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
    slogan?: string | null;
    rubro?: string | null;
    sede?: string | null;
    contacto?: string | null;
    email?: string | null;
    telefono?: string | null;
    servicios?: string[];
    primary_color?: string;
    accent_color?: string;
    cover_gradient?: string | null;
    logo_url?: string | null;
    cover_url?: string | null;
    font_id?: string;
    font_size?: string;
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
    slogan: body.slogan || null,
    rubro: body.rubro || null,
    sede: body.sede || null,
    contacto: body.contacto || null,
    email: body.email || null,
    telefono: body.telefono || null,
    servicios: body.servicios || [],
    primary_color: body.primary_color || "#0a0806",
    accent_color: body.accent_color || "#c4a87e",
    cover_gradient: body.cover_gradient || null,
    logo_url: body.logo_url || null,
    cover_url: body.cover_url || null,
    font_id: body.font_id || "newen",
    font_size: body.font_size || "mediana",
  };

  // ¿El slug ya existe?
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    // ¿El usuario ya es miembro? → ya lo reclamó antes, lo llevamos directo a su panel.
    const { data: myMembership } = await admin
      .from("organization_members")
      .select("id")
      .eq("organization_id", existing.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (myMembership) {
      return NextResponse.json({ ok: true, slug, already: true });
    }

    // Si ya tiene otros miembros, no permitir reclamarlo.
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

/**
 * PATCH /api/organizations
 * Actualiza los datos (incluido logo/banner) de la organización a la que el
 * usuario está vinculado como miembro. No cambia el slug ni la membresía.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: memb } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!memb) {
    return NextResponse.json({ error: "No tenés una organización vinculada." }, { status: 404 });
  }

  const upd: Record<string, any> = {};
  if (body.nombre !== undefined) upd.nombre = String(body.nombre || "").trim();
  if (body.slogan !== undefined) upd.slogan = body.slogan || null;
  if (body.tagline !== undefined) upd.tagline = body.tagline || null;
  if (body.rubro !== undefined) upd.rubro = body.rubro || null;
  if (body.sede !== undefined) upd.sede = body.sede || null;
  if (body.contacto !== undefined) upd.contacto = body.contacto || null;
  if (body.email !== undefined) upd.email = body.email || null;
  if (body.telefono !== undefined) upd.telefono = body.telefono || null;
  if (body.servicios !== undefined) upd.servicios = Array.isArray(body.servicios) ? body.servicios : [];
  if (body.primary_color !== undefined) upd.primary_color = body.primary_color;
  if (body.accent_color !== undefined) upd.accent_color = body.accent_color;
  if (body.font_id !== undefined) upd.font_id = body.font_id;
  if (body.font_size !== undefined) upd.font_size = body.font_size;
  if (body.logo_url !== undefined) upd.logo_url = body.logo_url || null;
  if (body.cover_url !== undefined) upd.cover_url = body.cover_url || null;
  if (body.site_config !== undefined) {
    // Normalizamos en el servidor: nunca guardamos config sin validar (trust no one).
    upd.site_config = normalizeSiteConfig(body.site_config);
  }

  const { error } = await admin.from("organizations").update(upd).eq("id", memb.organization_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
