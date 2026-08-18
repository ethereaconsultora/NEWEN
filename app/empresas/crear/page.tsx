"use client";

import { useEffect, useMemo, useState } from "react";
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

const BANNERS: { name: string; css: string }[] = [
  { name: "Carbón & Oro", css: "linear-gradient(135deg,#1a1710 0%,#0a0806 60%,#3e3528 130%)" },
  { name: "Tierra", css: "linear-gradient(135deg,#3e2e23 0%,#241a12 55%,#6b5038 130%)" },
  { name: "Océano", css: "linear-gradient(135deg,#0d2130 0%,#0a1820 55%,#1e4254 130%)" },
  { name: "Bosque", css: "linear-gradient(135deg,#14261b 0%,#0c1a12 55%,#2b4a36 130%)" },
  { name: "Malva", css: "linear-gradient(135deg,#251a2e 0%,#18111e 55%,#453157 130%)" },
  { name: "Noche", css: "linear-gradient(135deg,#101426 0%,#0a0e1a 55%,#26315c 130%)" },
  { name: "Coral", css: "linear-gradient(135deg,#2e1715 0%,#1d100e 55%,#5c2f28 130%)" },
  { name: "Niebla", css: "linear-gradient(135deg,#1d1f21 0%,#121416 55%,#3a3e42 130%)" },
];

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function initialsOf(nombre: string) {
  const words = nombre.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "E";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function CrearEspacioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(undefined);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState("");
  const [rubro, setRubro] = useState("");
  const [sede, setSede] = useState("");
  const [contacto, setContacto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [banner, setBanner] = useState(BANNERS[0].css);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => initialsOf(nombre || "Espacio"), [nombre]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onNombre(v: string) {
    setNombre(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function toggleServicio(s: string) {
    setServicios((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!nombre.trim()) {
      setError("Ingresá el nombre de tu organización.");
      setSaving(false);
      return;
    }
    const finalSlug = slugify(slug || nombre);
    if (!finalSlug) {
      setError("El identificador (slug) no es válido.");
      setSaving(false);
      return;
    }

    const { error: insErr } = await supabase.from("organizations").insert({
      slug: finalSlug,
      nombre: nombre.trim(),
      tagline: tagline.trim() || null,
      rubro: rubro.trim() || null,
      sede: sede.trim() || null,
      contacto: contacto.trim() || null,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      servicios,
      primary_color: "#0a0806",
      accent_color: accent,
      cover_gradient: banner,
    });
    if (insErr) {
      setError("Error al crear: " + insErr.message);
      setSaving(false);
      return;
    }

    const { data: orgRow } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", finalSlug)
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
        <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 28 }}>Necesitás iniciar sesión</h1>
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
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <Link href="/empresas" style={{ fontSize: 13, color: "var(--nv-text-muted)", textDecoration: "none" }}>
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
          Elegí el banner y los colores; la vista previa se actualiza al instante.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          {/* Formulario */}
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
                <input
                  style={inputStyle}
                  value={nombre}
                  onChange={(e) => onNombre(e.target.value)}
                  placeholder="Ej: Espacio Crítico"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Identificador (slug) — se completa solo</label>
                <input
                  style={inputStyle}
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="espacio-critico"
                />
              </div>
              <div>
                <label style={labelStyle}>Disciplina / tagline</label>
                <input
                  style={inputStyle}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Counseling organizacional"
                />
              </div>
              <div>
                <label style={labelStyle}>Rubro</label>
                <input style={inputStyle} value={rubro} onChange={(e) => setRubro(e.target.value)} placeholder="Consultoría" />
              </div>
              <div>
                <label style={labelStyle}>Sede</label>
                <input style={inputStyle} value={sede} onChange={(e) => setSede(e.target.value)} placeholder="Buenos Aires, Argentina" />
              </div>
              <div>
                <label style={labelStyle}>Contacto</label>
                <input style={inputStyle} value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre del referente" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hola@empresa.com" />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input style={inputStyle} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 ..." />
              </div>
            </div>

            {/* Banner */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Banner de portada</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {BANNERS.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setBanner(b.css)}
                    title={b.name}
                    style={{
                      height: 44,
                      borderRadius: 10,
                      background: b.css,
                      border: banner === b.css ? "3px solid var(--nv-accent)" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Color de acento */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Color de acento (también es el color del logo)</label>
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

            {/* Servicios */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Servicios que ofrecés</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
                    <input
                      type="checkbox"
                      checked={servicios.includes(s)}
                      onChange={() => toggleServicio(s)}
                      style={{ accentColor: "var(--nv-accent)" }}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {error && <p style={{ color: "var(--nv-state-error)", fontSize: 13, marginTop: 18 }}>{error}</p>}

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

          {/* Vista previa en vivo */}
          <div style={{ position: "sticky", top: 24 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--nv-text-muted)",
                marginBottom: 8,
              }}
            >
              Vista previa en vivo
            </div>
            <div
              style={{
                background: "#0a0806",
                color: "#f2ede4",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid var(--nv-border)",
                boxShadow: "var(--nv-shadow)",
              }}
            >
              <div style={{ height: 90, background: banner, backgroundSize: "cover" }} />
              <div style={{ background: "#f4efe6", color: "#241d12", padding: "10px 18px 18px" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    marginTop: -30,
                    background: accent,
                    color: "#241d12",
                    border: "3px solid #f4efe6",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "Georgia, serif",
                    fontSize: 22,
                  }}
                >
                  {initials}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, marginTop: 10 }}>
                  {nombre || "Nombre de tu organización"}
                </div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b5f4a" }}>
                  {tagline || "Tagline"}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--nv-text-muted)", marginTop: 10 }}>
              El logo usa las iniciales del nombre con tu color de acento. La subida de una imagen
              de logo vendrá en un próximo paso.
            </p>
          </div>
        </div>
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
