// ============================================================
// Newen — Sistema de plantillas comerciales (página pública)
// PLANTILLA_COMERCIAL_EMPRESA_STANDARD.md — tipos del dominio.
// Los componentes NUNCA hardcodean color/fuente/radio/sombra:
// todo sale de TenantSiteConfig vía variables CSS.
// ============================================================

export type SiteTemplateId =
  | "editorial"
  | "vitrina"
  | "panel-comercial"
  | "minimal"
  | "modular";

export type SiteMode = "light" | "dark" | "auto";

export interface ColorPalette {
  // Colores de marca
  primary: string;
  primaryForeground: string;
  secondary?: string;
  accent?: string;
  // Fondo y superficies
  background: string;
  surface: string;
  surfaceElevated?: string;
  border: string;
  // Texto
  textPrimary: string;
  textSecondary: string;
  textFaint: string;
  // Estados semánticos (fallback al default de Newen)
  success?: string;
  warning?: string;
  danger?: string;
  // Modo
  mode: SiteMode;
}

export interface TypographyScale {
  hero: string;
  h1: string;
  h2: string;
  h3: string;
  body: string;
  small: string;
}

export interface TypographyWeights {
  heading: number;
  body: number;
  emphasis: number;
}

export interface TypographySystem {
  headingFont: string;
  bodyFont: string;
  accentFont?: string;
  scale: TypographyScale;
  weights: TypographyWeights;
  letterSpacing?: { heading?: string; eyebrow?: string };
  lineHeight?: { heading: number; body: number };
}

export interface BrandLogoAssets {
  main: string;
  onDark?: string;
  onLight?: string;
  icon?: string;
  hasTransparentBackground: boolean;
}

export interface BrandAssets {
  logo: BrandLogoAssets;
  favicon?: string;
  ogImage?: string;
}

export type HeaderStyle = "fixed" | "transparent-on-hero" | "sidebar";
export type NavType = "horizontal-simple" | "horizontal-mega" | "vertical";
export type CtaStyle = "solid" | "outline" | "ghost";
export type HeroType = "text-only" | "text-image" | "text-video" | "full-bleed-image";
export type HeroAlignment = "left" | "center";
export type FooterStyle = "minimal" | "completo-con-columnas";
export type ShadowLevel = "none" | "sutil" | "marcada";
export type PaddingScale = "compacto" | "normal" | "amplio";
export type BadgeShape = "pill" | "square";

export interface LayoutConfig {
  template: SiteTemplateId;
  header: {
    style: HeaderStyle;
    navType: NavType;
    ctaButton?: { label: string; style: CtaStyle };
  };
  hero: { type: HeroType; alignment: HeroAlignment };
  sections: { order: string[] };
  footer: { style: FooterStyle };
  spacing: {
    containerWidth: string;
    sectionGapY: string;
    radius: string;
    shadow: ShadowLevel;
  };
}

export interface ComponentVariants {
  button: { radius: string; paddingScale: PaddingScale };
  card: { radius: string; border: boolean; shadow: ShadowLevel };
  badge: { shape: BadgeShape };
}

export interface TenantSiteConfig {
  id: string;
  displayName: string;
  tagline?: string;
  domain?: string;
  colors: ColorPalette;
  typography: TypographySystem;
  brand: BrandAssets;
  layout: LayoutConfig;
  components: ComponentVariants;
}

/** Secciones de contenido que puede ordenar cada empresa. */
export type SectionId =
  | "servicios"
  | "metodologia"
  | "equipo"
  | "testimonios"
  | "contacto"
  | "turnos"
  | "catalogo"
  | "proximos";

export interface SectionMeta {
  id: SectionId;
  label: string;
  desc: string;
  icon: string;
}
