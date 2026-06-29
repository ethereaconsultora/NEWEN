"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORAS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

type Bloque = { dia_semana: number; hora_inicio: string; hora_fin: string; id?: string };
type Bloqueo = { id: string; fecha: string; hora_inicio: string; hora_fin: string; motivo: string };

export default function AgendaCounselorPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Nuevo bloqueo
  const [nuevaFechaBloqueo, setNuevaFechaBloqueo] = useState("");
  const [nuevoMotivo, setNuevoMotivo] = useState("");

  // Link compartible
  const [counselorId, setCounselorId] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setCounselorId(user.id);

      // Cargar disponibilidad
      const { data: disp } = await supabase
        .from("disponibilidad")
        .select("*")
        .eq("counselor_id", user.id)
        .order("dia_semana")
        .order("hora_inicio");

      if (disp) setBloques(disp);

      // Cargar bloqueos próximos
      const hoy = new Date().toISOString().split("T")[0];
      const { data: bloq } = await supabase
        .from("bloqueos")
        .select("*")
        .eq("counselor_id", user.id)
        .gte("fecha", hoy)
        .order("fecha");

      if (bloq) setBloqueos(bloq);

      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const toggleBloque = (dia: number, hora: string) => {
    const existe = bloques.find(
      (b) => b.dia_semana === dia && b.hora_inicio === hora
    );

    if (existe) {
      setBloques(bloques.filter((b) => b.id !== existe.id));
    } else {
      // Agregar bloque de 1 hora
      setBloques([
        ...bloques,
        { dia_semana: dia, hora_inicio: hora, hora_fin: hora },
      ]);
    }
  };

  const estaSeleccionado = (dia: number, hora: string) =>
    bloques.some(
      (b) =>
        b.dia_semana === dia &&
        b.hora_inicio <= hora &&
        // Chequear si está dentro de un bloque continuo
        bloques.some(
          (b2) =>
            b2.dia_semana === dia &&
            b2.hora_inicio === b.hora_inicio &&
            b2.hora_fin >= hora
        )
    );

  const guardar = async () => {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Eliminar disponibilidad actual
    await supabase
      .from("disponibilidad")
      .delete()
      .eq("counselor_id", user.id);

    // Fusionar bloques contiguos del mismo día
    const fusionados: { dia_semana: number; hora_inicio: string; hora_fin: string }[] = [];
    const porDia = new Map<number, string[]>();

    bloques.forEach((b) => {
      const horas = porDia.get(b.dia_semana) ?? [];
      horas.push(b.hora_inicio);
      porDia.set(b.dia_semana, horas);
    });

    porDia.forEach((horas, dia) => {
      horas.sort();
      let inicio = horas[0];
      let fin = horas[0];

      for (let i = 1; i < horas.length; i++) {
        const hActual = horas[i];
        const hAnterior = horas[i - 1];
        // Calcular diferencia en horas
        const [hhA, mmA] = hAnterior.split(":").map(Number);
        const [hhC, mmC] = hActual.split(":").map(Number);
        const diff = (hhC - hhA) + (mmC - mmA) / 60;

        if (diff <= 1.5) {
          fin = hActual;
        } else {
          fusionados.push({ dia_semana: dia, hora_inicio: inicio, hora_fin: fin });
          inicio = hActual;
          fin = hActual;
        }
      }
      fusionados.push({ dia_semana: dia, hora_inicio: inicio, hora_fin: fin });
    });

    // Insertar nuevos bloques
    if (fusionados.length > 0) {
      await supabase.from("disponibilidad").insert(
        fusionados.map((b) => ({
          counselor_id: user.id,
          dia_semana: b.dia_semana,
          hora_inicio: b.hora_inicio,
          hora_fin: b.hora_fin,
        }))
      );
    }

    setGuardando(false);
    window.location.reload();
  };

  const agregarBloqueo = async () => {
    if (!nuevaFechaBloqueo) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("bloqueos").insert({
      counselor_id: user.id,
      fecha: nuevaFechaBloqueo,
      hora_inicio: "00:00",
      hora_fin: "23:59",
      motivo: nuevoMotivo || "Bloqueo manual",
    });

    setNuevaFechaBloqueo("");
    setNuevoMotivo("");
    window.location.reload();
  };

  const eliminarBloqueo = async (id: string) => {
    await supabase.from("bloqueos").delete().eq("id", id);
    setBloqueos(bloqueos.filter((b) => b.id !== id));
  };

  const copiarLink = () => {
    const link = `${window.location.origin}/agenda/${counselorId}`;
    navigator.clipboard.writeText(link);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 640, margin: "0 auto" }}>
      <Link href="/panel" style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>
        ← Panel
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 24 }}>
        Mi Agenda
      </h1>

      {/* Link compartible */}
      <div className="card" style={{ padding: 16, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 2 }}>Link público de tu agenda</p>
          <p style={{ fontSize: 13, color: "var(--nv-text-primary)", wordBreak: "break-all" }}>
            {typeof window !== "undefined" ? `${window.location.origin}/agenda/${counselorId}` : ""}
          </p>
        </div>
        <button onClick={copiarLink} className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}>
          {linkCopiado ? "✓ Copiado" : "Copiar link"}
        </button>
      </div>

      {/* Disponibilidad semanal */}
      <h2 style={{ fontSize: 15, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 12 }}>
        Disponibilidad semanal
      </h2>
      <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
        Clickeá las horas para activarlas o desactivarlas. Se guardan como bloques.
      </p>

      <div className="card" style={{ padding: 16, marginBottom: 24, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 2, minWidth: 500 }}>
          {/* Header días */}
          <div />
          {DIAS.map((d) => (
            <div key={d} style={{ fontSize: 10, color: "var(--nv-text-muted)", textAlign: "center", padding: "4px 0" }}>
              {d}
            </div>
          ))}

          {/* Grid de horas */}
          {HORAS.map((h) => (
            <div key={h} style={{ display: "contents" }}>
              <div style={{ fontSize: 10, color: "var(--nv-text-muted)", textAlign: "right", padding: "2px 6px" }}>
                {h}
              </div>
              {DIAS.map((_, idx) => {
                const sel = bloques.some(
                  (b) => b.dia_semana === idx && b.hora_inicio <= h && h < (() => {
                    const [hh, mm] = b.hora_fin.split(":").map(Number);
                    const nextH = hh + (h < b.hora_fin ? 0 : 1);
                    return `${String(nextH).padStart(2, "0")}:00`;
                  })()
                );
                // Simplificado: chequear si la hora está cubierta
                const cubierto = bloques.some(
                  (b) => b.dia_semana === idx && b.hora_inicio <= h && b.hora_fin >= h
                );
                return (
                  <button
                    key={`${idx}-${h}`}
                    onClick={() => toggleBloque(idx, h)}
                    style={{
                      height: 28,
                      background: cubierto ? "var(--nv-accent)" : "var(--nv-bg-input)",
                      border: cubierto ? "1px solid var(--nv-accent-hover)" : "1px solid var(--nv-border)",
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "all 0.1s",
                    }}
                    title={`${DIAS[idx]} ${h}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button onClick={guardar} className="btn-primary" disabled={guardando} style={{ width: "100%", marginBottom: 32 }}>
        {guardando ? "Guardando..." : "Guardar disponibilidad"}
      </button>

      {/* Bloqueos */}
      <h2 style={{ fontSize: 15, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 12 }}>
        Días bloqueados
      </h2>
      <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
        Bloqueá días completos (vacaciones, feriados, eventos externos).
      </p>

      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input type="date" value={nuevaFechaBloqueo} onChange={(e) => setNuevaFechaBloqueo(e.target.value)} className="input" style={{ width: "auto", flex: 1, padding: "8px 12px", fontSize: 12 }} />
          <input type="text" value={nuevoMotivo} onChange={(e) => setNuevoMotivo(e.target.value)} placeholder="Motivo (opcional)" className="input" style={{ width: "auto", flex: 2, padding: "8px 12px", fontSize: 12 }} />
          <button onClick={agregarBloqueo} className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }} disabled={!nuevaFechaBloqueo}>
            Bloquear
          </button>
        </div>

        {bloqueos.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>No tenés días bloqueados.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {bloqueos.map((b) => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--nv-border)" }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--nv-text-primary)" }}>
                  {new Date(b.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                {b.motivo && b.motivo !== "Bloqueo manual" && (
                  <span style={{ fontSize: 11, color: "var(--nv-text-muted)", marginLeft: 8 }}>— {b.motivo}</span>
                )}
              </div>
              <button onClick={() => eliminarBloqueo(b.id)} style={{ fontSize: 11, color: "var(--nv-state-error)", background: "transparent", border: "none", cursor: "pointer" }}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
