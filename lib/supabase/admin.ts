import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service_role — bypass RLS.
 * SOLO para uso en API Routes (server-side).
 * NUNCA se expone al cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
