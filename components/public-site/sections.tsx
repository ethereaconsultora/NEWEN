// ============================================================
// Newen — Plantillas comerciales: secciones de contenido.
// Cada sección lee datos de la organización (org) y del config
// (c). Ningún color/fuente/radio hardcodeado: var(--site-*).
// ============================================================

import type { CSSProperties, ReactNode } from "react";
import type { TenantSiteConfig, SectionId } from "@/lib/public-site/types";
import {
  siteContainer,
  siteCardStyle,
  siteButtonStyle,
  SiteBadge,
  SiteSectionHeader,
} from "./primitives";

const SECTION_PAD = "var(--site-gap-y) 0";

export function sectionWrap(c: TenantSiteConfig, extra: CSSProperties = {}): CSSProperties {
  return {
    padding: SECTION_PAD,
    ...extra,
  };
}

export function sectionInner(c: TenantSiteConfig): CSSProperties {
  return siteContainer(c);
}

/** Aplica la variante de sección según el modo (fondo alterno). */
function sectionBg(i: number): CSSProperties {
  // Fondo alterno sutil: usamos surface para pares, background para impares.
  return i % 2 === 1 ? { background: "var(--site-surface)" } : {};
}

function Chip({ c, children }: { c: TenantSiteConfig; children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 16px",
        borderRadius: 999,
        border: "1px solid var(--site-border)",
        color: "var(--site-text-2)",
        fontSize: "var(--site-scale-small)",
        background: "transparent",
      }}
    >
      {children}
    </span>
  );
}

function ServiciosSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  const servicios: string[] = Array.isArray(org.servicios) ? org.servicios : [];
  const items = servicios.length ? servicios : ["Diagnóstico", "Acompañamiento", "Desarrollo de capacidades"];
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <SiteSectionHeader
          c={c}
          eyebrow="Qué ofrecemos"
          title="Capacidades que desarrollamos"
          lead={`${org.nombre} acompaña a organizaciones y personas con un enfoque humanista y profesional.`}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 40,
          }}
        >
          {items.map((s: string, i: number) => (
            <div key={i} style={{ ...siteCardStyle(c), display: "grid", gap: 12, alignContent: "start" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "var(--site-accent)",
                  color: "var(--site-bg)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--site-font-heading)",
                  fontWeight: "var(--site-weight-emphasis)",
                  fontSize: 18,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                style={{
                  margin: 0,
                  color: "var(--site-text)",
                  fontFamily: "var(--site-font-heading)",
                  fontSize: "var(--site-scale-h3)",
                  fontWeight: "var(--site-weight-heading)",
                  lineHeight: "var(--site-lh-heading)",
                }}
              >
                {s}
              </h3>
              <p style={{ margin: 0, color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)" }}>
                Trabajamos esta capacidad con una mirada puesta en las personas y en los resultados.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetodologiaSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  const pasos = [
    { t: "Escuchamos", d: "Diagnóstico conjunto de la situación y los objetivos." },
    { t: "Diseñamos", d: "Un plan a medida, con métricas y etapas claras." },
    { t: "Acompañamos", d: "Intervenciones y seguimiento continuo del proceso." },
    { t: "Sostenemos", d: "Cierre con devolución y herramientas para continuar." },
  ];
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <SiteSectionHeader
          c={c}
          eyebrow="Cómo trabajamos"
          title="Una metodología que pone a las personas en el centro"
          lead={`En ${org.nombre} cada proceso se diseña con la organización y se sostiene en el tiempo.`}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 40,
          }}
        >
          {pasos.map((p, i) => (
            <div key={p.t} style={{ display: "grid", gap: 10, alignContent: "start" }}>
              <div
                style={{
                  fontFamily: "var(--site-font-accent)",
                  fontSize: "var(--site-scale-h1)",
                  color: "var(--site-accent)",
                  fontWeight: "var(--site-weight-heading)",
                  lineHeight: 1,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                style={{
                  margin: 0,
                  color: "var(--site-text)",
                  fontFamily: "var(--site-font-heading)",
                  fontSize: "var(--site-scale-h3)",
                  fontWeight: "var(--site-weight-heading)",
                }}
              >
                {p.t}
              </h3>
              <p style={{ margin: 0, color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)" }}>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquipoSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  const personas = org.contacto ? [org.contacto] : [];
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <SiteSectionHeader
          c={c}
          eyebrow="Equipo"
          title="Quiénes te van a acompañar"
          lead={`Un equipo interdisciplinario comprometido con el desarrollo de capacidades.`}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginTop: 40 }}>
          {personas.map((p: string) => (
            <div key={p} style={{ ...siteCardStyle(c), display: "grid", gap: 12 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: "var(--site-accent)",
                  color: "var(--site-bg)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--site-font-heading)",
                  fontSize: 22,
                  fontWeight: "var(--site-weight-emphasis)",
                }}
              >
                {String(p).charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: 0, color: "var(--site-text)", fontFamily: "var(--site-font-heading)", fontSize: "var(--site-scale-h3)", fontWeight: "var(--site-weight-heading)" }}>{p}</h3>
              <p style={{ margin: 0, color: "var(--site-text-2)", fontSize: "var(--site-scale-body)" }}>Referente de {org.nombre}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimoniosSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  const items = [
    { q: "Un acompañamiento cercano y profesional. Cambió la manera de trabajar en equipo.", a: "Cliente de " + org.nombre },
    { q: "Procesos claros, humanos y con resultados concretos.", a: "Organización acompañada" },
  ];
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <SiteSectionHeader c={c} eyebrow="Testimonios" title="Lo que dicen quienes trabajaron con nosotros" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 40 }}>
          {items.map((t, i) => (
            <div key={i} style={{ ...siteCardStyle(c), display: "grid", gap: 14 }}>
              <div style={{ fontFamily: "var(--site-font-accent)", fontSize: 40, color: "var(--site-accent)", lineHeight: 1 }}>“</div>
              <p style={{ margin: 0, color: "var(--site-text)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)", fontStyle: "italic" }}>{t.q}</p>
              <span style={{ color: "var(--site-text-3)", fontSize: "var(--site-scale-small)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactoSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  const rows = [
    { k: "Contacto", v: org.contacto },
    { k: "Email", v: org.email },
    { k: "Teléfono", v: org.telefono },
    { k: "Sede", v: org.sede },
  ].filter((r) => r.v);
  const cta = c.layout.header.ctaButton?.label || "Contactar";
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <div style={{ ...siteCardStyle(c), display: "grid", gap: 24, gridTemplateColumns: "1fr auto", alignItems: "center" }}>
          <div>
            <SiteSectionHeader c={c} eyebrow="Contacto" title="Hablemos de tu organización" lead={`Escribinos y coordinamos una primera conversación con ${org.nombre}.`} />
            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {rows.map((r) => (
                <div key={r.k} style={{ display: "flex", gap: 10, fontSize: "var(--site-scale-body)", color: "var(--site-text-2)" }}>
                  <strong style={{ color: "var(--site-text)", fontWeight: "var(--site-weight-emphasis)", minWidth: 90 }}>{r.k}:</strong>
                  <span>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
            <a href={org.email ? `mailto:${org.email}` : undefined} style={siteButtonStyle(c, "solid")}>
              {cta}
            </a>
            {org.telefono && (
              <a href={`tel:${org.telefono.replace(/\s/g, "")}`} style={siteButtonStyle(c, "outline")}>
                Llamar por teléfono
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TurnosSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <div style={{ ...siteCardStyle(c), display: "grid", gap: 16, textAlign: "center", justifyItems: "center" }}>
          <SiteBadge c={c}>Agenda</SiteBadge>
          <h2
            style={{
              margin: 0,
              color: "var(--site-text)",
              fontFamily: "var(--site-font-heading)",
              fontSize: "var(--site-scale-h1)",
              fontWeight: "var(--site-weight-heading)",
              lineHeight: "var(--site-lh-heading)",
            }}
          >
            Reservá tu espacio
          </h2>
          <p style={{ margin: 0, maxWidth: 520, color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)" }}>
            {org.nombre} atiende por turnos. Escribinos y coordinamos fecha y horario que se ajusten a tu momento.
          </p>
          <a href={org.email ? `mailto:${org.email}` : undefined} style={{ ...siteButtonStyle(c, "solid"), marginTop: 8 }}>
            Pedir turno
          </a>
        </div>
      </div>
    </div>
  );
}

function CatalogoSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  const items: string[] = Array.isArray(org.servicios) ? org.servicios : ["Consultoría", "Capacitaciones"];
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <SiteSectionHeader c={c} eyebrow="Catálogo" title="Nuestros servicios" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
          {items.map((s: string, i: number) => (
            <Chip key={i} c={c}>{s}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProximosSection({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <div style={sectionWrap(c)}>
      <div style={sectionInner(c)}>
        <div style={{ ...siteCardStyle(c), display: "grid", gap: 12 }}>
          <SiteBadge c={c}>Próximamente</SiteBadge>
          <h3
            style={{
              margin: 0,
              color: "var(--site-text)",
              fontFamily: "var(--site-font-heading)",
              fontSize: "var(--site-scale-h3)",
              fontWeight: "var(--site-weight-heading)",
            }}
          >
            Actividades y encuentros de {org.nombre}
          </h3>
          <p style={{ margin: 0, color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)" }}>
            Sumate a las próximas actividades abiertas. Si querés más información, escribinos.
          </p>
        </div>
      </div>
    </div>
  );
}

const SECTION_COMPONENTS: Record<SectionId, (p: { org: any; c: TenantSiteConfig; i: number }) => ReactNode> = {
  servicios: ({ org, c, i }) => <div style={sectionBg(i)}><ServiciosSection org={org} c={c} /></div>,
  metodologia: ({ org, c, i }) => <div style={sectionBg(i)}><MetodologiaSection org={org} c={c} /></div>,
  equipo: ({ org, c, i }) => <div style={sectionBg(i)}><EquipoSection org={org} c={c} /></div>,
  testimonios: ({ org, c, i }) => <div style={sectionBg(i)}><TestimoniosSection org={org} c={c} /></div>,
  contacto: ({ org, c, i }) => <div style={sectionBg(i)}><ContactoSection org={org} c={c} /></div>,
  turnos: ({ org, c, i }) => <div style={sectionBg(i)}><TurnosSection org={org} c={c} /></div>,
  catalogo: ({ org, c, i }) => <div style={sectionBg(i)}><CatalogoSection org={org} c={c} /></div>,
  proximos: ({ org, c, i }) => <div style={sectionBg(i)}><ProximosSection org={org} c={c} /></div>,
};

/** Renderiza las secciones en el orden configurado por la empresa. */
export function SiteSections({ org, c }: { org: any; c: TenantSiteConfig }) {
  return (
    <>
      {c.layout.sections.order.map((id, i) => {
        const render = SECTION_COMPONENTS[id as SectionId];
        return render ? <div key={id}>{render({ org, c, i })}</div> : null;
      })}
    </>
  );
}
