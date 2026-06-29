import { createServerClient } from "@supabase/ssr";
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
        setAll(cookiesToSet) {
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
    "/auth",
    "/privacidad",
    "/terminos",
    "/api/dolar",
  ];
  const isPublic = PUBLIC.some((p) => path === p || (p !== "/" && path.startsWith(p)));

  // ── Recursos estáticos ──
  const isStatic =
    path.startsWith("/_next") ||
    path.startsWith("/icons") ||
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
    // Obtener rol desde la tabla users
    const { data: profile } = await supabase
      .from("users")
      .select("rol")
      .eq("id", user.id)
      .single();

    const rol = profile?.rol ?? "consultante";

    // ── Protección de shells ──
    // /panel solo para counselors y admin
    if (path.startsWith("/panel") && rol !== "counselor" && rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // /admin solo para admin
    if (path.startsWith("/admin") && rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Redirección post-login según rol ──
    if (path === "/auth/callback") {
      if (rol === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (rol === "counselor") {
        return NextResponse.redirect(new URL("/panel", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Redirección desde / a shell correcto ──
    if (path === "/") {
      if (rol === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (rol === "counselor") {
        return NextResponse.redirect(new URL("/panel", request.url));
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
