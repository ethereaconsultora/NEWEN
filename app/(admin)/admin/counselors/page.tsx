"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CounselorsAdminPage() {
  const supabase = createClient();
  const [counselors, setC] = useState<{ id: string; estado: string; especialidades: string[]; provincia: string; users: { nombre: string; email: string }[]; promedio_estrellas: number; total_sesiones: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("counselors").select("id, estado, especialidades, provincia, promedio_estrellas, total_sesiones, users(nombre, email)").order("estado").then(({ data }) => { setC(data as [] ?? []); setLoading(false); });
  }, [supabase]);

  const cambiar = async (id: string, estado: string) => {
    await supabase.from("counselors").update({ estado, activo: estado === "activo" }).eq("id", id);
    setC(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
  };

  const activos = counselors.filter(c => c.estado === "activo").length;

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 520, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>Counselors</h1>
        <span style={{ fontSize: 13, fontWeight: 700, color: activos >= 10 ? "#d4870a" : "var(--nv-accent)" }}>{activos} / 10</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {counselors.map(c => {
          const nombre = c.users?.[0]?.nombre ?? "Sin nombre";
          const email = c.users?.[0]?.email ?? "";
          return (
            <div key={c.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 2px" }}>{nombre}</p>
                  <p style={{ fontSize: 10, color: "var(--nv-text-muted)", margin: 0 }}>{email} · {c.provincia || "—"} · ★ {c.promedio_estrellas?.toFixed(1) ?? "—"} · {c.total_sesiones ?? 0} ses.</p>
                  {c.especialidades?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                      {c.especialidades.slice(0, 3).map(e => <span key={e} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 999, background: "rgba(0,0,0,0.04)", color: "var(--nv-text-secondary)" }}>{e}</span>)}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase",
                  background: c.estado === "activo" ? "rgba(27,67,50,0.08)" : c.estado === "suspendido" ? "rgba(192,57,43,0.08)" : "rgba(212,135,10,0.08)",
                  color: c.estado === "activo" ? "var(--nv-accent)" : c.estado === "suspendido" ? "var(--nv-state-error)" : "#d4870a",
                }}>{c.estado}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {c.estado !== "activo" && (
                  <button onClick={() => cambiar(c.id, "activo")} disabled={activos >= 10 && c.estado !== "activo"}
                    className="btn-primary" style={{ flex: 1, fontSize: 11, padding: "8px 0", opacity: activos >= 10 ? 0.5 : 1 }}>
                    Activar
                  </button>
                )}
                {c.estado === "activo" && (
                  <button onClick={() => cambiar(c.id, "suspendido")} style={{ flex: 1, fontSize: 11, padding: "8px 0", background: "none", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, color: "var(--nv-state-error)", cursor: "pointer" }}>
                    Suspender
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
