// ============================================================
// Newen — Plantillas comerciales: normalización y validación.
// Reemplaza a zod (no está en el proyecto): toma cualquier objeto
// (parcial / corrupto / legacy) y produce un TenantSiteConfig
// completo aplicando fallbacks §4 del estándar.
// ============================================================

import type {
  TenantSiteConfig,
  ColorPalette,
  TypographySystem,
  BrandAssets,
  LayoutConfig,
  ComponentVariants,
  SiteTemplateId,
  SectionId,
  HeaderStyle,
  NavType,
  CtaStyle,
  HeroType,
  HeroAlignment,
  FooterStyle,
  ShadowLevel,
  PaddingScale,
  BadgeShape,
  SiteMode,
} from "./types";
import { DEFAULT_SITE_CONFIG, SECTIONS_META, TEMPLATES_META, DEFAULT_SECTIONS } from "./defaults";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const isHex = (v: unknown): v is string => typeof v === "string" && HEX_RE.test(v.trim());
const isColor = (v: unknown): v is string => typeof v === "string" && (HEX_RE.test(v.trim()) || /^rgba?\(/.test(v.trim()));

function str(v: unknown, fb: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fb;
}
function optStr(v: unknown, fb?: string): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : fb;
}
function num(v: unknown, fb: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fb;
}
function bool(v: unknown, fb: boolean): boolean {
  return typeof v === "boolean" ? v : fb;
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[], fb: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fb;
}
function obj(v: unknown): Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, any>) : {};
}

const TEMPLATES = Object.keys(TEMPLATES_META) as SiteTemplateId[];
const SECTIONS = Object.keys(SECTIONS_META) as SectionId[];

function normalizeColors(raw: unknown): ColorPalette {
  const r = obj(raw);
  const d = DEFAULT_SITE_CONFIG.colors;
  const colors: ColorPalette = {
    primary: isColor(r.primary) ? r.primary : d.primary,
    primaryForeground: isColor(r.primaryForeground) ? r.primaryForeground : d.primaryForeground,
    background: isColor(r.background) ? r.background : d.background,
    surface: isColor(r.surface) ? r.surface : d.surface,
    border: isColor(r.border) ? r.border : d.border,
    textPrimary: isColor(r.textPrimary) ? r.textPrimary : d.textPrimary,
    textSecondary: isColor(r.textSecondary) ? r.textSecondary : d.textSecondary,
    textFaint: isColor(r.textFaint) ? r.textFaint : d.textFaint,
    mode: oneOf<SiteMode>(r.mode, ["light", "dark", "auto"], d.mode),
  };
  if (isColor(r.secondary)) colors.secondary = r.secondary;
  if (isColor(r.accent)) colors.accent = r.accent;
  if (isColor(r.surfaceElevated)) colors.surfaceElevated = r.surfaceElevated;
  if (isColor(r.success)) colors.success = r.success;
  if (isColor(r.warning)) colors.warning = r.warning;
  if (isColor(r.danger)) colors.danger = r.danger;
  return colors;
}

function normalizeTypography(raw: unknown): TypographySystem {
  const r = obj(raw);
  const d = DEFAULT_SITE_CONFIG.typography;
  const scale = obj(r.scale);
  const weights = obj(r.weights);
  const ls = obj(r.letterSpacing);
  const lh = obj(r.lineHeight);
  return {
    headingFont: str(r.headingFont, d.headingFont),
    bodyFont: str(r.bodyFont, d.bodyFont),
    accentFont: optStr(r.accentFont, d.accentFont),
    scale: {
      hero: str(scale.hero, d.scale.hero),
      h1: str(scale.h1, d.scale.h1),
      h2: str(scale.h2, d.scale.h2),
      h3: str(scale.h3, d.scale.h3),
      body: str(scale.body, d.scale.body),
      small: str(scale.small, d.scale.small),
    },
    weights: {
      heading: num(weights.heading, d.weights.heading),
      body: num(weights.body, d.weights.body),
      emphasis: num(weights.emphasis, d.weights.emphasis),
    },
    letterSpacing: {
      heading: optStr(ls.heading, d.letterSpacing?.heading),
      eyebrow: optStr(ls.eyebrow, d.letterSpacing?.eyebrow),
    },
    lineHeight: {
      heading: num(lh.heading, d.lineHeight?.heading ?? 1.1),
      body: num(lh.body, d.lineHeight?.body ?? 1.6),
    },
  };
}

function normalizeBrand(raw: unknown): BrandAssets {
  const r = obj(raw);
  const logo = obj(r.logo);
  const d = DEFAULT_SITE_CONFIG.brand.logo;
  return {
    logo: {
      main: str(logo.main, d.main),
      onDark: optStr(logo.onDark, d.onDark),
      onLight: optStr(logo.onLight, d.onLight),
      icon: optStr(logo.icon, d.icon),
      hasTransparentBackground: bool(logo.hasTransparentBackground, d.hasTransparentBackground),
    },
    favicon: optStr(r.favicon),
    ogImage: optStr(r.ogImage),
  };
}

function normalizeSectionsOrder(raw: unknown, fb: SectionId[]): SectionId[] {
  if (!Array.isArray(raw)) return [...fb];
  const seen = new Set<SectionId>();
  const out: SectionId[] = [];
  for (const s of raw) {
    if (SECTIONS.includes(s as SectionId) && !seen.has(s as SectionId)) {
      seen.add(s as SectionId);
      out.push(s as SectionId);
    }
  }
  for (const s of fb) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

function normalizeLayout(raw: unknown): LayoutConfig {
  const r = obj(raw);
  const d = DEFAULT_SITE_CONFIG.layout;
  const header = obj(r.header);
  const hero = obj(r.hero);
  const sections = obj(r.sections);
  const footer = obj(r.footer);
  const spacing = obj(r.spacing);
  const cta = obj(header.ctaButton);
  return {
    template: oneOf<SiteTemplateId>(r.template, TEMPLATES, d.template),
    header: {
      style: oneOf<HeaderStyle>(header.style, ["fixed", "transparent-on-hero", "sidebar"], d.header.style),
      navType: oneOf<NavType>(header.navType, ["horizontal-simple", "horizontal-mega", "vertical"], d.header.navType),
      ctaButton:
        typeof header.ctaButton === "object" && header.ctaButton !== null
          ? {
              label: str(cta.label, d.header.ctaButton?.label ?? "Contactar"),
              style: oneOf<CtaStyle>(cta.style, ["solid", "outline", "ghost"], d.header.ctaButton?.style ?? "solid"),
            }
          : d.header.ctaButton,
    },
    hero: {
      type: oneOf<HeroType>(hero.type, ["text-only", "text-image", "text-video", "full-bleed-image"], d.hero.type),
      alignment: oneOf<HeroAlignment>(hero.alignment, ["left", "center"], d.hero.alignment),
    },
    sections: {
      order: normalizeSectionsOrder(sections.order, DEFAULT_SECTIONS),
    },
    footer: { style: oneOf<FooterStyle>(footer.style, ["minimal", "completo-con-columnas"], d.footer.style) },
    spacing: {
      containerWidth: str(spacing.containerWidth, d.spacing.containerWidth),
      sectionGapY: str(spacing.sectionGapY, d.spacing.sectionGapY),
      radius: str(spacing.radius, d.spacing.radius),
      shadow: oneOf<ShadowLevel>(spacing.shadow, ["none", "sutil", "marcada"], d.spacing.shadow),
    },
  };
}

function normalizeComponents(raw: unknown): ComponentVariants {
  const r = obj(raw);
  const d = DEFAULT_SITE_CONFIG.components;
  const button = obj(r.button);
  const card = obj(r.card);
  const badge = obj(r.badge);
  return {
    button: {
      radius: str(button.radius, d.button.radius),
      paddingScale: oneOf<PaddingScale>(button.paddingScale, ["compacto", "normal", "amplio"], d.button.paddingScale),
    },
    card: {
      radius: str(card.radius, d.card.radius),
      border: bool(card.border, d.card.border),
      shadow: oneOf<ShadowLevel>(card.shadow, ["none", "sutil", "marcada"], d.card.shadow),
    },
    badge: { shape: oneOf<BadgeShape>(badge.shape, ["pill", "square"], d.badge.shape) },
  };
}

/**
 * Toma cualquier objeto (parcial/corrupto) y devuelve un TenantSiteConfig
 * completo con todos los fallbacks aplicados. Nunca tira error.
 */
export function normalizeSiteConfig(input: unknown): TenantSiteConfig {
  const r = obj(input);
  const d = DEFAULT_SITE_CONFIG;
  return {
    id: str(r.id, d.id),
    displayName: str(r.displayName, d.displayName),
    tagline: optStr(r.tagline, d.tagline),
    domain: optStr(r.domain, d.domain),
    colors: normalizeColors(r.colors),
    typography: normalizeTypography(r.typography),
    brand: normalizeBrand(r.brand),
    layout: normalizeLayout(r.layout),
    components: normalizeComponents(r.components),
  };
}

/** Shortcut para validar solo un color (usado por el editor de paleta). */
export function isValidColor(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) || /^rgba?\(/.test(v);
}

/** Contraste simple (luminancia relativa) para la regla WCAG AA §2.1. */
export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Regla dura del estándar: texto sobre su fondo debe cumplir ~AA. */
export function ensureContrast(fg: string, bg: string, fallbackFg: string): string {
  try {
    return contrastRatio(fg, bg) >= 3 ? fg : fallbackFg;
  } catch {
    return fallbackFg;
  }
}
