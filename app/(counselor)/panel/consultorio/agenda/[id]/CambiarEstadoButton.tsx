"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ESTADOS = ["confirmado", "realizado", "cancelado", "ausente"];

export default function CambiarEstadoButton({
  turnoId,
  estadoActual,
}: {
  turnoId: string;
  estadoActual: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cambiar(nuevoEstado: string) {
    setLoading(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("turnos").update({ estado: nuevoEstado }).eq("id", turnoId);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="card">
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--nv-text-muted)", fontWeight: 700, marginBottom: 10 }}>
        Cambiar estado
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ESTADOS.filter((e) => e !== estadoActual).map((e) => (
          <button
            key={e}
            onClick={() => cambiar(e)}
            disabled={loading}
            className="btn-ghost"
            style={{ textTransform: "capitalize", padding: "8px 14px", fontSize: 12.5 }}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
