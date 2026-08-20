"use client";

import { useState } from "react";

/**
 * Logo de Newen. Muestra la imagen /logo-newen.jpg; si no existe todavía,
 * cae al texto "Newen" para no romper la UI.
 */
export default function LogoNewen({ height = 44 }: { height?: number }) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    return (
      <span
        style={{
          fontSize: height,
          lineHeight: 1,
          fontWeight: 400,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-text-primary)",
          letterSpacing: -1,
        }}
      >
        Newen
      </span>
    );
  }

  return (
    <img
      src="/logo-newen.jpg"
      alt="Newen"
      onError={() => setOk(false)}
      style={{ height, width: "auto", objectFit: "contain" }}
    />
  );
}
