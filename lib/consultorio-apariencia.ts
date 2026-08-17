// ============================================================
// Apariencia del consultorio (temas, tipografías y tamaños)
// Basado en los sets de Anima + el tema por defecto de Newen.
// ============================================================

export type Tema = {
  id: string;
  nombre: string;
  accent: string;
  accent2: string;
  bg: string;
  bg2: string;
  card: string;
  border: string;
  ink: string;
  ink2: string;
  ink3: string;
};

export const TEMAS: Tema[] = [
  {
    id: "newen", nombre: "Newen",
    accent: "#1B4332", accent2: "#c4a882",
    bg: "#F0EBE0", bg2: "#F5F0E8", card: "#FFFFFF", border: "#E2DACA",
    ink: "#1C1208", ink2: "rgba(28,18,8,0.60)", ink3: "rgba(28,18,8,0.38)",
  },
  {
    id: "tierra", nombre: "Tierra",
    accent: "#B8965A", accent2: "#A0876A",
    bg: "#F5F0E8", bg2: "#EDE7D9", card: "#FDFAF5", border: "#D9CFBE",
    ink: "#2C2416", ink2: "#6B5E4A", ink3: "#9C8E7A",
  },
  {
    id: "oceano", nombre: "Océano",
    accent: "#4A8BA0", accent2: "#5A9EAB",
    bg: "#EDF4F7", bg2: "#DFF0F5", card: "#F5FAFB", border: "#B8D8E6",
    ink: "#0F2430", ink2: "#265A70", ink3: "#5A8A9A",
  },
  {
    id: "bosque", nombre: "Bosque",
    accent: "#5A7A5A", accent2: "#6B9060",
    bg: "#EEF2EC", bg2: "#E2EAE0", card: "#F5F8F4", border: "#C0D4BC",
    ink: "#162414", ink2: "#3A5A38", ink3: "#6A8A68",
  },
  {
    id: "malva", nombre: "Malva",
    accent: "#7B6B9C", accent2: "#8E7EAF",
    bg: "#F1EEF7", bg2: "#E8E2F2", card: "#FAF8FC", border: "#CFC8E8",
    ink: "#1E1632", ink2: "#4A3E6A", ink3: "#8A7EA8",
  },
  {
    id: "noche", nombre: "Noche",
    accent: "#C4A96A", accent2: "#D4B87A",
    bg: "#1C1C2E", bg2: "#252540", card: "#1E1E32", border: "#383860",
    ink: "#E8E4DC", ink2: "#B8B4AC", ink3: "#888484",
  },
  {
    id: "coral", nombre: "Coral",
    accent: "#C4705A", accent2: "#D4806A",
    bg: "#FBF0EC", bg2: "#F5E4DC", card: "#FDFAF8", border: "#E8CCBC",
    ink: "#2A1410", ink2: "#6A3828", ink3: "#A07868",
  },
  {
    id: "niebla", nombre: "Niebla",
    accent: "#7890A0", accent2: "#8AA0AE",
    bg: "#F0F2F4", bg2: "#E4E8EC", card: "#F8F9FA", border: "#C8D0D8",
    ink: "#1A2028", ink2: "#445060", ink3: "#788090",
  },
  {
    id: "ambar", nombre: "Ámbar",
    accent: "#C89040", accent2: "#D8A050",
    bg: "#FBF6EC", bg2: "#F5ECDA", card: "#FDFAF4", border: "#E8D8B0",
    ink: "#261C08", ink2: "#6A5020", ink3: "#A08048",
  },
];

export type Tipografia = {
  id: string;
  nombre: string;
  preview: string;
  fh: string; // heading font
  fb: string; // body font
  gFont: string; // Google Fonts param (vacío = ya cargada)
};

export const TIPOGRAFIAS: Tipografia[] = [
  {
    id: "newen", nombre: "Newen", preview: "DM Serif Display",
    fh: "'DM Serif Display', serif", fb: "'DM Sans', sans-serif", gFont: "",
  },
  {
    id: "clasica", nombre: "Clásica", preview: "Cormorant Garamond",
    fh: "'Cormorant Garamond', serif", fb: "'DM Sans', sans-serif",
    gFont: "Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500",
  },
  {
    id: "moderna", nombre: "Moderna", preview: "Inter",
    fh: "'Inter', sans-serif", fb: "'Inter', sans-serif",
    gFont: "Inter:wght@300;400;500;600",
  },
  {
    id: "elegante", nombre: "Elegante", preview: "Playfair Display",
    fh: "'Playfair Display', serif", fb: "'Lato', sans-serif",
    gFont: "Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700",
  },
  {
    id: "minima", nombre: "Mínima", preview: "DM Mono",
    fh: "'DM Mono', monospace", fb: "'DM Sans', sans-serif",
    gFont: "DM+Mono:ital,wght@0,300;0,400;1,300&family=DM+Sans:opsz,wght@9..40,300;9..40,400",
  },
  {
    id: "manuscrita", nombre: "Manuscrita", preview: "Lora",
    fh: "'Lora', serif", fb: "'Source Sans 3', sans-serif",
    gFont: "Lora:ital,wght@0,400;0,600;1,400;1,600&family=Source+Sans+3:wght@300;400;600",
  },
  {
    id: "geometrica", nombre: "Geométrica", preview: "Space Grotesk",
    fh: "'Space Grotesk', sans-serif", fb: "'Open Sans', sans-serif",
    gFont: "Space+Grotesk:wght@300;400;600&family=Open+Sans:wght@300;400;600",
  },
  {
    id: "romantica", nombre: "Romántica", preview: "Dancing Script",
    fh: "'Dancing Script', cursive", fb: "'Nunito', sans-serif",
    gFont: "Dancing+Script:wght@400;600;700&family=Nunito:wght@300;400;500",
  },
  {
    id: "cinzel", nombre: "Clásica II", preview: "Cinzel",
    fh: "'Cinzel', serif", fb: "'Raleway', sans-serif",
    gFont: "Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500",
  },
  {
    id: "artdeco", nombre: "Art Déco", preview: "Josefin Sans",
    fh: "'Josefin Sans', sans-serif", fb: "'Nunito', sans-serif",
    gFont: "Josefin+Sans:ital,wght@0,300;0,400;0,600;1,300&family=Nunito:wght@300;400",
  },
];

export type Tamano = { id: string; nombre: string; zoom: number };

export const TAMANOS: Tamano[] = [
  { id: "pequena", nombre: "Pequeña", zoom: 0.9 },
  { id: "mediana", nombre: "Mediana", zoom: 1 },
  { id: "grande", nombre: "Grande", zoom: 1.15 },
  { id: "xgrande", nombre: "Muy gde", zoom: 1.3 },
];

function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getTema(id: string | null | undefined): Tema {
  return TEMAS.find((t) => t.id === id) ?? TEMAS[0];
}

export function getTipografia(id: string | null | undefined): Tipografia {
  return TIPOGRAFIAS.find((t) => t.id === id) ?? TIPOGRAFIAS[0];
}

export function getTamano(id: string | null | undefined): Tamano {
  return TAMANOS.find((t) => t.id === id) ?? TAMANOS[1];
}

export function temaVars(tema: Tema): React.CSSProperties {
  return {
    "--nv-accent": tema.accent,
    "--nv-accent-hover": tema.accent,
    "--nv-accent-soft": rgba(tema.accent, 0.12),
    "--nv-accent-border": rgba(tema.accent, 0.25),
    "--nv-bg-base": tema.bg,
    "--nv-bg-surface": tema.bg2,
    "--nv-bg-card": tema.card,
    "--nv-bg-input": tema.bg2,
    "--nv-text-primary": tema.ink,
    "--nv-text-secondary": tema.ink2,
    "--nv-text-muted": tema.ink3,
    "--nv-tierra": tema.accent2,
    "--nv-tierra-soft": rgba(tema.accent2, 0.12),
    "--nv-border": tema.border,
    "--nv-border-strong": tema.border,
  } as React.CSSProperties;
}

export function fontVars(font: Tipografia): React.CSSProperties {
  return {
    "--nv-font-display": font.fh,
    "--nv-font-body": font.fb,
  } as React.CSSProperties;
}
