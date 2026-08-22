"use client";

import { useState } from "react";

/**
 * Logo de Newen. Muestra la imagen /logo-newen.jpg sobre un chip blanco
 * redondeado (el logo es oscuro; así se ve en cualquier fondo). Si la
 * imagen no existe, cae al texto "Newen".
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
    <span
      style={{
        display: "inline-flex",
        background: "#fff",
        borderRadius: Math.max(6, height * 0.18),
        padding: `${Math.max(2, height * 0.06)}px ${Math.max(8, height * 0.2)}px`,
        overflow: "hidden",
        lineHeight: 0,
      }}
    >
      <img
        src="/logo-newen.jpg"
        alt="Newen"
        onError={() => setOk(false)}
        style={{ height, width: "auto", objectFit: "contain", display: "block" }}
      />
    </span>
  );
}
