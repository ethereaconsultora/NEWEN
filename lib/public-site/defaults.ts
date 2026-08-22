// ============================================================
// Newen — Plantillas comerciales: defaults, presets y metadatos.
// §4 del estándar: si un campo no está definido, se hereda del
// default de Newen (paleta cálida-humanista, Cormorant Garamond +
// Inter, plantilla editorial). Ninguna empresa queda "rota".
// ============================================================

import type {
  TenantSiteConfig,
  SectionId,
  SectionMeta,
  SiteTemplateId,
  ColorPalette,
} from "./types";

export const DEFAULT_SECTIONS: SectionId[] = [
  "servicios",
  "metodologia",
  "equipo",
  "contacto",
];

export const SECTIONS_META: Record<SectionId, SectionMeta> = {
  servicios: { id: "servicios", label: "Servicios", desc: "Qué ofrece la organización", icon: "S" },
  metodologia: { id: "metodologia", label: "Metodología", desc: "Cómo trabaja", icon: "M" },
  equipo: { id: "equipo", label: "Equipo", desc: "Quiénes la integran", icon: "E" },
  testimonios: { id: "testimonios", label: "Testimonios", desc: "Qué dicen sus clientes", icon: "T" },
  contacto: { id: "contacto", label: "Contacto", desc: "Dónde escribir", icon: "C" },
  turnos: { id: "turnos", label: "Turnos", desc: "Agenda en vivo", icon: "A" },
  catalogo: { id: "catalogo", label: "Catálogo", desc: "Productos y servicios", icon: "L" },
  proximos: { id: "proximos", label: "Próximos", desc: "Actividades que vienen", icon: "P" },
};

export const TEMPLATES_META: Record<SiteTemplateId, { label: string; desc: string }> = {
  editorial: {
    label: "Editorial",
    desc: "Header simple + hero con texto y poca imagen + secciones apiladas con líneas divisorias. Para consultoras, estudios y servicios profesionales.",
  },
  vitrina: {
    label: "Vitrina",
    desc: "Header con menú horizontal + hero con imagen grande + grilla de tarjetas. Para ofertas de productos/servicios múltiples y visuales.",
  },
  "panel-comercial": {
    label: "Panel comercial",
    desc: "Sidebar fija + contenido tipo dashboard (métricas, agenda, catálogo) visible públicamente. Para mostrar disponibilidad en tiempo real.",
  },
  minimal: {
    label: "Minimal / Portfolio",
    desc: "Header transparente sobre hero a pantalla completa + mucho whitespace. Para marcas personales dentro de una empresa.",
  },
  modular: {
    label: "Modular en bloques",
    desc: "Grilla de bloques configurables de distinto tamaño, reordenables. Para varias líneas de negocio o audiencias.",
  },
};

export const DEFAULT_SITE_CONFIG: TenantSiteConfig = {
  id: "newen-default",
  displayName: "",
  tagline: "",
  colors: {
    primary: "#1B4332",
    primaryForeground: "#FFFFFF",
    secondary: "#C4A882",
    accent: "#C4A882",
    background: "#F0EBE0",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#E2DACA",
    textPrimary: "#1C1208",
    textSecondary: "rgba(28,18,8,0.62)",
    textFaint: "rgba(28,18,8,0.40)",
    success: "#3E7C4F",
    warning: "#B8860B",
    danger: "#B4442E",
    mode: "light",
  },
  typography: {
    headingFont: "'Cormorant Garamond', serif",
    bodyFont: "'Inter', sans-serif",
    accentFont: "'Cormorant Garamond', serif",
    scale: { hero: "56px", h1: "38px", h2: "28px", h3: "20px", body: "15px", small: "12.5px" },
    weights: { heading: 600, body: 400, emphasis: 700 },
    letterSpacing: { heading: "-0.01em", eyebrow: "0.08em" },
    lineHeight: { heading: 1.1, body: 1.6 },
  },
  brand: {
    logo: { main: "", hasTransparentBackground: true },
  },
  layout: {
    template: "editorial",
    header: { style: "fixed", navType: "horizontal-simple", ctaButton: { label: "Contactar", style: "solid" } },
    hero: { type: "text-only", alignment: "left" },
    sections: { order: [...DEFAULT_SECTIONS] },
    footer: { style: "minimal" },
    spacing: { containerWidth: "1080px", sectionGapY: "96px", radius: "10px", shadow: "sutil" },
  },
  components: {
    button: { radius: "8px", paddingScale: "normal" },
    card: { radius: "12px", border: true, shadow: "sutil" },
    badge: { shape: "pill" },
  },
};

/** Ejemplo de referencia §5 del estándar: Espacio Crítico (plantilla Editorial, dark). */
export const ESPACIO_CRITICO_SITE_CONFIG: TenantSiteConfig = {
  id: "espacio-critico",
  displayName: "Espacio Crítico",
  tagline: "Centrados en las personas. Enfocados en los resultados.",
  domain: "espaciocritico.com.ar",
  colors: {
    primary: "#E8622C",
    primaryForeground: "#FFFFFF",
    background: "#15140F",
    surface: "#1C1A14",
    surfaceElevated: "#24211A",
    border: "#322E22",
    textPrimary: "#F2EDE1",
    textSecondary: "#A39A86",
    textFaint: "#736B58",
    success: "#5FAE74",
    warning: "#C9A227",
    danger: "#C25E4E",
    mode: "dark",
  },
  typography: {
    headingFont: "'Cormorant Garamond', serif",
    bodyFont: "'Inter', sans-serif",
    accentFont: "'Cormorant Garamond', serif",
    scale: { hero: "56px", h1: "38px", h2: "28px", h3: "20px", body: "15px", small: "12.5px" },
    weights: { heading: 600, body: 400, emphasis: 700 },
    letterSpacing: { heading: "-0.01em", eyebrow: "0.08em" },
    lineHeight: { heading: 1.1, body: 1.6 },
  },
  brand: { logo: { main: "", hasTransparentBackground: true } },
  layout: {
    template: "editorial",
    header: { style: "fixed", navType: "horizontal-simple", ctaButton: { label: "Agendar diagnóstico", style: "solid" } },
    hero: { type: "text-only", alignment: "left" },
    sections: { order: ["servicios", "metodologia", "equipo", "contacto"] },
    footer: { style: "minimal" },
    spacing: { containerWidth: "1080px", sectionGapY: "96px", radius: "10px", shadow: "sutil" },
  },
  components: {
    button: { radius: "8px", paddingScale: "normal" },
    card: { radius: "12px", border: true, shadow: "sutil" },
    badge: { shape: "pill" },
  },
};

/** Paletas prearmadas para elegir en un clic. Cada una es un ColorPalette completo. */
export const PALETTE_PRESETS: { id: string; nombre: string; mode: "light" | "dark"; colors: ColorPalette }[] = [
  {
    id: "newen",
    nombre: "Newen",
    mode: "light",
    colors: {
      primary: "#1B4332", primaryForeground: "#FFFFFF", secondary: "#C4A882", accent: "#C4A882",
      background: "#F0EBE0", surface: "#FFFFFF", surfaceElevated: "#FFFFFF", border: "#E2DACA",
      textPrimary: "#1C1208", textSecondary: "rgba(28,18,8,0.62)", textFaint: "rgba(28,18,8,0.40)",
      success: "#3E7C4F", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "espacio-critico",
    nombre: "Espacio Crítico",
    mode: "dark",
    colors: {
      primary: "#E8622C", primaryForeground: "#FFFFFF",
      background: "#15140F", surface: "#1C1A14", surfaceElevated: "#24211A", border: "#322E22",
      textPrimary: "#F2EDE1", textSecondary: "#A39A86", textFaint: "#736B58",
      success: "#5FAE74", warning: "#C9A227", danger: "#C25E4E", mode: "dark",
    },
  },
  {
    id: "tierra",
    nombre: "Tierra",
    mode: "light",
    colors: {
      primary: "#B8965A", primaryForeground: "#241D12", secondary: "#A0876A", accent: "#B8965A",
      background: "#F5F0E8", surface: "#FDFAF5", surfaceElevated: "#FFFFFF", border: "#D9CFBE",
      textPrimary: "#2C2416", textSecondary: "#6B5E4A", textFaint: "#9C8E7A",
      success: "#6B8F5A", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "oceano",
    nombre: "Océano",
    mode: "light",
    colors: {
      primary: "#2F6F8E", primaryForeground: "#FFFFFF", secondary: "#4A8BA0", accent: "#4A8BA0",
      background: "#EDF4F7", surface: "#F5FAFB", surfaceElevated: "#FFFFFF", border: "#B8D8E6",
      textPrimary: "#0F2430", textSecondary: "#265A70", textFaint: "#5A8A9A",
      success: "#3E7C6E", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "bosque",
    nombre: "Bosque",
    mode: "light",
    colors: {
      primary: "#3E6B4A", primaryForeground: "#FFFFFF", secondary: "#6B9060", accent: "#6B9060",
      background: "#EEF2EC", surface: "#F5F8F4", surfaceElevated: "#FFFFFF", border: "#C0D4BC",
      textPrimary: "#162414", textSecondary: "#3A5A38", textFaint: "#6A8A68",
      success: "#3E7C4F", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "malva",
    nombre: "Malva",
    mode: "light",
    colors: {
      primary: "#5E4A8A", primaryForeground: "#FFFFFF", secondary: "#7B6B9C", accent: "#7B6B9C",
      background: "#F1EEF7", surface: "#FAF8FC", surfaceElevated: "#FFFFFF", border: "#CFC8E8",
      textPrimary: "#1E1632", textSecondary: "#4A3E6A", textFaint: "#8A7EA8",
      success: "#4E7A6A", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "noche",
    nombre: "Noche",
    mode: "dark",
    colors: {
      primary: "#C4A96A", primaryForeground: "#1C1C2E", secondary: "#C4A96A", accent: "#C4A96A",
      background: "#15151F", surface: "#1E1E32", surfaceElevated: "#262640", border: "#383860",
      textPrimary: "#E8E4DC", textSecondary: "#B8B4AC", textFaint: "#888484",
      success: "#5FAE74", warning: "#C9A227", danger: "#C25E4E", mode: "dark",
    },
  },
  {
    id: "coral",
    nombre: "Coral",
    mode: "light",
    colors: {
      primary: "#B45A44", primaryForeground: "#FFFFFF", secondary: "#C4705A", accent: "#C4705A",
      background: "#FBF0EC", surface: "#FDFAF8", surfaceElevated: "#FFFFFF", border: "#E8CCBC",
      textPrimary: "#2A1410", textSecondary: "#6A3828", textFaint: "#A07868",
      success: "#4E7A5E", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "niebla",
    nombre: "Niebla",
    mode: "light",
    colors: {
      primary: "#45667A", primaryForeground: "#FFFFFF", secondary: "#7890A0", accent: "#7890A0",
      background: "#F0F2F4", surface: "#F8F9FA", surfaceElevated: "#FFFFFF", border: "#C8D0D8",
      textPrimary: "#1A2028", textSecondary: "#445060", textFaint: "#788090",
      success: "#3E7C6E", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
  {
    id: "ambar",
    nombre: "Ámbar",
    mode: "light",
    colors: {
      primary: "#A9712A", primaryForeground: "#FFFFFF", secondary: "#C89040", accent: "#C89040",
      background: "#FBF6EC", surface: "#FDFAF4", surfaceElevated: "#FFFFFF", border: "#E8D8B0",
      textPrimary: "#261C08", textSecondary: "#6A5020", textFaint: "#A08048",
      success: "#5E7A3E", warning: "#B8860B", danger: "#B4442E", mode: "light",
    },
  },
];

export const getPreset = (id: string) => PALETTE_PRESETS.find((p) => p.id === id) || PALETTE_PRESETS[0];
