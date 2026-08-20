"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  TEMAS,
  TIPOGRAFIAS,
  TAMANOS,
  getTema,
  getTipografia,
  getTamano,
} from "@/lib/consultorio-apariencia";
import FontLoader from "@/components/consultorio/FontLoader";

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

const FALLBACK_COVER = "linear-gradient(135deg, #1a1710 0%, #0a0806 60%, #3e3528 130%)";

export default function CrearEspacioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(undefined);
  const [org, setOrg] = useState<any | null>(null);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slogan, setSlogan] = useState("");
  const [tagline, setTagline] = useState("");
  const [rubro, setRubro] = useState("");
  const [sede, setSede] = useState("");
  const [contacto, setContacto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicios, setServicios] = useState("");
  const [temaId, setTemaId] = useState("newen");
  const [fontId, setFontId] = useState("newen");
  const [sizeId, setSizeId] = useState("mediana");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => initialsOf(nombre || "Espacio"), [nombre]);
  const tema = getTema(temaId);
  const tipografia = getTipografia(fontId);
  const tamano = getTamano(sizeId);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      if (!data.user) return;
      const res = await fetch("/api/organizations/mine");
      const j = await res.json().catch(() => ({ org: null }));
      const o = j.org;
      setOrg(o ?? null);
      if (o) {
        setNombre(o.nombre ?? "");
        setSlug(o.slug ?? "");
        setSlogan(o.slogan ?? "");
        setTagline(o.tagline ?? "");
        setRubro(o.rubro ?? "");
        setSede(o.sede ?? "");
        setContacto(o.contacto ?? "");
        setEmail(o.email ?? "");
        setTelefono(o.telefono ?? "");
        setServicios((o.servicios ?? []).join("\n"));
        setFontId(o.font_id || "newen");
        setSizeId(o.font_size || "mediana");
        const t = TEMAS.find((x) => x.accent === o.accent_color);
        if (t) setTemaId(t.id);
        if (o.logo_url) setLogoPreview(o.logo_url);
        if (o.cover_url) setBannerPreview(o.cover_url);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onNombre(v: string) {
    setNombre(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  function onBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBannerFile(f);
    setBannerPreview(URL.createObjectURL(f));
  }

  async function uploadFile(file: File, folder: string): Promise<{ url: string | null; error: string | null }> {
    const ext = file.name.split(".").pop() || "png";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("organizations").upload(path, file, { upsert: true });
    if (error) return { url: null, error: error.message };
    const { data } = supabase.storage.from("organizations").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
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

    let logo_url: string | null = org?.logo_url ?? null;
    let cover_url: string | null = org?.cover_url ?? null;
    if (logoFile) {
      const r = await uploadFile(logoFile, "logos");
      if (r.error) {
        setError("No se pudo subir el logo: " + r.error);
        setSaving(false);
        return;
      }
      logo_url = r.url;
    }
    if (bannerFile) {
      const r = await uploadFile(bannerFile, "banners");
      if (r.error) {
        setError("No se pudo subir el banner: " + r.error);
        setSaving(false);
        return;
      }
      cover_url = r.url;
    }

    const serviciosArr = servicios
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const body: Record<string, any> = {
      nombre: nombre.trim(),
      slogan: slogan.trim() || null,
      tagline: tagline.trim() || null,
      rubro: rubro.trim() || null,
      sede: sede.trim() || null,
      contacto: contacto.trim() || null,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      servicios: serviciosArr,
      primary_color: "#0a0806",
      accent_color: tema.accent,
      logo_url,
      cover_url,
      font_id: fontId,
      font_size: sizeId,
    };
    if (!org) {
      body.slug = finalSlug;
      body.cover_gradient = bannerFile ? null : FALLBACK_COVER;
    }

    const res = await fetch("/api/organizations", {
      method: org ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear el espacio.");
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

  const uploadBoxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px dashed var(--nv-border-strong)",
    borderRadius: "var(--nv-radius-md)",
    padding: "16px",
    cursor: "pointer",
    color: "var(--nv-text-secondary)",
    fontSize: 13,
    background: "var(--nv-bg-input)",
  };

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 28 }}>Necesitás iniciar sesión</h1>
        <p style={{ color: "var(--nv-text-secondary)", maxWidth: 420 }}>
          Para crear el espacio comercial de tu organización, primero iniciá sesión en newen.
        </p>
        <Link href="/auth/login" style={{ background: "var(--nv-accent)", color: "#fff", textDecoration: "none", padding: "12px 24px", borderRadius: "var(--nv-radius-md)", fontWeight: 600 }}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", color: "var(--nv-text-primary)", fontFamily: "var(--nv-font-body)", padding: "48px 24px 96px" }}>
      <FontLoader gFont={tipografia.gFont} />
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <Link href="/empresas" style={{ fontSize: 13, color: "var(--nv-text-muted)", textDecoration: "none" }}>
          ← Volver a la vidriera
        </Link>
        <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.1, margin: "16px 0 6px" }}>
          {org ? "Editá el espacio de tu organización" : "Creá el espacio de tu organización"}
        </h1>
        <p style={{ color: "var(--nv-text-secondary)", marginBottom: 28, fontSize: 14 }}>
          Subí tu logo y banner, y elegí la apariencia. La vista previa se actualiza al instante.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Formulario */}
          <form onSubmit={onSubmit} style={{ background: "var(--nv-bg-card)", border: "1px solid var(--nv-border)", borderRadius: "var(--nv-radius-lg)", padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Nombre de la organización *</label>
                <input style={inputStyle} value={nombre} onChange={(e) => onNombre(e.target.value)} placeholder="Ej: Espacio Crítico" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Slogan</label>
                <input style={inputStyle} value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Ej: No vendemos servicios, desarrollamos capacidades" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Identificador (slug) — se completa solo</label>
                <input style={inputStyle} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} placeholder="espacio-critico" />
              </div>
              <div>
                <label style={labelStyle}>Disciplina / tagline</label>
                <input style={inputStyle} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Counseling organizacional" />
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

            {/* Logo */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Logo de la empresa (imagen)</label>
              {logoPreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img src={logoPreview} alt="Logo" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, border: "1px solid var(--nv-border)", background: "#fff" }} />
                  <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} style={{ fontSize: 12, color: "var(--nv-state-error)", background: "none", border: "none", cursor: "pointer" }}>
                    Quitar
                  </button>
                </div>
              ) : (
                <label style={uploadBoxStyle}>
                  <input type="file" accept="image/*" onChange={onLogo} style={{ display: "none" }} />
                  📷 Subir logo
                </label>
              )}
            </div>

            {/* Banner */}
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Banner de fondo (imagen)</label>
              {bannerPreview ? (
                <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
                  <img src={bannerPreview} alt="Banner" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                  <button type="button" onClick={() => { setBannerFile(null); setBannerPreview(null); }} style={{ position: "absolute", top: 8, right: 8, fontSize: 12, color: "#fff", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                    Quitar
                  </button>
                </div>
              ) : (
                <label style={uploadBoxStyle}>
                  <input type="file" accept="image/*" onChange={onBanner} style={{ display: "none" }} />
                  🖼️ Subir banner
                </label>
              )}
            </div>

            {/* Paleta */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Paleta de colores</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {TEMAS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTemaId(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: "var(--nv-radius-md)", border: temaId === t.id ? "2px solid var(--nv-accent)" : "1px solid var(--nv-border)", background: "var(--nv-bg-input)", color: "var(--nv-text-primary)", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
                    {t.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipografía */}
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Tipografía</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {TIPOGRAFIAS.map((f) => (
                  <button key={f.id} type="button" onClick={() => setFontId(f.id)}
                    style={{ padding: "10px 12px", borderRadius: "var(--nv-radius-md)", border: fontId === f.id ? "2px solid var(--nv-accent)" : "1px solid var(--nv-border)", background: "var(--nv-bg-input)", color: "var(--nv-text-primary)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{f.nombre}</div>
                    <div style={{ fontSize: 11.5, color: "var(--nv-text-muted)", fontFamily: f.fh }}>{f.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tamaño */}
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Tamaño de letra</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TAMANOS.map((s) => (
                  <button key={s.id} type="button" onClick={() => setSizeId(s.id)}
                    style={{ padding: "8px 16px", borderRadius: "var(--nv-radius-full)", border: sizeId === s.id ? "2px solid var(--nv-accent)" : "1px solid var(--nv-border)", background: sizeId === s.id ? "var(--nv-accent-soft)" : "var(--nv-bg-input)", color: "var(--nv-text-primary)", cursor: "pointer", fontSize: s.zoom * 12, fontFamily: "inherit" }}>
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Servicios */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Servicios / especialidades (uno por línea)</label>
              <textarea
                value={servicios}
                onChange={(e) => setServicios(e.target.value)}
                placeholder={"Counseling organizacional\nDesarrollo de liderazgo\nPrevención de burnout"}
                style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {error && <p style={{ color: "var(--nv-state-error)", fontSize: 13, marginTop: 18 }}>{error}</p>}

            <button type="submit" disabled={saving}
              style={{ width: "100%", marginTop: 22, background: "var(--nv-accent)", color: "#fff", border: "none", borderRadius: "var(--nv-radius-md)", padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? (org ? "Guardando…" : "Creando…") : org ? "Guardar cambios" : "Crear mi espacio"}
            </button>
          </form>

          {/* Vista previa */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--nv-text-muted)", marginBottom: 8 }}>
              Vista previa en vivo
            </div>
            <div style={{ background: "#0a0806", color: "#f2ede4", borderRadius: 14, overflow: "hidden", border: "1px solid var(--nv-border)", boxShadow: "var(--nv-shadow)", zoom: tamano.zoom }}>
              <div style={{ height: 90, background: bannerPreview ? `url(${bannerPreview}) center/cover` : FALLBACK_COVER }} />
              <div style={{ background: "#f4efe6", color: "#241d12", padding: "10px 18px 18px" }}>
                <div style={{ width: 56, height: 56, marginTop: -30, background: logoPreview ? "#fff" : tema.accent, color: "#241d12", border: "3px solid #f4efe6", display: "grid", placeItems: "center", fontFamily: tipografia.fh, fontSize: 22, overflow: "hidden" }}>
                  {logoPreview ? <img src={logoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : initials}
                </div>
                <div style={{ fontFamily: tipografia.fh, fontSize: 20, marginTop: 10 }}>
                  {nombre || "Nombre de tu organización"}
                </div>
                {slogan && <div style={{ fontFamily: tipografia.fb, fontSize: 11.5, fontStyle: "italic", color: "#6b5f4a", marginTop: 4 }}>{slogan}</div>}
                <div style={{ fontFamily: tipografia.fb, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: tema.accent, marginTop: 6 }}>
                  {tagline || "Tagline"}
                </div>
              </div>
            </div>
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
