"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SERVICIOS = [
  "Liderazgo Sostenible",
  "Fortalecimiento de Equipos",
  "Recuperación del Clima",
  "Gestión de Conflictos",
  "Prevención de Burnout",
  "Onboarding",
  "Campus Digital",
];

const ACCENTS = ["#c4a87e", "#c4a882", "#7fb2c4", "#7dba8f", "#b79bc4", "#8fa3d6", "#e08e7f", "#b8bec4"];

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CrearEspacioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(undefined);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const nombre = (document.getElementById("ob-nombre") as HTMLInputElement).value.trim();
    if (!nombre) {
      setError("Ingresá el nombre de tu organización.");
      setSaving(false);
      return;
    }
    const slug = slugify(
      (document.getElementById("ob-slug") as HTMLInputElement).value.trim() || nombre
    );
    if (!slug) {
      setError("El identificador (slug) no es válido.");
      setSaving(false);
      return;
    }
    const servicios = Array.from(
      document.querySelectorAll<HTMLInputElement>("#ob-servicios input:checked")
    ).map((i) => i.value);

    const payload = {
      slug,
      nombre,
      tagline: (document.getElementById("ob-tagline") as HTMLInputElement).value.trim() || null,
      rubro: (document.getElementById("ob-rubro") as HTMLInputElement).value.trim() || null,
      sede: (document.getElementById("ob-sede") as HTMLInputElement).value.trim() || null,
      contacto: (document.getElementById("ob-contacto") as HTMLInputElement).value.trim() || null,
      email: (document.getElementById("ob-email") as HTMLInputElement).value.trim() || null,
      telefono: (document.getElementById("ob-tel") as HTMLInputElement).value.trim() || null,
      servicios,
      primary_color: "#0a0806",
      accent_color: accent,
    };

    const { error: insErr } = await supabase.from("organizations").insert(payload);
    if (insErr) {
      setError("Error al crear: " + insErr.message);
      setSaving(false);
      return;
    }

    const { data: orgRow } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!orgRow) {
      setError("No se pudo confirmar la creación del espacio.");
      setSaving(false);
      return;
    }

    const { error: membErr } = await supabase.from("organization_members").insert({
      organization_id: orgRow.id,
      user_id: user.id,
      rol: "owner",
    });
    if (membErr) {
      setError("Error al vincular tu cuenta: " + membErr.message);
      setSaving(false);
      return;
    }

    router.push("/empresa");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--nv-bg-input)",
    border: "1px solid var(--nv-border)",
    borderRadius: "var(--nv-radius-sm)",
    padding: "12px 14px",
    color: "var(--nv-text-primary)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  };

  if (user === undefined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--nv-bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="spinner" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--nv-bg-base)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 28 }}>
          Necesitás iniciar sesión
        </h1>
        <p style={{ color: "var(--nv-text-secondary)", maxWidth: 420 }}>
          Para crear el espacio comercial de tu organización, primero iniciá sesión en newen.
        </p>
        <Link
          href="/auth/login"
          style={{
            background: "var(--nv-accent)",
            color: "#fff",
            textDecoration: "none",
            padding: "12px 24px",
            borderRadius: "var(--nv-radius-md)",
            fontWeight: 600,
          }}
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        color: "var(--nv-text-primary)",
        fontFamily: "var(--nv-font-body)",
        padding: "48px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Link
          href="/empresas"
          style={{ fontSize: 13, color: "var(--nv-text-muted)", textDecoration: "none" }}
        >
          ← Volver a la vidriera
        </Link>
        <h1
          style={{
            fontFamily: "var(--nv-font-display)",
            fontSize: "clamp(26px,4vw,38px)",
            lineHeight: 1.1,
            margin: "16px 0 6px",
          }}
        >
          Creá el espacio de tu organización
        </h1>
        <p style={{ color: "var(--nv-text-secondary)", marginBottom: 28, fontSize: 14 }}>
          Es como armar la página de tu empresa dentro de newen. Podés editarla después.
        </p>

        <form
          onSubmit={onSubmit}
          style={{
            background: "var(--nv-bg-card)",
            border: "1px solid var(--nv-border)",
            borderRadius: "var(--nv-radius-lg)",
            padding: 24,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nombre de la organización *</label>
              <input id="ob-nombre" style={inputStyle} placeholder="Ej: Espacio Crítico" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Identificador (slug) — se completa solo</label>
              <input id="ob-slug" style={inputStyle} placeholder="espacio-critico" />
            </div>
            <div>
              <label style={labelStyle}>Disciplina / tagline</label>
              <input id="ob-tagline" style={inputStyle} placeholder="Counseling organizacional" />
            </div>
            <div>
              <label style={labelStyle}>Rubro</label>
              <input id="ob-rubro" style={inputStyle} placeholder="Consultoría" />
            </div>
            <div>
              <label style={labelStyle}>Sede</label>
              <input id="ob-sede" style={inputStyle} placeholder="Buenos Aires, Argentina" />
            </div>
            <div>
              <label style={labelStyle}>Contacto</label>
              <input id="ob-contacto" style={inputStyle} placeholder="Nombre del referente" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input id="ob-email" style={inputStyle} type="email" placeholder="hola@empresa.com" />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input id="ob-tel" style={inputStyle} placeholder="+54 ..." />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>Servicios que ofrecés</label>
            <div
              id="ob-servicios"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
            >
              {SERVICIOS.map((s) => (
                <label
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13.5,
                    padding: "9px 12px",
                    border: "1px solid var(--nv-border)",
                    borderRadius: "var(--nv-radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" value={s} style={{ accentColor: "var(--nv-accent)" }} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>Color de acento</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: c,
                    border: accent === c ? "3px solid var(--nv-accent)" : "2px solid transparent",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--nv-state-error)", fontSize: 13, marginTop: 18 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              marginTop: 22,
              background: "var(--nv-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--nv-radius-md)",
              padding: "14px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Creando…" : "Crear mi espacio"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--nv-text-muted)",
  marginBottom: 6,
};
