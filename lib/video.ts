/**
 * Genera la URL de la sala de videollamada (Jitsi) de un turno 1-1.
 * - jitsiBase: base configurable por espacio (columna users.jitsi_base).
 * - userId: id del profesional (owner del espacio).
 * - id: id del turno (cada turno tiene su propia sala, única por paciente).
 */
export function roomUrl(jitsiBase: string | null | undefined, userId: string, id: string) {
  const base = (jitsiBase || "https://meet.jit.si").trim().replace(/\/+$/, "");
  return `${base}/newen-${(userId || "x").replace(/-/g, "").slice(0, 8)}-${id}`;
}
