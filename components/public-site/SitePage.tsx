// ============================================================
// Newen — Plantillas comerciales: componente raíz del sitio.
// Aplica las variables CSS del TenantSiteConfig en el wrapper y
// renderiza la plantilla elegida. Usado por la página pública
// (/e/[slug]) y por el editor con preview.
// ============================================================

import type { TenantSiteConfig } from "@/lib/public-site/types";
import { siteCssVars, googleFontsUrl } from "@/lib/public-site/css";
import { TEMPLATES } from "./templates";

export function SitePage({ org, config, preview = false }: { org: any; config: TenantSiteConfig; preview?: boolean }) {
  const vars = siteCssVars(config);
  const Template = TEMPLATES[config.layout.template] || TEMPLATES.editorial;
  const gFont = googleFontsUrl(config);

  return (
    <div
      style={{
        ...vars,
        background: "var(--site-bg)",
        color: "var(--site-text)",
        fontFamily: "var(--site-font-body)",
        fontSize: "var(--site-scale-body)",
        lineHeight: "var(--site-lh-body)",
        minHeight: "100vh",
      }}
      data-site-root
    >
      {!preview && gFont && <link rel="stylesheet" href={gFont} />}
      <Template org={org} c={config} />
    </div>
  );
}
