import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmpresasVitrinaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("estado", "activa")
    .order("nombre");

  const orgs = data ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        color: "var(--nv-text-primary)",
        fontFamily: "var(--nv-font-body)",
      }}
    >
      {/* Hero */}
      <header
        style={{
          padding: "64px 24px 48px",
          textAlign: "center",
          borderBottom: "1px solid var(--nv-border)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--nv-text-muted)",
            marginBottom: 14,
          }}
        >
          Newen · Espacios de empresas
        </div>
        <h1
          style={{
            fontFamily: "var(--nv-font-display)",
            fontSize: "clamp(30px,4.5vw,52px)",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Organizaciones que desarrollan <em style={{ color: "var(--nv-accent)" }}>capacidades</em>
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--nv-text-secondary)",
            maxWidth: 560,
            margin: "0 auto 28px",
          }}
        >
          Cada espacio es una organización que ofrece sus servicios de desarrollo organizacional
          dentro de newen.
        </p>
        <Link
          href="/empresas/crear"
          style={{
            display: "inline-block",
            background: "var(--nv-accent)",
            color: "#fff",
            textDecoration: "none",
            padding: "14px 28px",
            borderRadius: "var(--nv-radius-md)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          + Crear mi espacio
        </Link>
      </header>

      {/* Grid */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 80px" }}>
        {orgs.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--nv-text-muted)" }}>
            Todavía no hay espacios publicados. Sé el primero en crear el tuyo.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {orgs.map((o: any) => (
              <Link
                key={o.id}
                href={`/e/${o.slug}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  background: "var(--nv-bg-card)",
                  border: "1px solid var(--nv-border)",
                  borderRadius: "var(--nv-radius-lg)",
                  padding: 22,
                  transition: "transform .15s, box-shadow .15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: o.accent_color || "#c4a87e",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: "var(--nv-font-display)", fontSize: 20 }}>
                    {o.nombre}
                  </span>
                </div>
                {o.tagline && (
                  <div style={{ fontSize: 13, color: "var(--nv-text-secondary)", marginBottom: 6 }}>
                    {o.tagline}
                  </div>
                )}
                {o.rubro && (
                  <div style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 14 }}>
                    {o.rubro}
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(o.servicios ?? []).slice(0, 4).map((s: string) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 10.5,
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid var(--nv-border-strong)",
                        color: "var(--nv-text-secondary)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--nv-accent)",
                  }}
                >
                  Ver espacio →
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
