"use client";

import { useDolar, convertirUsdToArs } from "@/hooks/useDolar";

interface DolarBadgeProps {
  usd: number;
  size?: "sm" | "md";
}

/**
 * Badge que muestra el precio en USD y su equivalente aproximado en ARS.
 * Ejemplo: "$18 USD · ≈ $27.270 ARS"
 */
export default function DolarBadge({ usd, size = "md" }: DolarBadgeProps) {
  const { venta, loading, error } = useDolar();

  const ars = error
    ? "—"
    : loading
    ? "calculando..."
    : convertirUsdToArs(usd, venta);

  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? 4 : 6,
        fontSize: isSmall ? 12 : 14,
        fontWeight: 600,
        color: "var(--nv-text-primary)",
        fontFamily: "var(--nv-font-body)",
      }}
    >
      <span style={{ color: "var(--nv-accent)" }}>${usd} USD</span>
      <span
        style={{
          color: "var(--nv-text-muted)",
          fontSize: isSmall ? 10 : 12,
          fontWeight: 400,
        }}
      >
        ·
      </span>
      <span
        style={{
          color: loading ? "var(--nv-text-muted)" : "var(--nv-text-secondary)",
          fontStyle: loading ? "italic" : "normal",
        }}
      >
        ≈ {ars}
      </span>
    </span>
  );
}
