// ============================================================
// Newen — Plantillas comerciales: variables CSS + fuentes.
// Todo componente lee var(--site-*) — nunca valores hardcodeados.
// ============================================================

import type { TenantSiteConfig, ShadowLevel } from "./types";

function shadowValue(level: ShadowLevel): string {
  switch (level) {
    case "none":
      return "none";
    case "marcada":
      return "0 18px 50px rgba(0,0,0,0.16)";
    default:
      return "0 6px 24px rgba(0,0,0,0.07)";
  }
}

export function siteCssVars(c: TenantSiteConfig): Record<string, string> {
  const co = c.colors;
  const ty = c.typography;
  const la = c.layout;
  const cp = c.components;
  return {
    "--site-primary": co.primary,
    "--site-primary-fg": co.primaryForeground,
    "--site-secondary": co.secondary || co.primary,
    "--site-accent": co.accent || co.primary,
    "--site-bg": co.background,
    "--site-surface": co.surface,
    "--site-surface-elevated": co.surfaceElevated || co.surface,
    "--site-border": co.border,
    "--site-text": co.textPrimary,
    "--site-text-2": co.textSecondary,
    "--site-text-3": co.textFaint,
    "--site-success": co.success || "#3E7C4F",
    "--site-warning": co.warning || "#B8860B",
    "--site-danger": co.danger || "#B4442E",
    "--site-font-heading": ty.headingFont,
    "--site-font-body": ty.bodyFont,
    "--site-font-accent": ty.accentFont || ty.headingFont,
    "--site-scale-hero": ty.scale.hero,
    "--site-scale-h1": ty.scale.h1,
    "--site-scale-h2": ty.scale.h2,
    "--site-scale-h3": ty.scale.h3,
    "--site-scale-body": ty.scale.body,
    "--site-scale-small": ty.scale.small,
    "--site-weight-heading": String(ty.weights.heading),
    "--site-weight-body": String(ty.weights.body),
    "--site-weight-emphasis": String(ty.weights.emphasis),
    "--site-ls-heading": ty.letterSpacing?.heading || "normal",
    "--site-ls-eyebrow": ty.letterSpacing?.eyebrow || "0.08em",
    "--site-lh-heading": String(ty.lineHeight?.heading ?? 1.1),
    "--site-lh-body": String(ty.lineHeight?.body ?? 1.6),
    "--site-container": la.spacing.containerWidth,
    "--site-gap-y": la.spacing.sectionGapY,
    "--site-radius": la.spacing.radius,
    "--site-radius-btn": cp.button.radius,
    "--site-radius-card": cp.card.radius,
    "--site-shadow": shadowValue(la.spacing.shadow),
    "--site-shadow-card": shadowValue(cp.card.shadow),
  };
}

/** Fuentes conocidas → parámetro Google Fonts. */
const G_FONTS: Record<string, string> = {
  "'Cormorant Garamond'": "Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400",
  "'DM Serif Display'": "DM+Serif+Display",
  "'Inter'": "Inter:wght@300;400;500;600;700",
  "'DM Sans'": "DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600",
  "'Playfair Display'": "Playfair+Display:ital,wght@0,400;0,600;0,700;1,400",
  "'Lato'": "Lato:wght@300;400;700",
  "'Lora'": "Lora:ital,wght@0,400;0,600;1,400",
  "'Source Sans 3'": "Source+Sans+3:wght@300;400;600",
  "'Space Grotesk'": "Space+Grotesk:wght@300;400;600",
  "'Open Sans'": "Open+Sans:wght@300;400;600",
  "'DM Mono'": "DM+Mono:ital,wght@0,300;0,400;1,300",
  "'Merriweather'": "Merriweather:ital,wght@0,400;0,700;1,400",
};

function familyName(font: string): string {
  return font.replace(/^['"]|['"]$/g, "").split(",")[0].trim();
}

/** Construye la URL de Google Fonts para las familias usadas (o null). */
export function googleFontsUrl(c: TenantSiteConfig): string | null {
  const families = new Set<string>();
  const add = (font?: string) => {
    if (!font) return;
    const name = familyName(font);
    const g = G_FONTS[name];
    if (g) families.add(g);
  };
  add(c.typography.headingFont);
  add(c.typography.bodyFont);
  add(c.typography.accentFont);
  if (families.size === 0) return null;
  return `https://fonts.googleapis.com/css2?${Array.from(families).map((f) => `family=${f}`).join("&")}&display=swap`;
}
