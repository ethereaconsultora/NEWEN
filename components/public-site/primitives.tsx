// ============================================================
// Newen — Plantillas comerciales: primitivas reutilizables.
// Regla §2.5: botones, tarjetas, badges y encabezados se arman
// con variantes desde TenantSiteConfig (vía var(--site-*)).
// Componentes puros (sin hooks): sirven en server y client.
// ============================================================

import type { CSSProperties, ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import type { TenantSiteConfig } from "@/lib/public-site/types";

export function siteContainer(c: TenantSiteConfig): CSSProperties {
  return {
    width: "100%",
    maxWidth: c.layout.spacing.containerWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24,
  };
}

const PADDING: Record<string, string> = {
  compacto: "8px 16px",
  normal: "13px 26px",
  amplio: "17px 34px",
};

export function siteButtonStyle(c: TenantSiteConfig, style: "solid" | "outline" | "ghost" = "solid"): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: PADDING[c.components.button.paddingScale] || PADDING.normal,
    borderRadius: c.components.button.radius,
    fontSize: "var(--site-scale-body)",
    fontWeight: "var(--site-weight-emphasis)",
    fontFamily: "var(--site-font-body)",
    cursor: "pointer",
    textDecoration: "none",
    lineHeight: 1.2,
    border: "1px solid transparent",
    transition: "transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease",
    letterSpacing: "0.01em",
  };
  if (style === "outline") {
    return {
      ...base,
      background: "transparent",
      color: "var(--site-primary)",
      border: "1px solid var(--site-primary)",
    };
  }
  if (style === "ghost") {
    return {
      ...base,
      background: "transparent",
      color: "var(--site-primary)",
      border: "1px solid transparent",
    };
  }
  return {
    ...base,
    background: "var(--site-primary)",
    color: "var(--site-primary-fg)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
  };
}

/** Botón como <a> o <button>, según si tiene href. */
export function SiteButton({
  c,
  variant = "solid",
  href,
  children,
  style,
  ...rest
}: {
  c: TenantSiteConfig;
  variant?: "solid" | "outline" | "ghost";
  href?: string;
  children: ReactNode;
  style?: CSSProperties;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>, "style" | "children">) {
  const btnStyle = { ...siteButtonStyle(c, variant), ...style } as CSSProperties;
  if (href) {
    return (
      <a href={href} style={btnStyle} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" style={btnStyle} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export function siteCardStyle(c: TenantSiteConfig): CSSProperties {
  return {
    background: "var(--site-surface)",
    borderRadius: c.components.card.radius,
    border: c.components.card.border ? "1px solid var(--site-border)" : "none",
    boxShadow: c.components.card.shadow === "none" ? "none" : "var(--site-shadow-card)",
    padding: "28px",
  };
}

export function SiteCard({ c, children, style }: { c: TenantSiteConfig; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...siteCardStyle(c), ...style }}>{children}</div>;
}

export function siteBadgeStyle(c: TenantSiteConfig): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: c.components.badge.shape === "pill" ? 999 : 6,
    background: "var(--site-accent)",
    color: "var(--site-bg)",
    fontSize: "var(--site-scale-small)",
    fontWeight: "var(--site-weight-emphasis)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
}

export function SiteBadge({ c, children }: { c: TenantSiteConfig; children: ReactNode }) {
  return <span style={siteBadgeStyle(c)}>{children}</span>;
}

export function SiteEyebrow({ c, children }: { c: TenantSiteConfig; children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "var(--site-scale-small)",
        fontWeight: "var(--site-weight-emphasis)",
        letterSpacing: "var(--site-ls-eyebrow)",
        textTransform: "uppercase",
        color: "var(--site-accent)",
        marginBottom: 16,
      }}
    >
      {children}
    </span>
  );
}

export function SiteSectionHeader({
  c,
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  c: TenantSiteConfig;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div style={{ maxWidth: 720, margin: centered ? "0 auto" : undefined, textAlign: centered ? "center" : "left" }}>
      {eyebrow && <SiteEyebrow c={c}>{eyebrow}</SiteEyebrow>}
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--site-font-heading)",
          fontSize: "var(--site-scale-h1)",
          fontWeight: "var(--site-weight-heading)",
          letterSpacing: "var(--site-ls-heading)",
          lineHeight: "var(--site-lh-heading)",
          color: "var(--site-text)",
        }}
      >
        {title}
      </h2>
      {lead && (
        <p style={{ margin: "16px 0 0", color: "var(--site-text-2)", fontSize: "var(--site-scale-body)", lineHeight: "var(--site-lh-body)" }}>
          {lead}
        </p>
      )}
    </div>
  );
}

/** Línea divisoria fina entre secciones (look editorial). */
export function SiteRule({ c }: { c: TenantSiteConfig }) {
  return <hr style={{ border: "none", borderTop: "1px solid var(--site-border)", margin: 0 }} />;
}
