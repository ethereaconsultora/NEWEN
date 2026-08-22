// ============================================================
// Newen — Plantillas comerciales: construye TenantSiteConfig
// desde una fila de `organizations` (supabase).
// Si hay site_config (JSONB) lo normaliza; si no, mapea los
// campos legacy (primary/accent/font/logo) para que ningún
// espacio existente "se rompa".
// ============================================================

import type { TenantSiteConfig } from "./types";
import { DEFAULT_SITE_CONFIG } from "./defaults";
import { normalizeSiteConfig, luminance } from "./normalize";

const LEGACY_FONT_HEADING: Record<string, string> = {
  newen: "'DM Serif Display', serif",
  clasica: "'Cormorant Garamond', serif",
  moderna: "'Inter', sans-serif",
  elegante: "'Playfair Display', serif",
  minima: "'DM Mono', monospace",
  manuscrita: "'Lora', serif",
  geometrica: "'Space Grotesk', sans-serif",
};
const LEGACY_FONT_BODY: Record<string, string> = {
  newen: "'DM Sans', sans-serif",
  clasica: "'DM Sans', sans-serif",
  moderna: "'Inter', sans-serif",
  elegante: "'Lato', sans-serif",
  minima: "'DM Sans', sans-serif",
  manuscrita: "'Source Sans 3', sans-serif",
  geometrica: "'Open Sans', sans-serif",
};

function isDarkColor(hex: string): boolean {
  try {
    return luminance(hex) < 0.25;
  } catch {
    return false;
  }
}

/** Mergea los datos vivos de la org en una config ya normalizada. */
function injectOrg(cfg: TenantSiteConfig, org: any): TenantSiteConfig {
  cfg = structuredClone(cfg);
  if (!cfg.displayName) cfg.displayName = org.nombre || "";
  if (!cfg.tagline && org.tagline) cfg.tagline = org.tagline;
  if (org.logo_url && !cfg.brand.logo.main) cfg.brand.logo.main = org.logo_url;
  if (org.email) {
    // nada: el contacto se lee directo de org en las secciones
  }
  return cfg;
}

/** Mapea la apariencia legacy a un TenantSiteConfig default. */
function legacyConfig(org: any): TenantSiteConfig {
  const cfg = structuredClone(DEFAULT_SITE_CONFIG);
  cfg.id = org.slug || "espacio";
  cfg.displayName = org.nombre || "";
  cfg.tagline = org.tagline || "";
  if (org.logo_url) cfg.brand.logo.main = org.logo_url;

  // Legacy: primary_color era el fondo oscuro; accent_color el dorado.
  const bg = org.primary_color || "#0a0806";
  const accent = org.accent_color || "#c4a87e";
  if (isDarkColor(bg)) {
    cfg.colors.background = bg;
    cfg.colors.surface = bg;
    cfg.colors.surfaceElevated = bg;
    cfg.colors.primary = accent;
    cfg.colors.primaryForeground = bg;
    cfg.colors.accent = accent;
    cfg.colors.textPrimary = "#F2EDE1";
    cfg.colors.textSecondary = "#A39A86";
    cfg.colors.textFaint = "#736B58";
    cfg.colors.mode = "dark";
  } else {
    cfg.colors.background = bg;
    cfg.colors.primary = accent;
    cfg.colors.accent = accent;
  }

  const fh = LEGACY_FONT_HEADING[org.font_id || ""];
  const fb = LEGACY_FONT_BODY[org.font_id || ""];
  if (fh) cfg.typography.headingFont = fh;
  if (fb) cfg.typography.bodyFont = fb;
  return cfg;
}

/**
 * Devuelve el TenantSiteConfig de una organización:
 * site_config JSONB normalizado, o el mapeo legacy si no existe.
 * Siempre devuelve algo válido (nunca rompe).
 */
export function buildSiteConfig(org: any): TenantSiteConfig {
  if (org && typeof org.site_config === "object" && org.site_config !== null) {
    return injectOrg(normalizeSiteConfig(org.site_config), org);
  }
  return legacyConfig(org || {});
}
