import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const JITSI_BASE = process.env.NEXT_PUBLIC_JITSI_BASE || "https://meet.jit.si";

/**
 * Página pública de un espacio de video (Jitsi). Cada espacio del campus
 * (taller, curso, workshop, masterclass) se accede de forma independiente
 * con este link: /sala/<room>. No requiere login: se comparte a quienes
 * compran/rentan el espacio. El primero en ingresar es el anfitrión.
 */
export default async function SalaEspacioPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const clean = room.replace(/[^a-z0-9-_]/gi, "").slice(0, 64);
  if (!clean) notFound();

  const url = `${JITSI_BASE}/${clean}`;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0806", color: "#f0eae1", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div
        style={{
          borderBottom: "1px solid rgba(196,168,126,0.25)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 12, color: "#9e9382" }}>
          🎥 Espacio de video · <strong style={{ color: "#c4a87e" }}>{clean}</strong>
        </div>
        <div style={{ fontSize: 11, color: "#6e6454" }}>Gestionado en newen · El primero en ingresar es el anfitrión</div>
      </div>

      <iframe
        src={url}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        style={{ flex: 1, width: "100%", border: "none", minHeight: "70vh" }}
        allowFullScreen
      />
    </div>
  );
}
