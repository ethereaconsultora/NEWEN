import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de protección de rutas por rol.
 *
 * Lógica:
 * - Sin sesión → solo rutas públicas (/auth, /privacidad, /terminos)
 * - Con sesión → redirige según rol:
 *   consultante → / (home)
 *   counselor   → /panel
 *   admin       → /admin
 * - Bloquea acceso a shells que no corresponden al rol
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ── Rutas públicas (sin auth requerida) ──
  // Home, búsqueda y perfiles de counselors son públicos.
  // El consultante explora sin registrarse. Solo reserva pide auth.
  const PUBLIC = [
    "/",
    "/buscar",
    "/counselor",
    "/explorar",
    "/agenda",
    "/talleres",
    "/postularse",
    "/auth",
    "/privacidad",
    "/terminos",
    "/api",
    "/images",
    "/icons",
    "/manifest.json",
    "/favicon.ico",
  ];
  const isPublic = PUBLIC.some((p) => path === p || (p !== "/" && path.startsWith(p)));

  // ── Recursos estáticos ──
  const isStatic =
    path.startsWith("/_next") ||
    path.startsWith("/icons") ||
    path.startsWith("/images") ||
    path.startsWith("/manifest.json") ||
    path.startsWith("/favicon.ico");

  if (isStatic) return response;

  // ── Sin sesión → solo rutas públicas ──
  if (!user && !isPublic) {
    const loginUrl = new URL("/auth/magic-link", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // ── Con sesión ──
  if (user) {
    // Obtener rol y flag admin desde la tabla users.
    // select("*") tolera que la columna es_admin aún no exista (previo a migrar).
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const rol = profile?.rol ?? "consultante";
    const esAdmin = profile?.es_admin === true || rol === "admin";
    const esCounselor = rol === "counselor";

    // ── Protección de shells ──
    // /panel para counselors y admins
    if (path.startsWith("/panel") && !esCounselor && !esAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // /admin solo para admins
    if (path.startsWith("/admin") && !esAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Redirección post-login según roles ──
    if (path === "/auth/callback") {
      if (esCounselor) {
        return NextResponse.redirect(new URL("/panel", request.url));
      }
      if (esAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Redirección desde / a shell correcto ──
    if (path === "/") {
      if (esCounselor) {
        return NextResponse.redirect(new URL("/panel", request.url));
      }
      if (esAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return response;
}

/**
 * Matcher: aplica el middleware a todas las rutas excepto recursos estáticos.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons/ (PWA icons)
     * - manifest.json (PWA manifest)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)",
  ],
};
