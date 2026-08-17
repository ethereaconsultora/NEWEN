"use client";

import { useEffect } from "react";

/**
 * Carga dinámicamente la fuente de Google del tema elegido.
 * El tema "newen" ya está cargado en el layout raíz (gFont vacío).
 */
export default function FontLoader({ gFont }: { gFont: string }) {
  useEffect(() => {
    if (!gFont) return;
    let link = document.getElementById("gfont-dyn") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "gfont-dyn";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${gFont}&display=swap`;
  }, [gFont]);

  return null;
}
