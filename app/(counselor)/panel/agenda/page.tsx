"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORAS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

type Bloque = { dia_semana: number; hora_inicio: string; hora_fin: string; id?: string };
type Bloqueo = { id: string; fecha: string; hora_inicio: string; hora_fin: string; motivo: string };
type SesionAgenda = { id: string; fecha_hora: string; consultante: string; modalidad: string; estado: string };

export default function AgendaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [sesiones, setSesiones] = useState<SesionAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  // Bloqueos: rango de fechas
  const [bloqueoDesde, setBloqueoDesde] = useState("");
  const [bloqueoHasta, setBloqueoHasta] = useState("");
  const [bloqueoMotivo, setBloqueoMotivo] = useState("");
  const [mostrarBloqueos, setMostrarBloqueos] = useState(false);

  const [counselorId, setCounselorId] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setCounselorId(user.id);

      const { data: disp, error: errDisp } = await supabase
        .from("disponibilidad")
        .select("*")
        .eq("counselor_id", user.id)
        .order("dia_semana")
        .order("hora_inicio");
      if (disp) setBloques(disp);
      if (errDisp) console.error("Error cargando disponibilidad:", errDisp.message);

      const hoy = new Date().toISOString().split("T")[0];
      const { data: bloq } = await supabase
        .from("bloqueos")
        .select("*")
        .eq("counselor_id", user.id)
        .gte("fecha", hoy)
        .order("fecha");
      if (bloq) setBloqueos(bloq);

      const ahora = new Date().toISOString();
      const { data: sess } = await supabase
        .from("sesiones")
        .select("id, fecha_hora, modalidad, estado, consultante:consultante_id(nombre)")
        .eq("counselor_id", user.id)
        .gte("fecha_hora", ahora)
        .in("estado", ["confirmada", "en_curso"])
        .order("fecha_hora", { ascending: true })
        .limit(20);

      setSesiones((sess ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        fecha_hora: s.fecha_hora as string,
        consultante: (s.consultante as unknown as { nombre: string } | null)?.nombre ?? "Consultante",
        modalidad: s.modalidad as string,
        estado: s.estado as string,
      })));
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const toggleBloque = (dia: number, hora: string) => {
    const existe = bloques.find(b => b.dia_semana === dia && b.hora_inicio === hora);
    if (existe) {
      setBloques(bloques.filter(b => b.id !== existe.id));
    } else {
      setBloques([...bloques, { dia_semana: dia, hora_inicio: hora, hora_fin: hora }]);
    }
  };

  const estaSeleccionado = (dia: number, hora: string) =>
    bloques.some(b => b.dia_semana === dia && b.hora_inicio === hora);

  const guardar = async () => {
    setGuardando(true); setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Borrar lo viejo
    const { error: delErr } = await supabase.from("disponibilidad").delete().eq("counselor_id", user.id);
    if (delErr) { setMsg("Error al limpiar: " + delErr.message); setGuardando(false); return; }

    // Insertar los nuevos (sin duplicados por dia+hora)
    if (bloques.length > 0) {
      const unicos = bloques.filter((b, i, arr) =>
        arr.findIndex(x => x.dia_semana === b.dia_semana && x.hora_inicio === b.hora_inicio) === i
      );
      const { error: insErr } = await supabase.from("disponibilidad").insert(
        unicos.map(b => ({
          counselor_id: user.id,
          dia_semana: b.dia_semana,
          hora_inicio: b.hora_inicio,
          hora_fin: b.hora_fin,
        }))
      );
      if (insErr) { setMsg("Error al guardar: " + insErr.message); setGuardando(false); return; }
    }

    setMsg("✅ Disponibilidad guardada. Ya podés compartir el link.");
    setGuardando(false);
    setTimeout(() => setMsg(""), 4000);
  };

  // Generar array de fechas entre desde y hasta
  const getDateRange = (desde: string, hasta: string): string[] => {
    const dates: string[] = [];
    const start = new Date(desde + "T00:00:00");
    const end = new Date(hasta + "T00:00:00");
    const cur = new Date(start);
    while (cur <= end) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const agregarBloqueos = async () => {
    if (!bloqueoDesde || !bloqueoHasta) { setMsg("Seleccioná Desde y Hasta."); return; }
    if (!bloqueoMotivo.trim()) { setMsg("Poné un motivo."); return; }
    setMsg("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fechas = getDateRange(bloqueoDesde, bloqueoHasta);
    const inserts = fechas.map(fecha => ({
      counselor_id: user.id,
      fecha,
      hora_inicio: "08:00",
      hora_fin: "20:00",
      motivo: bloqueoMotivo,
    }));

    const { data, error } = await supabase
      .from("bloqueos")
      .insert(inserts)
      .select();

    if (error) { setMsg("Error al crear bloqueos: " + error.message); return; }
    if (data) { setBloqueos([...bloqueos, ...(data as Bloqueo[])]); }

    setBloqueoDesde(""); setBloqueoHasta(""); setBloqueoMotivo("");
    setMostrarBloqueos(false);
  };

  const eliminarBloqueo = async (id: string) => {
    await supabase.from("bloqueos").delete().eq("id", id);
    setBloqueos(bloqueos.filter(b => b.id !== id));
  };

  const copiarLink = () => {
    if (!counselorId) return;
    navigator.clipboard.writeText(`${window.location.origin}/agenda/${counselorId}`);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  const fechaBloqueada = (dia: number) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + dia);
    const fechaStr = inicioSemana.toISOString().split("T")[0];
    return bloqueos.some(b => b.fecha === fechaStr);
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
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>Mi Agenda</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={copiarLink}
            style={{ fontSize: 10, fontWeight: 600, color: "var(--nv-accent)", background: "rgba(27,67,50,0.08)", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}>
            {linkCopiado ? "¡Copiado!" : "Copiar link"}
          </button>
          <button onClick={() => setMostrarBloqueos(!mostrarBloqueos)}
            style={{ fontSize: 10, fontWeight: 600, color: "var(--nv-text-muted)", background: "rgba(0,0,0,0.04)", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}>
            Bloqueos
          </button>
        </div>
      </div>

      <div style={{ padding: "16px", maxWidth: 500, margin: "0 auto" }}>
        {/* Bloqueos panel */}
        {mostrarBloqueos && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--nv-text-primary)", marginBottom: 10 }}>Bloquear días (vacaciones / feriados)</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: "var(--nv-text-muted)", display: "block", marginBottom: 3 }}>Desde</label>
                <input type="date" value={bloqueoDesde} onChange={e => setBloqueoDesde(e.target.value)}
                  className="input" style={{ fontSize: 12, padding: "8px 10px" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--nv-text-muted)", display: "block", marginBottom: 3 }}>Hasta</label>
                <input type="date" value={bloqueoHasta} onChange={e => setBloqueoHasta(e.target.value)}
                  className="input" style={{ fontSize: 12, padding: "8px 10px" }} />
              </div>
            </div>

            <input type="text" placeholder="Motivo (ej: Vacaciones de invierno)" value={bloqueoMotivo} onChange={e => setBloqueoMotivo(e.target.value)}
              className="input" style={{ fontSize: 12, padding: "8px 10px", marginBottom: 10 }} />

            <button onClick={agregarBloqueos} className="btn-primary" style={{ width: "100%", fontSize: 12, padding: "10px 0" }}>
              Bloquear días
            </button>

            {/* Lista de bloqueos */}
            {bloqueos.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--nv-text-muted)", marginBottom: 6 }}>Bloqueos activos:</p>
                {bloqueos.map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: "4px 0" }}>
                    <span style={{ color: "var(--nv-text-secondary)" }}>
                      {new Date(b.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })} — {b.motivo}
                    </span>
                    <button onClick={() => eliminarBloqueo(b.id)}
                      style={{ background: "none", border: "none", color: "var(--nv-state-error)", cursor: "pointer", fontSize: 16, padding: 0 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sesiones próximas */}
        {sesiones.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 8 }}>
              Próximas sesiones
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sesiones.map(s => (
                <Link key={s.id} href={`/panel/sesion/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--nv-text-primary)", margin: 0 }}>{s.consultante}</p>
                      <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: "2px 0 0" }}>
                        {new Date(s.fecha_hora).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--nv-accent)" }}>{s.modalidad === "online" ? "💻" : "📍"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grilla semanal */}
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 10 }}>
          Disponibilidad semanal
        </h3>
        <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginBottom: 12 }}>
          Tocá los bloques para marcar tu horario disponible.
        </p>

        <div style={{ overflowX: "auto", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)", gap: 2, minWidth: 360 }}>
            <div />
            {DIAS.map((d, i) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600,
                color: fechaBloqueada(i) ? "var(--nv-state-error)" : "var(--nv-text-muted)", padding: "4px 0" }}>
                {d}
              </div>
            ))}
            {HORAS.map(hora => (
              <div key={hora} style={{ display: "contents" }}>
                <div style={{ fontSize: 10, color: "var(--nv-text-muted)", padding: "6px 4px", textAlign: "right" }}>{hora}</div>
                {DIAS.map((_, dia) => {
                  const sel = estaSeleccionado(dia, hora);
                  const bloq = fechaBloqueada(dia);
                  return (
                    <button key={`${dia}-${hora}`} onClick={() => !bloq && toggleBloque(dia, hora)} disabled={bloq}
                      style={{
                        background: bloq ? "rgba(192,57,43,0.06)" : sel ? "var(--nv-accent)" : "#FFFFFF",
                        border: `1px solid ${bloq ? "rgba(192,57,43,0.15)" : sel ? "var(--nv-accent)" : "rgba(0,0,0,0.06)"}`,
                        borderRadius: 4, padding: "6px 0", cursor: bloq ? "not-allowed" : "pointer",
                        transition: "all 0.15s", fontSize: 0,
                      }}
                      title={bloq ? "Bloqueado" : sel ? "Disponible" : "No disponible"}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje de feedback */}
        {msg && (
          <p style={{
            fontSize: 12, textAlign: "center", marginBottom: 10,
            color: msg.startsWith("✅") ? "var(--nv-accent)" : "var(--nv-state-error)",
          }}>{msg}</p>
        )}

        <button onClick={guardar} disabled={guardando} className="btn-primary" style={{ width: "100%" }}>
          {guardando ? "Guardando…" : "Guardar disponibilidad"}
        </button>

        <p style={{ fontSize: 10, color: "var(--nv-text-muted)", textAlign: "center", marginTop: 12 }}>
          Compartí tu link de agenda para que los consultantes reserven.
        </p>
      </div>
    </div>
  );
}
