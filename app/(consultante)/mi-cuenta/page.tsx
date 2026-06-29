"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SesionItem {
  id: string;
  fecha_hora: string;
  estado: string;
  modalidad: string;
  precio_usd: number;
  evaluacion_enviada: boolean;
  daily_room_url: string | null;
  counselorNombre: string;
}

export default function MiCuentaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sesiones, setSesiones] = useState<SesionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [reprogramandoId, setReprogramandoId] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/magic-link"); return; }

      const { data: profile } = await supabase.from("users").select("nombre").eq("id", user.id).single();
      setUserName(profile?.nombre ?? "");

      const { data } = await supabase
        .from("sesiones")
        .select("id, fecha_hora, estado, modalidad, precio_usd, evaluacion_enviada, daily_room_url, counselor:counselor_id(users(nombre))")
        .order("fecha_hora", { ascending: false });

      if (data) {
        setSesiones(data.map((s: Record<string, unknown>) => ({
          ...s,
          counselorNombre: ((s.counselor as { users: { nombre: string }[] } | null)?.users?.[0]?.nombre) ?? "Counselor",
        })) as SesionItem[]);
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const ahora = new Date();
  const proximas = sesiones.filter(s => ["confirmada", "en_curso"].includes(s.estado) && new Date(s.fecha_hora) >= ahora);
  const pasadas = sesiones.filter(s => ["finalizada", "cancelada"].includes(s.estado) || (["confirmada", "en_curso"].includes(s.estado) && new Date(s.fecha_hora) < ahora));

  const horasRestantes = (fh: string) => (new Date(fh).getTime() - Date.now()) / 36e5;

  const handleReprogramar = async (sesionId: string) => {
    if (!nuevaFecha || !nuevaHora) { setMensaje("Elegí día y horario."); return; }
    const res = await fetch(`/api/sesiones/${sesionId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reprogramar", nueva_fecha_hora: `${nuevaFecha}T${nuevaHora}:00-03:00` }),
    });
    const d = await res.json();
    if (res.ok) window.location.reload();
    else setMensaje(d.error ?? "Error.");
  };

  const handleCancelar = async (id: string) => {
    if (!confirm("¿Cancelar? El pago queda como crédito (30 días).")) return;
    await fetch(`/api/sesiones/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancelar" }) });
    window.location.reload();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); router.refresh(); };

  const inicial = (userName || "?").charAt(0).toUpperCase();
  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return { v: d.toISOString().split("T")[0], l: d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" }) }; });
  const horas = ["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)" }}>
      {/* ── HEADER ANIMA ── */}
      <header style={{ background: "var(--nv-bg-surface)", borderBottom: "1px solid var(--nv-border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--nv-accent-soft)", border: "1.5px solid var(--nv-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "var(--nv-accent)", fontFamily: "var(--nv-font-display)" }}>
          {inicial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--nv-text-primary)" }}>Hola, {userName || "Consultante"}</div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Mi Cuenta · {hoy}</div>
        </div>
        <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "var(--nv-text-muted)", cursor: "pointer", fontSize: 13, padding: 4, fontFamily: "var(--nv-font-body)" }}>↪</button>
      </header>

      <div style={{ padding: "16px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
        {/* ── PRÓXIMAS ── */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--nv-accent)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
          Próximas sesiones
        </div>

        {proximas.length === 0 && (
          <div className="card" style={{ padding: 28, textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🌿</div>
            <p style={{ fontSize: 14, color: "var(--nv-text-secondary)" }}>No tenés sesiones próximas.</p>
            <Link href="/" style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "var(--nv-accent)", fontWeight: 500, textDecoration: "none" }}>Buscar counselor →</Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {proximas.map(s => (
            <div key={s.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--nv-text-muted)", marginBottom: 2 }}>
                    {new Date(s.fecha_hora).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--nv-accent)", fontWeight: 500, marginBottom: 1 }}>
                    {new Date(s.fecha_hora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs
                  </div>
                  <div style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 600, marginBottom: 2 }}>{s.counselorNombre}</div>
                  <div style={{ fontSize: 11, color: "var(--nv-text-muted)" }}>{s.modalidad === "online" ? "💻 Online" : "🏠 Presencial"} · 50 min</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  {s.daily_room_url && <Link href={`/sesion/${s.id}`} className="btn-primary" style={{ fontSize: 11, padding: "5px 12px", textDecoration: "none" }}>Entrar</Link>}
                  {horasRestantes(s.fecha_hora) > 24 && (
                    <button onClick={() => setReprogramandoId(reprogramandoId === s.id ? null : s.id)} className="btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }}>Reprogramar</button>
                  )}
                </div>
              </div>

              {reprogramandoId === s.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--nv-border)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>{dias.map(d => <button key={d.v} onClick={() => { setNuevaFecha(d.v); setNuevaHora(""); }} className={nuevaFecha === d.v ? "btn-primary" : "btn-ghost"} style={{ fontSize: 9, padding: "3px 7px" }}>{d.l}</button>)}</div>
                  {nuevaFecha && <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>{horas.map(h => <button key={h} onClick={() => setNuevaHora(h)} className={nuevaHora === h ? "btn-primary" : "btn-ghost"} style={{ fontSize: 9, padding: "3px 7px" }}>{h}</button>)}</div>}
                  {mensaje && <p style={{ fontSize: 10, color: mensaje.startsWith("✅") ? "var(--nv-accent)" : "var(--nv-state-error)", marginBottom: 6 }}>{mensaje}</p>}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleReprogramar(s.id)} className="btn-primary" style={{ fontSize: 10, padding: "4px 10px" }} disabled={!nuevaFecha || !nuevaHora}>Confirmar</button>
                    <button onClick={() => handleCancelar(s.id)} className="btn-ghost" style={{ fontSize: 10, padding: "4px 10px", color: "var(--nv-state-error)", borderColor: "var(--nv-state-error)" }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── HISTORIAL ── */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--nv-accent)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
          Historial
        </div>

        {pasadas.length === 0 && (
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>No tenés sesiones pasadas.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pasadas.map(s => (
            <div key={s.id} className="card" style={{ padding: 14, opacity: s.estado === "cancelada" ? 0.6 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--nv-text-muted)" }}>
                    {new Date(s.fecha_hora).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })} · {new Date(s.fecha_hora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--nv-text-primary)", fontWeight: 500 }}>{s.counselorNombre}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: s.estado === "finalizada" ? "var(--nv-accent)" : "var(--nv-text-muted)", fontWeight: 500 }}>
                    {s.estado === "finalizada" ? "✓ Finalizada" : "Cancelada"}
                  </div>
                  {s.estado === "finalizada" && !s.evaluacion_enviada && (
                    <Link href={`/evaluar/${s.id}`} style={{ fontSize: 11, color: "var(--nv-accent)", fontWeight: 500, textDecoration: "none" }}>Evaluar ★</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BottomNav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--nv-bg-surface)", borderTop: "1px solid var(--nv-border)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 50 }}>
        {[{ href: "/", icon: "🔍", label: "Buscar" }, { href: "/mi-cuenta", icon: "👤", label: "Cuenta", active: true }].map(n => (
          <Link key={n.href} href={n.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, color: n.active ? "var(--nv-accent)" : "var(--nv-text-muted)", fontWeight: n.active ? 600 : 500 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
