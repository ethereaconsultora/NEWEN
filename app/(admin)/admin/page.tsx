"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [metrics, setMetrics] = useState({ counselors: 0, sesiones: 0, postulaciones: 0, empresas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("counselors").select("id", { count: "exact" }).eq("estado", "activo");
      const { count: s } = await supabase.from("sesiones").select("id", { count: "exact" }).eq("estado", "finalizada");
      const { count: p } = await supabase.from("postulaciones").select("id", { count: "exact" }).eq("estado", "recibida");
      const { count: e } = await supabase.from("empresas").select("id", { count: "exact" }).eq("estado", "activa");

      setMetrics({
        counselors: c?.length ?? 0,
        sesiones: s ?? 0,
        postulaciones: p ?? 0,
        empresas: e ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 6 }}>Admin</h1>
      <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginBottom: 24 }}>Clr. Ari Mangini</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{metrics.counselors}</div>
          <div style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 4 }}>Counselors activos</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{metrics.sesiones}</div>
          <div style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 4 }}>Sesiones totales</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: metrics.postulaciones > 0 ? "var(--nv-state-warning)" : "var(--nv-accent)" }}>{metrics.postulaciones}</div>
          <div style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 4 }}>Postulaciones nuevas</div>
          {metrics.postulaciones > 0 && <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--nv-state-warning)" }} />}
        </div>
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{metrics.empresas}</div>
          <div style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 4 }}>Empresas activas</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/admin/postulaciones" className="card" style={{ padding: 16, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 500 }}>📋 Postulaciones</span>
          {metrics.postulaciones > 0 && <span style={{ fontSize: 12, color: "var(--nv-state-warning)", fontWeight: 600 }}>{metrics.postulaciones} pendientes</span>}
        </Link>
        <Link href="/admin/counselors" className="card" style={{ padding: 16, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 500 }}>👥 Counselors</span>
          <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>{metrics.counselors} / 10</span>
        </Link>
        <Link href="/admin/empresas" className="card" style={{ padding: 16, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 500 }}>🏢 Empresas</span>
          <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>{metrics.empresas} activas</span>
        </Link>
      </div>
    </div>
  );
}
