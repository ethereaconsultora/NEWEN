import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/organizations/mine
 * Devuelve la organización del usuario autenticado (si es miembro),
 * consultando con service role para evitar falsos negativos de RLS.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: member } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ org: null });
  }

  const { data: org } = await admin
    .from("organizations")
    .select("*")
    .eq("id", member.organization_id)
    .maybeSingle();

  return NextResponse.json({ org: org ?? null });
}
