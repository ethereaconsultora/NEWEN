import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay sesión, redirigir a login
  if (!user) {
    redirect("/auth/login");
  }

  // Obtener rol del usuario
  const { data: profile } = await supabase
    .from("users")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = profile?.rol;

  // Redirección por rol
  if (rol === "admin") redirect("/admin");
  if (rol === "counselor") redirect("/panel");

  // Default: consultante → home de búsqueda
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 400,
            fontFamily: "var(--nv-font-display)",
            color: "var(--nv-text-primary)",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          ¿Qué te está<br />pasando?
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--nv-text-secondary)",
            maxWidth: 300,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Escribí lo que sentís y encontrá al counselor adecuado para acompañarte.
        </p>
      </div>

      {/* Chips de búsqueda rápida */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          maxWidth: 360,
        }}
      >
        {["Ansiedad", "Duelo", "Pareja", "Trabajo", "Familia", "Crisis", "Crecimiento personal"].map(
          (tag) => (
            <button
              key={tag}
              className="badge"
              style={{
                fontSize: 13,
                padding: "8px 16px",
                cursor: "pointer",
                border: "1px solid var(--nv-border)",
                background: "var(--nv-bg-card)",
                color: "var(--nv-text-primary)",
                borderRadius: "var(--nv-radius-full)",
                fontFamily: "var(--nv-font-body)",
              }}
            >
              {tag}
            </button>
          )
        )}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--nv-text-muted)",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        🌿 Newen · Lo que sentís, puede ser acompañado
      </p>
    </main>
  );
}
