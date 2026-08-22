"use client";

import * as React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  TenantSiteConfig,
  SiteTemplateId,
  SectionId,
  HeroType,
  HeroAlignment,
  CtaStyle,
  ShadowLevel,
  SiteMode,
} from "@/lib/public-site/types";
import {
  TEMPLATES_META,
  SECTIONS_META,
  PALETTE_PRESETS,
  getPreset,
} from "@/lib/public-site/defaults";
import { buildSiteConfig } from "@/lib/public-site/from-org";
import { googleFontsUrl } from "@/lib/public-site/css";
import { SitePage } from "@/components/public-site";
import styles from "./editor.module.css";

const FONT_OPTIONS = [
  { label: "Cormorant Garamond + Inter (clásica)", heading: "'Cormorant Garamond', serif", body: "'Inter', sans-serif" },
  { label: "DM Serif Display + DM Sans (Newen)", heading: "'DM Serif Display', serif", body: "'DM Sans', sans-serif" },
  { label: "Inter (moderna)", heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  { label: "Playfair Display + Lato (elegante)", heading: "'Playfair Display', serif", body: "'Lato', sans-serif" },
  { label: "Space Grotesk + Open Sans (geométrica)", heading: "'Space Grotesk', sans-serif", body: "'Open Sans', sans-serif" },
  { label: "Lora + Source Sans 3 (manuscrita)", heading: "'Lora', serif", body: "'Source Sans 3', sans-serif" },
];

const SCALES = {
  compacta: { hero: "44px", h1: "30px", h2: "24px", h3: "18px", body: "14px", small: "12px" },
  normal: { hero: "56px", h1: "38px", h2: "28px", h3: "20px", body: "15px", small: "12.5px" },
  amplia: { hero: "66px", h1: "46px", h2: "33px", h3: "23px", body: "16px", small: "13px" },
};

const COLOR_KEYS: { key: keyof TenantSiteConfig["colors"]; label: string }[] = [
  { key: "primary", label: "Marca" },
  { key: "accent", label: "Acento" },
  { key: "background", label: "Fondo" },
  { key: "surface", label: "Tarjetas" },
  { key: "border", label: "Borde" },
  { key: "textPrimary", label: "Texto" },
  { key: "textSecondary", label: "Texto 2" },
  { key: "textFaint", label: "Texto 3" },
];

export default function PublicSiteEditorPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
          <span className="spinner" />
        </div>
      }
    >
      <PublicSiteEditor />
    </Suspense>
  );
}

function PublicSiteEditor() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const bienvenido = searchParams.get("bienvenido") === "1";

  const [org, setOrg] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<TenantSiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/organizations/mine");
      const j = await res.json().catch(() => ({ org: null }));
      const o = j.org;
      setOrg(o ?? null);
      if (o) setConfig(buildSiteConfig(o));
      setLoading(false);
    })();
  }, []);

  // Carga las fuentes elegidas en el preview
  useEffect(() => {
    if (!config) return;
    const url = googleFontsUrl(config);
    if (!url) return;
    let el = document.getElementById("ps-font") as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      el.id = "ps-font";
      el.rel = "stylesheet";
      document.head.appendChild(el);
    }
    if (el.href !== url) el.href = url;
  }, [config]);

  const orgSlug = org?.slug;
  const preview = useMemo(() => {
    if (!org || !config) return null;
    return <SitePage org={org} config={config} preview />;
  }, [org, config]);

  if (loading || !config) {
    return (
      <div className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <span className="spinner" />
      </div>
    );
  }

  function patch(p: Partial<TenantSiteConfig>) {
    setConfig((c) => (c ? { ...c, ...p } : c));
  }
  function patchColors(p: Partial<TenantSiteConfig["colors"]>) {
    setConfig((c) => (c ? { ...c, colors: { ...c.colors, ...p } } : c));
  }
  function patchTypography(p: Partial<TenantSiteConfig["typography"]>) {
    setConfig((c) => (c ? { ...c, typography: { ...c.typography, ...p } } : c));
  }
  function patchLayout(p: Partial<TenantSiteConfig["layout"]>) {
    setConfig((c) => (c ? { ...c, layout: { ...c.layout, ...p } } : c));
  }

  function applyPreset(id: string) {
    const preset = getPreset(id);
    patchColors({ ...(preset?.colors as TenantSiteConfig["colors"]) });
  }

  function applyFont(idx: number) {
    const f = FONT_OPTIONS[idx];
    if (!f) return;
    patchTypography({ headingFont: f.heading, bodyFont: f.body, accentFont: f.heading });
  }

  function applyScale(scale: keyof typeof SCALES) {
    patchTypography({ scale: { ...SCALES[scale] } });
  }

  function toggleSection(id: SectionId) {
    setConfig((c) => {
      if (!c) return c;
      const order = [...c.layout.sections.order];
      const i = order.indexOf(id);
      if (i >= 0) order.splice(i, 1);
      else order.push(id);
      return { ...c, layout: { ...c.layout, sections: { order } } };
    });
  }

  function moveSection(id: SectionId, dir: -1 | 1) {
    setConfig((c) => {
      if (!c) return c;
      const order = [...c.layout.sections.order];
      const i = order.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return c;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...c, layout: { ...c.layout, sections: { order } } };
    });
  }

  async function save() {
    if (!config || !org) return;
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/organizations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_config: config }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("Error al guardar: " + (j.error || "intentá de nuevo"));
    } else {
      setStatus("Guardado — la página pública ya usa esta configuración");
      if (bienvenido) router.replace("/empresa/public-site");
    }
    setSaving(false);
  }

  const sectionsOn = config.layout.sections.order as SectionId[];
  const cta = config.layout.header.ctaButton;

  return (
    <div className={styles.page}>
      {/* Header del editor */}
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <h1>Página comercial</h1>
          <p>
            Plantillas y sistema visual de la página pública de {org?.nombre || "tu organización"} — sin tocar código.
          </p>
        </div>
        <div className={styles.headActions}>
          {orgSlug && (
            <a className={styles.btnGhost} href={`/e/${orgSlug}`} target="_blank" rel="noreferrer">
              Ver página pública ↗
            </a>
          )}
          <Link className={styles.btnGhost} href="/empresa">
            ← Panel
          </Link>
          <button className={styles.btn} onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      </div>

      {bienvenido && (
        <div className={styles.banner}>
          <div>
            <strong>¡Tu espacio ya está creado!</strong>
            <span>
              Este es el primer paso: armá tu página comercial. Elegí plantilla, colores, tipografía y secciones.
              Todo se guarda y se publica al instante en tu sitio.
            </span>
          </div>
          <button className={styles.btn} onClick={save}>
            Guardar y publicar
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {/* Controles */}
        <div className={styles.controls}>
          {/* Plantilla */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Plantilla</h3>
            <div className={styles.templates}>
              {(Object.keys(TEMPLATES_META) as SiteTemplateId[]).map((id) => (
                <button
                  key={id}
                  className={`${styles.template}${config.layout.template === id ? ` ${styles.templateActive}` : ""}`}
                  onClick={() => patchLayout({ template: id })}
                >
                  <strong>{TEMPLATES_META[id].label}</strong>
                  <span>{TEMPLATES_META[id].desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paleta */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Paleta</h3>
            <div className={styles.swatches}>
              {PALETTE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  className={`${styles.swatch}${config.colors.background === p.colors.background && config.colors.primary === p.colors.primary ? ` ${styles.swatchActive}` : ""}`}
                  onClick={() => applyPreset(p.id)}
                  title={p.nombre}
                >
                  <span className={styles.swatchDots}>
                    <span className={styles.dot} style={{ background: p.colors.primary }} />
                    <span className={styles.dot} style={{ background: p.colors.accent || p.colors.primary }} />
                    <span className={styles.dot} style={{ background: p.colors.background }} />
                  </span>
                  {p.nombre}
                </button>
              ))}
            </div>

            <div style={{ height: 14 }} />
            <div className={styles.row3}>
              {(Object.keys(SCALES) as (keyof typeof SCALES)[]).map((s) => (
                <button key={s} className={styles.miniBtn} onClick={() => applyScale(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ height: 14 }} />
            <div className={styles.row}>
              <label className={styles.label}>Modo</label>
              <select
                className={styles.select}
                value={config.colors.mode}
                onChange={(e) => patchColors({ mode: e.target.value as SiteMode })}
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div style={{ height: 14 }} />
            <div className={styles.row}>
              <label className={styles.label}>Colores personalizados</label>
              <div style={{ display: "grid", gap: 8 }}>
                {COLOR_KEYS.map(({ key, label }) => {
                  const value = String((config.colors as any)[key] || "");
                  const plain = value.startsWith("#") ? value : "#ffffff";
                  return (
                    <div key={key} className={styles.colorRow}>
                      <span style={{ fontSize: 12, color: "#b8ae9a" }}>{label}</span>
                      <input
                        type="color"
                        className={styles.input}
                        value={plain}
                        onChange={(e) => patchColors({ [key]: e.target.value } as any)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tipografía */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tipografía</h3>
            <div className={styles.row}>
              <label className={styles.label}>Estilo de letra</label>
              <select
                className={styles.select}
                value={FONT_OPTIONS.findIndex((f) => f.heading === config.typography.headingFont)}
                onChange={(e) => applyFont(Number(e.target.value))}
              >
                {FONT_OPTIONS.map((f, i) => (
                  <option key={f.label} value={i}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secciones */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Secciones</h3>
            <div className={styles.sections}>
              {(Object.keys(SECTIONS_META) as SectionId[]).map((id) => {
                const meta = SECTIONS_META[id];
                const on = sectionsOn.includes(id);
                const idx = sectionsOn.indexOf(id);
                return (
                  <div key={id} className={styles.sectionRow}>
                    <span className={styles.sectionLabel}>{meta.label}</span>
                    <button
                      className={`${styles.arrowBtn}`}
                      disabled={idx <= 0}
                      onClick={() => on && moveSection(id, -1)}
                      title="Subir"
                    >
                      ↑
                    </button>
                    <button
                      className={styles.arrowBtn}
                      disabled={idx < 0 || idx >= sectionsOn.length - 1}
                      onClick={() => on && moveSection(id, 1)}
                      title="Bajar"
                    >
                      ↓
                    </button>
                    <button
                      className={`${styles.sectionToggle}${on ? ` ${styles.sectionOn}` : ""}`}
                      onClick={() => toggleSection(id)}
                      title={on ? "Quitar" : "Agregar"}
                    >
                      ✓
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hero y CTA */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Hero y botón</h3>
            <div className={styles.row2}>
              <div className={styles.row}>
                <label className={styles.label}>Tipo de hero</label>
                <select
                  className={styles.select}
                  value={config.layout.hero.type}
                  onChange={(e) => patchLayout({ hero: { ...config.layout.hero, type: e.target.value as HeroType } })}
                >
                  <option value="text-only">Texto</option>
                  <option value="text-image">Texto + imagen</option>
                  <option value="text-video">Texto + video</option>
                  <option value="full-bleed-image">Imagen a pantalla completa</option>
                </select>
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Alineación</label>
                <select
                  className={styles.select}
                  value={config.layout.hero.alignment}
                  onChange={(e) => patchLayout({ hero: { ...config.layout.hero, alignment: e.target.value as HeroAlignment } })}
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centrada</option>
                </select>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={styles.row2}>
              <div className={styles.row}>
                <label className={styles.label}>Botón principal</label>
                <input
                  className={styles.input}
                  value={cta?.label || ""}
                  onChange={(e) =>
                    patchLayout({
                      header: {
                        ...config.layout.header,
                        ctaButton: { label: e.target.value || "Contactar", style: cta?.style || "solid" },
                      },
                    })
                  }
                />
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Estilo</label>
                <select
                  className={styles.select}
                  value={cta?.style || "solid"}
                  onChange={(e) =>
                    patchLayout({
                      header: {
                        ...config.layout.header,
                        ctaButton: { label: cta?.label || "Contactar", style: e.target.value as CtaStyle },
                      },
                    })
                  }
                >
                  <option value="solid">Relleno</option>
                  <option value="outline">Contorno</option>
                  <option value="ghost">Fantasma</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Detalles</h3>
            <div className={styles.row2}>
              <div className={styles.row}>
                <label className={styles.label}>Radio de esquinas</label>
                <input
                  className={styles.input}
                  value={config.layout.spacing.radius}
                  onChange={(e) =>
                    patchLayout({ spacing: { ...config.layout.spacing, radius: e.target.value || "10px" } })
                  }
                />
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Sombra</label>
                <select
                  className={styles.select}
                  value={config.layout.spacing.shadow}
                  onChange={(e) =>
                    patchLayout({ spacing: { ...config.layout.spacing, shadow: e.target.value as ShadowLevel } })
                  }
                >
                  <option value="none">Sin sombra</option>
                  <option value="sutil">Sutil</option>
                  <option value="marcada">Marcada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guardar */}
          <div className={`${styles.card} ${styles.saveBar}`}>
            <button className={styles.btn} onClick={save} disabled={saving}>
              {saving ? "Guardando…" : "Guardar configuración"}
            </button>
            {orgSlug && (
              <a className={styles.btnGhost} href={`/e/${orgSlug}`} target="_blank" rel="noreferrer">
                Ver página pública ↗
              </a>
            )}
            {status && <span className={`${styles.status}${status.startsWith("Guardado") ? ` ${styles.statusOk}` : ""}`}>{status}</span>}
          </div>
        </div>

        {/* Preview */}
        <div className={styles.previewWrap}>
          <div className={styles.previewHead}>
            <span>Vista previa en vivo</span>
            <span className={styles.previewTag}>{TEMPLATES_META[config.layout.template].label}</span>
          </div>
          <div className={styles.preview}>
            <div className={styles.previewInner} style={{ zoom: 0.58 }}>
              {preview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
