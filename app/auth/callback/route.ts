import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de OAuth de Supabase.
 * Intercambia el código de autorización por una sesión
 * y redirige al shell correspondiente según el rol.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Obtener rol del usuario
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("rol")
          .eq("id", user.id)
          .single();

        const rol = profile?.rol;

        // Redirección por rol
        if (rol === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
        if (rol === "counselor") {
          return NextResponse.redirect(`${origin}/panel`);
        }
        // consultante o sin rol → home
        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error o sin código → login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
