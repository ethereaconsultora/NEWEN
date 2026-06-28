/**
 * Muestra estrellas (1-5) con el estilo visual de Newen.
 */
export default function Stars({ rating, size = "sm", showNumber = true }: StarsProps) {
  const starSize = size === "sm" ? 14 : 18;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        color: "var(--nv-accent)",
        fontSize: starSize,
        lineHeight: 1,
      }}
      title={`${rating.toFixed(1)} de 5 estrellas`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`}>★</span>
      ))}
      {hasHalf && <span style={{ opacity: 0.5 }}>★</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} style={{ opacity: 0.2 }}>
          ★
        </span>
      ))}
      {showNumber && (
        <span
          style={{
            fontSize: size === "sm" ? 11 : 13,
            color: "var(--nv-text-secondary)",
            marginLeft: 4,
            fontWeight: 500,
          }}
        >
          {rating > 0 ? rating.toFixed(1) : "—"}
        </span>
      )}
    </span>
  );
}
