"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SesionMuro {
  id: string;
  consultante_nombre: string;
  fecha_hora: string;
  modalidad: string;
  estado: string;
  motivo_derivacion?: string;
}

export default function MuroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [sesiones, setSesiones] = useState<SesionMuro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // Sesiones confirmadas del counselor
      const { data } = await supabase
        .from("sesiones")
        .select("id, fecha_hora, modalidad, estado, consultante:consultante_id(nombre)")
        .eq("counselor_id", user.id)
        .in("estado", ["confirmada", "en_curso"])
        .order("fecha_hora", { ascending: true })
        .limit(30);

      const items: SesionMuro[] = (data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        consultante_nombre: (s.consultante as unknown as { nombre: string } | null)?.nombre ?? "Consultante",
        fecha_hora: s.fecha_hora as string,
        modalidad: s.modalidad as string,
        estado: s.estado as string,
      }));

      setSesiones(items);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const derivarA = (sesionId: string) => {
    alert(`Derivar sesión ${sesionId} — funcionalidad en desarrollo`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      {/* HEADER */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#6aa87c", textTransform: "uppercase", margin: 0 }}>
          Muro
        </h1>
        <span style={{ fontSize: 11, color: "var(--nv-text-muted)" }}>
          {sesiones.length} activos
        </span>
      </div>

      <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>
        {sesiones.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>No tenés consultantes activos en este momento.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sesiones.map(s => (
              <div key={s.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", margin: 0 }}>
                      {s.consultante_nombre}
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: "2px 0 0" }}>
                      {new Date(s.fecha_hora).toLocaleDateString("es-AR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="badge" style={{
                    background: s.estado === "en_curso" ? "rgba(106,168,124,0.12)" : "rgba(0,0,0,0.04)",
                    color: s.estado === "en_curso" ? "#6aa87c" : "var(--nv-text-secondary)",
                    border: "none",
                  }}>
                    {s.estado === "confirmada" ? "Próxima" : "En curso"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--nv-text-muted)" }}>
                    {s.modalidad === "online" ? "💻 Online" : "📍 Presencial"}
                  </span>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => derivarA(s.id)}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: 11, padding: "8px 0" }}
                  >
                    Derivar
                  </button>
                  <button
                    onClick={() => router.push(`/panel/sesion/${s.id}`)}
                    className="btn-primary"
                    style={{ flex: 1, fontSize: 11, padding: "8px 0" }}
                  >
                    {s.estado === "en_curso" ? "Unirme" : "Ver sesión"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
