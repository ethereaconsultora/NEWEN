"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PanelCounselorPage() {
  const router = useRouter();
  const supabase = createClient();
  const [metrics, setMetrics] = useState({ sesionesMes: 0, ingresosMes: 0, promedio: 0, proximas: [] as { id: string; fecha_hora: string; consultante: string }[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // Sesiones del mes
      const inicioMes = new Date();
      inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);

      const { data: sesiones } = await supabase
        .from("sesiones")
        .select("id, fecha_hora, estado, consultante:consultante_id(nombre)")
        .eq("counselor_id", user.id)
        .gte("fecha_hora", inicioMes.toISOString())
        .order("fecha_hora", { ascending: true });

      const confirmadas = sesiones?.filter(s => ["confirmada", "finalizada", "en_curso"].includes(s.estado)) ?? [];
      const proximas = sesiones?.filter(s => s.estado === "confirmada").slice(0, 5) ?? [];

      // Perfil
      const { data: perfil } = await supabase
        .from("counselors")
        .select("promedio_estrellas")
        .eq("id", user.id)
        .single();

      setMetrics({
        sesionesMes: confirmadas.length,
        ingresosMes: confirmadas.length * 18,
        promedio: perfil?.promedio_estrellas ?? 0,
        proximas: proximas.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          fecha_hora: s.fecha_hora as string,
          consultante: (s.consultante as unknown as { nombre: string } | null)?.nombre ?? "Consultante",
        })),
      });
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 24 }}>Panel</h1>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{metrics.sesionesMes}</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4 }}>Sesiones del mes</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>${metrics.ingresosMes}</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4 }}>USD del mes</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{metrics.promedio > 0 ? metrics.promedio.toFixed(1) : "—"}</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4 }}>★ Promedio</div>
        </div>
      </div>

      {/* Próximas */}
      <h2 style={{ fontSize: 13, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Próximas sesiones</h2>
      {metrics.proximas.length === 0 && <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginBottom: 24 }}>No tenés sesiones próximas.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {metrics.proximas.map((s) => (
          <Link key={s.id} href={`/panel/sesion/${s.id}`} className="card" style={{ padding: 14, textDecoration: "none", display: "block" }}>
            <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 2 }}>{new Date(s.fecha_hora).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
            <p style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 500 }}>{s.consultante}</p>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Link href="/panel/agenda" className="card" style={{ padding: 16, textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📅</div>
          <div style={{ fontSize: 12, color: "var(--nv-text-primary)", fontWeight: 500 }}>Agenda</div>
        </Link>
        <Link href="/panel/perfil" className="card" style={{ padding: 16, textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>👤</div>
          <div style={{ fontSize: 12, color: "var(--nv-text-primary)", fontWeight: 500 }}>Mi Perfil</div>
        </Link>
        <Link href="/panel/colaborativo" className="card" style={{ padding: 16, textDecoration: "none", textAlign: "center", opacity: 0.5 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🤝</div>
          <div style={{ fontSize: 12, color: "var(--nv-text-primary)", fontWeight: 500 }}>Colaborativo</div>
        </Link>
        <Link href="/panel/talleres" className="card" style={{ padding: 16, textDecoration: "none", textAlign: "center", opacity: 0.5 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📚</div>
          <div style={{ fontSize: 12, color: "var(--nv-text-primary)", fontWeight: 500 }}>Talleres</div>
        </Link>
      </div>
    </div>
  );
}
