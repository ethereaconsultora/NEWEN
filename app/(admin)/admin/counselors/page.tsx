"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CounselorsAdminPage() {
  const supabase = createClient();
  const [counselors, setCounselors] = useState<{ id: string; estado: string; users: { nombre: string; email: string }[]; promedio_estrellas: number; total_sesiones: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("counselors")
        .select("id, estado, promedio_estrellas, total_sesiones, users(nombre, email)")
        .order("estado")
        .order("promedio_estrellas", { ascending: false });

      if (data) setCounselors(data as []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from("counselors").update({ estado, activo: estado === "activo" }).eq("id", id);
    setCounselors((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)));
  };

  const activos = counselors.filter((c) => c.estado === "activo").length;

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 520, margin: "0 auto" }}>
      <Link href="/admin" style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>← Admin</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)" }}>Counselors</h1>
        <span style={{ fontSize: 13, color: activos >= 10 ? "var(--nv-state-warning)" : "var(--nv-text-muted)", fontWeight: 500 }}>{activos} / 10</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {counselors.map((c) => (
          <div key={c.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 500 }}>{c.users?.[0]?.nombre ?? "Sin nombre"}</p>
                <p style={{ fontSize: 11, color: "var(--nv-text-muted)" }}>{c.users?.[0]?.email} · ⭐ {c.promedio_estrellas?.toFixed(1) ?? "—"} · {c.total_sesiones} ses.</p>
              </div>
              <span className="badge" style={{ fontSize: 10, ...(c.estado === "activo" ? { color: "var(--nv-accent)", borderColor: "var(--nv-accent)" } : c.estado === "suspendido" ? { color: "var(--nv-state-error)", borderColor: "var(--nv-state-error)" } : { color: "var(--nv-text-muted)" }) }}>
                {c.estado}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {c.estado !== "activo" && activos < 10 && (
                <button onClick={() => cambiarEstado(c.id, "activo")} className="btn-primary" style={{ fontSize: 10, padding: "4px 10px" }}>Activar</button>
              )}
              {c.estado === "activo" && (
                <button onClick={() => cambiarEstado(c.id, "suspendido")} className="btn-ghost" style={{ fontSize: 10, padding: "4px 10px", color: "var(--nv-state-error)", borderColor: "var(--nv-state-error)" }}>Suspender</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
