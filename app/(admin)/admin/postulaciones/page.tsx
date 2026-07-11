"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PostulacionesAdminPage() {
  const supabase = createClient();
  const [post, setPost] = useState<{ id: string; nombre: string; apellido: string; email: string; wsp: string; provincia: string; especialidades: string[]; enfoque: string; estado: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("postulaciones").select("*").order("created_at", { ascending: false }).then(({ data }) => { setPost(data ?? []); setLoading(false); });
  }, [supabase]);

  const cambiar = async (id: string, estado: string) => {
    await supabase.from("postulaciones").update({ estado }).eq("id", id);
    setPost(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 520, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
      <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Postulaciones</h1>

      {post.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>No hay postulaciones todavía.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {post.map(p => (
            <div key={p.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 2px" }}>{p.nombre} {p.apellido}</h3>
                  <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: 0 }}>{p.email}{p.wsp ? ` · 📱 ${p.wsp}` : ""}{p.provincia ? ` · 📍 ${p.provincia}` : ""}</p>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase",
                  background: p.estado === "aprobada" ? "rgba(27,67,50,0.08)" : p.estado === "rechazada" ? "rgba(192,57,43,0.08)" : "rgba(212,135,10,0.08)",
                  color: p.estado === "aprobada" ? "var(--nv-accent)" : p.estado === "rechazada" ? "var(--nv-state-error)" : "#d4870a",
                }}>{p.estado}</span>
              </div>
              {p.enfoque && <p style={{ fontSize: 11, color: "var(--nv-text-secondary)", margin: "0 0 6px" }}>{p.enfoque}</p>}
              {p.especialidades?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {p.especialidades.map(e => <span key={e} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 999, background: "rgba(0,0,0,0.04)", color: "var(--nv-text-secondary)", textTransform: "uppercase" }}>{e}</span>)}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {p.estado === "recibida" && (
                  <>
                    <button onClick={() => cambiar(p.id, "entrevista_pendiente")} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "8px 0" }}>Entrevistar</button>
                    <button onClick={() => cambiar(p.id, "rechazada")} style={{ flex: 1, fontSize: 11, padding: "8px 0", background: "none", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, color: "var(--nv-state-error)", cursor: "pointer" }}>Rechazar</button>
                  </>
                )}
                {p.estado === "entrevista_pendiente" && (
                  <button onClick={() => cambiar(p.id, "aprobada")} className="btn-primary" style={{ flex: 1, fontSize: 11, padding: "8px 0" }}>Aprobar</button>
                )}
                {p.estado === "aprobada" && (
                  <span style={{ fontSize: 10, color: "var(--nv-accent)", padding: "6px 0" }}>✅ Aprobada</span>
                )}
                {p.estado === "rechazada" && (
                  <span style={{ fontSize: 10, color: "var(--nv-state-error)", padding: "6px 0" }}>❌ Rechazada</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
