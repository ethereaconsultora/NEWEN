// ============================================================
// Newen — Plantillas comerciales: LAYOUT templates.
// §1: las plantillas definen ESTRUCTURA (nunca color/fuente).
// Todo lo visual sale de var(--site-*) vía TenantSiteConfig.
// §2.3: el logo se usa SOLO en header (zona 1) y footer (zona 2,
// chico + opacidad). El ogImage es metadata (zona 3).
// ============================================================

import type { CSSProperties, ReactNode } from "react";
import type { TenantSiteConfig, SectionId } from "@/lib/public-site/types";
import { SECTIONS_META } from "@/lib/public-site/defaults";
import { siteContainer, siteButtonStyle, SiteButton, SiteEyebrow } from "./primitives";
import { SiteSections } from "./sections";

const NAV_ITEMS = Object.values(SECTIONS_META);

function SectionNavItems({ c }: { c: TenantSiteConfig }) {
  const ids = c.layout.sections.order as SectionId[];
  return (
    <>
      {ids.map((id) => {
        const meta = SECTIONS_META[id];
        if (!meta) return null;
        return (
          <a
            key={id}
            href={`#${id}`}
            style={{
              color: "var(--site-text-2)",
              textDecoration: "none",
              fontSize: "var(--site-scale-body)",
              fontWeight: 500,
              transition: "color .15s ease",
            }}
          >
            {meta.label}
          </a>
        );
      })}
    </>
  );
}

/** Logo — zona 1 del estándar §2.3. */
function BrandMark({ c, size = 36 }: { c: TenantSiteConfig; size?: number }) {
  const logo = c.brand.logo;
  const src = logo.main || logo.onDark || logo.onLight || logo.icon;
  const fallback = c.displayName ? c.displayName.charAt(0).toUpperCase() : "N";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {src ? (
        <img src={src} alt={c.displayName || "Marca"} style={{ height: size, width: "auto", objectFit: "contain", display: "block" }} />
      ) : (
        <span
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.26,
            background: "var(--site-accent)",
            color: "var(--site-bg)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--site-font-heading)",
            fontSize: size * 0.5,
            fontWeight: "var(--site-weight-emphasis)",
          }}
        >
          {fallback}
        </span>
      )}
      {c.displayName && (
        <span
          style={{
            fontFamily: "var(--site-font-heading)",
            fontSize: "var(--site-scale-h3)",
            fontWeight: "var(--site-weight-heading)",
            color: "var(--site-text)",
            letterSpacing: "var(--site-ls-heading)",
          }}
        >
          {c.displayName}
        </span>
      )}
    </span>
  );
}

function NewenBar({ c }: { c: TenantSiteConfig }) {
  return (
    <div
      style={{
        padding: "8px 24px",
        fontSize: "var(--site-scale-small)",
        color: "var(--site-text-3)",
        textAlign: "center",
        borderBottom: "1px solid var(--site-border)",
      }}
    >
      Espacio comercial gestionado en <strong style={{ color: "var(--site-accent)" }}>newen</strong>
    </div>
  );
}

function CtaButton({ c }: { c: TenantSiteConfig }) {
  const cta = c.layout.header.ctaButton;
  if (!cta) return null;
  const href = (c.layout.sections.order as SectionId[]).includes("contacto") ? "#contacto" : undefined;
  return (
    <SiteButton c={c} variant={cta.style} href={href}>
      {cta.label}
    </SiteButton>
  );
}

/** Header — 3 estilos según config. */
export function SiteHeader({ org, c }: { org: any; c: TenantSiteConfig }) {
  const header = c.layout.header;
  if (header.style === "sidebar") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
        <aside
          style={{
            background: "var(--site-surface)",
            borderRight: "1px solid var(--site-border)",
            padding: "28px 24px",
            position: "sticky",
            top: 0,
            height: "100vh",
            alignSelf: "start",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <BrandMark c={c} size={34} />
          <nav style={{ display: "grid", gap: 6 }}>
            {NAV_ITEMS.filter((n) => (c.layout.sections.order as SectionId[]).includes(n.id)).map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  color: "var(--site-text-2)",
                  textDecoration: "none",
                  fontSize: "var(--site-scale-body)",
                  transition: "background .15s ease, color .15s ease",
                }}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: "auto" }}>
            <CtaButton c={c} />
          </div>
        </aside>
        <div style={{ minWidth: 0 }}>
          <NewenBar c={c} />
          <SiteHero org={org} c={c} sidebar />
          <SiteSections org={org} c={c} />
          <SiteFooter org={org} c={c} />
        </div>
      </div>
    );
  }

  const transparent = header.style === "transparent-on-hero";
  return (
    <div>
      {!transparent && <NewenBar c={c} />}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: transparent ? "var(--site-bg)" : "var(--site-bg)",
          borderBottom: transparent ? "none" : "1px solid var(--site-border)",
          padding: "14px 0",
        }}
      >
        <div style={{ ...siteContainer(c), display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <BrandMark c={c} size={36} />
          <nav style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {header.navType === "vertical" ? (
              <div style={{ display: "grid", gap: 8 }}>{<SectionNavItems c={c} />}</div>
            ) : (
              <SectionNavItems c={c} />
            )}
          </nav>
          <CtaButton c={c} />
        </div>
      </header>
    </div>
  );
}

/** Hero — 4 tipos según config. */
export function SiteHero({ org, c, sidebar = false, heroTypeOverride }: { org: any; c: TenantSiteConfig; sidebar?: boolean; heroTypeOverride?: "text-only" | "text-image" | "text-video" | "full-bleed-image" }) {
  const hero = { ...c.layout.hero, type: heroTypeOverride || c.layout.hero.type };
  const title = c.displayName || org.nombre;
  const lead = org.slogan || c.tagline || `${org.nombre} — desarrollo de capacidades para organizaciones y personas.`;
  const cover = org.cover_url;
  const alignment: CSSProperties =
    hero.alignment === "center" ? { textAlign: "center", alignItems: "center" } : { textAlign: "left", alignItems: "flex-start" };

  const heroText = (
    <div style={{ ...alignment, display: "flex", flexDirection: "column", gap: 22, maxWidth: 680 }}>
      <SiteEyebrow c={c}>{org.rubro || "Consultoría y acompañamiento"}</SiteEyebrow>
      <h1
        style={{
          margin: 0,
          color: "var(--site-text)",
          fontFamily: "var(--site-font-heading)",
          fontSize: "var(--site-scale-hero)",
          fontWeight: "var(--site-weight-heading)",
          letterSpacing: "var(--site-ls-heading)",
          lineHeight: "var(--site-lh-heading)",
        }}
      >
        {title}
      </h1>
      {org.tagline && (
        <p
          style={{
            margin: 0,
            color: "var(--site-accent)",
            fontSize: "var(--site-scale-h3)",
            fontFamily: "var(--site-font-accent)",
            letterSpacing: "0.02em",
          }}
        >
          {org.tagline}
        </p>
      )}
      <p style={{ margin: 0, color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)", maxWidth: 560 }}>
        {lead}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
        <SiteButton c={c} variant="solid" href="#contacto">
          {c.layout.header.ctaButton?.label || "Contactar"}
        </SiteButton>
        <SiteButton c={c} variant="outline" href="#servicios">
          Ver servicios
        </SiteButton>
      </div>
    </div>
  );

  if (hero.type === "full-bleed-image") {
    return (
      <div
        style={{
          minHeight: "72vh",
          display: "flex",
          alignItems: "center",
          backgroundImage: cover ? `url(${cover})` : "linear-gradient(135deg, var(--site-primary), var(--site-bg))",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.42)" }} />
        <div style={{ ...siteContainer(c), position: "relative", color: "#fff", paddingTop: 80, paddingBottom: 80 }}>{heroText}</div>
      </div>
    );
  }

  if (hero.type === "text-image") {
    return (
      <div style={{ ...siteContainer(c), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", paddingTop: 64, paddingBottom: 64 }}>
        <div>{heroText}</div>
        <div style={{ aspectRatio: "4/3", borderRadius: "var(--site-radius)", overflow: "hidden", boxShadow: "var(--site-shadow-card)" }}>
          {cover ? (
            <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--site-primary), var(--site-bg))" }} />
          )}
        </div>
      </div>
    );
  }

  if (hero.type === "text-video") {
    return (
      <div style={{ ...siteContainer(c), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", paddingTop: 64, paddingBottom: 64 }}>
        <div>{heroText}</div>
        <div
          style={{
            aspectRatio: "16/9",
            borderRadius: "var(--site-radius)",
            backgroundImage: cover ? `url(${cover})` : "linear-gradient(135deg, var(--site-primary), var(--site-bg))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "grid",
            placeItems: "center",
            boxShadow: "var(--site-shadow-card)",
          }}
        >
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              fontFamily: "var(--site-font-body)",
            }}
          >
            ▶
          </span>
        </div>
      </div>
    );
  }

  // text-only
  return (
    <div style={{ ...siteContainer(c), paddingTop: sidebar ? 40 : 88, paddingBottom: sidebar ? 40 : 96, display: "flex" }}>{heroText}</div>
  );
}

/** Footer — zona 2 del logo (§2.3): chico y con opacidad reducida. */
export function SiteFooter({ org, c }: { org: any; c: TenantSiteConfig }) {
  const completo = c.layout.footer.style === "completo-con-columnas";
  const servicios: string[] = Array.isArray(org.servicios) ? org.servicios : [];
  const logo = c.brand.logo.main || c.brand.logo.icon;
  return (
    <footer style={{ borderTop: "1px solid var(--site-border)", background: "var(--site-surface)", padding: "48px 0 28px" }}>
      <div style={{ ...siteContainer(c), display: "grid", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            {logo && (
              <img
                src={logo}
                alt=""
                style={{ height: 24, width: "auto", objectFit: "contain", opacity: 0.55, display: "block" }}
              />
            )}
            <span style={{ color: "var(--site-text-2)", fontSize: "var(--site-scale-small)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {c.displayName || org.nombre}
            </span>
          </span>
          <span style={{ color: "var(--site-text-3)", fontSize: "var(--site-scale-small)" }}>
            {org.email || org.telefono || org.sede || ""}
          </span>
        </div>

        {completo && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ color: "var(--site-text)", fontSize: "var(--site-scale-body)", fontWeight: "var(--site-weight-emphasis)" }}>Servicios</strong>
              {(servicios.length ? servicios : ["Consultoría", "Capacitaciones"]).map((s, i) => (
                <span key={i} style={{ color: "var(--site-text-2)", fontSize: "var(--site-scale-small)" }}>{s}</span>
              ))}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ color: "var(--site-text)", fontSize: "var(--site-scale-body)", fontWeight: "var(--site-weight-emphasis)" }}>Contacto</strong>
              <span style={{ color: "var(--site-text-2)", fontSize: "var(--site-scale-small)" }}>{org.contacto || "—"}</span>
              <span style={{ color: "var(--site-text-2)", fontSize: "var(--site-scale-small)" }}>{org.email || "—"}</span>
              <span style={{ color: "var(--site-text-2)", fontSize: "var(--site-scale-small)" }}>{org.telefono || "—"}</span>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--site-border)", paddingTop: 20, textAlign: "center", fontSize: "var(--site-scale-small)", color: "var(--site-text-3)" }}>
          Espacio de {c.displayName || org.nombre} gestionado en <strong style={{ color: "var(--site-accent)" }}>newen</strong>
        </div>
      </div>
    </footer>
  );
}

/** Plantilla: Editorial — secciones apiladas con líneas divisorias finas. */
export function EditorialTemplate({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <>
      <SiteHeader org={org} c={c} />
      <SiteHero org={org} c={c} />
      <SiteSections org={org} c={c} />
      <SiteFooter org={org} c={c} />
    </>
  );
}

/** Plantilla: Vitrina — hero con imagen grande + grilla de tarjetas. */
export function VitrinaTemplate({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <>
      <SiteHeader org={org} c={c} />
      <SiteHero org={org} c={c} heroTypeOverride="text-image" />
      <SiteSections org={org} c={c} />
      <SiteFooter org={org} c={c} />
    </>
  );
}

/** Plantilla: Panel comercial — sidebar fija + dashboard público. */
export function PanelComercialTemplate({ org, c }: { org: any; c: TenantSiteConfig }) {
  return <SiteHeader org={org} c={{ ...c, layout: { ...c.layout, header: { ...c.layout.header, style: "sidebar" } } }} />;
}

/** Plantilla: Minimal — header transparente + hero full-bleed + mucho whitespace. */
export function MinimalTemplate({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <>
      <SiteHeader
        org={org}
        c={{ ...c, layout: { ...c.layout, header: { ...c.layout.header, style: "transparent-on-hero" } } }}
      />
      <SiteHero org={org} c={{ ...c, layout: { ...c.layout, hero: { ...c.layout.hero, type: "full-bleed-image" } } }} />
      <SiteSections org={org} c={{ ...c, layout: { ...c.layout, spacing: { ...c.layout.spacing, sectionGapY: "140px" } } }} />
      <SiteFooter org={org} c={c} />
    </>
  );
}

/** Plantilla: Modular — grilla de bloques configurables (mosaico). */
export function ModularTemplate({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <>
      <SiteHeader org={org} c={c} />
      <SiteHero org={org} c={c} heroTypeOverride="text-only" />
      <div style={siteContainer(c)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16, padding: "var(--site-gap-y) 0" }}>
          {c.layout.sections.order.map((id, i) => {
            const meta = SECTIONS_META[id as SectionId];
            if (!meta) return null;
            const span = i % 3 === 0 ? "span 12" : i % 3 === 1 ? "span 7" : "span 5";
            return (
              <div
                key={id}
                id={id}
                style={{
                  gridColumn: span,
                  background: "var(--site-surface)",
                  border: "1px solid var(--site-border)",
                  borderRadius: "var(--site-radius-card)",
                  boxShadow: "var(--site-shadow-card)",
                  padding: 32,
                }}
              >
                <SiteEyebrow c={c}>{meta.desc}</SiteEyebrow>
                <h3 style={{ margin: 0, color: "var(--site-text)", fontFamily: "var(--site-font-heading)", fontSize: "var(--site-scale-h2)", fontWeight: "var(--site-weight-heading)" }}>
                  {meta.label}
                </h3>
                <p style={{ margin: "12px 0 0", color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)" }}>
                  Bloque de contenido de {c.displayName || org.nombre}. Configurable y reordenable desde el panel.
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <SiteFooter org={org} c={c} />
    </>
  );
}

export const TEMPLATES: Record<string, (p: { org: any; c: TenantSiteConfig }) => ReactNode> = {
  editorial: EditorialTemplate,
  vitrina: VitrinaTemplate,
  "panel-comercial": PanelComercialTemplate,
  minimal: MinimalTemplate,
  modular: ModularTemplate,
};
