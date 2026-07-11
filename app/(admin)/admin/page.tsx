"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [m, setM] = useState({ counselors: 0, sesiones: 0, postulaciones: 0, talleres: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("counselors").select("id", { count: "exact" }).eq("estado", "activo");
      const { count: s } = await supabase.from("sesiones").select("id", { count: "exact" }).eq("estado", "finalizada");
      const { count: p } = await supabase.from("postulaciones").select("id", { count: "exact" }).eq("estado", "recibida");
      const { count: t } = await supabase.from("talleres").select("id", { count: "exact" }).eq("estado", "publicado");
      setM({ counselors: c?.length ?? 0, sesiones: s ?? 0, postulaciones: p ?? 0, talleres: t ?? 0 });
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
      <h1 style={{ fontSize: 24, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 4 }}>Panel Admin</h1>
      <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginBottom: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>Clr. Ari Mangini</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <Link href="/admin/counselors" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{m.counselors}</div>
            <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Counselors</div>
          </div>
        </Link>
        <Link href="/admin/postulaciones" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: 20, textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: m.postulaciones > 0 ? "#d4870a" : "var(--nv-accent)" }}>{m.postulaciones}</div>
            <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Postulaciones</div>
            {m.postulaciones > 0 && <div style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: "#d4870a" }} />}
          </div>
        </Link>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{m.sesiones}</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sesiones</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{m.talleres}</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Talleres</div>
        </div>
      </div>
    </div>
  );
}
