"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PostulacionesPage() {
  const supabase = createClient();
  const [postulaciones, setPostulaciones] = useState<{ id: string; nombre: string; apellido: string; email: string; provincia: string; especialidades: string[]; estado: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("postulaciones")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setPostulaciones(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from("postulaciones").update({ estado }).eq("id", id);
    setPostulaciones((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 520, margin: "0 auto" }}>
      <Link href="/admin" style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>← Admin</Link>

      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 24 }}>Postulaciones</h1>

      {postulaciones.length === 0 && <p style={{ fontSize: 13, color: "var(--nv-text-muted)", textAlign: "center", padding: "40px 0" }}>No hay postulaciones aún.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {postulaciones.map((p) => (
          <div key={p.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 15, color: "var(--nv-text-primary)", fontWeight: 500 }}>{p.nombre} {p.apellido}</p>
                <p style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>{p.email}{p.provincia ? ` · ${p.provincia}` : ""}</p>
              </div>
              <span className="badge" style={{ fontSize: 10, ...(p.estado === "aprobada" ? { color: "var(--nv-accent)", borderColor: "var(--nv-accent)" } : p.estado === "rechazada" ? { color: "var(--nv-state-error)", borderColor: "var(--nv-state-error)" } : {}) }}>
                {p.estado === "recibida" ? "Nueva" : p.estado === "entrevista_pendiente" ? "Entrevista" : p.estado === "aprobada" ? "Aprobada" : "Rechazada"}
              </span>
            </div>

            {p.especialidades?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {p.especialidades.slice(0, 5).map((e) => (
                  <span key={e} style={{ fontSize: 10, padding: "2px 8px", borderRadius: "var(--nv-radius-full)", border: "0.5px solid var(--nv-border)", color: "var(--nv-text-muted)" }}>{e}</span>
                ))}
              </div>
            )}

            <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginBottom: 10 }}>
              {new Date(p.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
            </p>

            {p.estado === "recibida" && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => cambiarEstado(p.id, "entrevista_pendiente")} className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }}>
                  Agendar entrevista
                </button>
                <button onClick={() => cambiarEstado(p.id, "rechazada")} className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px", color: "var(--nv-state-error)", borderColor: "var(--nv-state-error)" }}>
                  Rechazar
                </button>
              </div>
            )}

            {p.estado === "entrevista_pendiente" && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => cambiarEstado(p.id, "aprobada")} className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }}>
                  Aprobar
                </button>
                <button onClick={() => cambiarEstado(p.id, "rechazada")} className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px", color: "var(--nv-state-error)", borderColor: "var(--nv-state-error)" }}>
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
