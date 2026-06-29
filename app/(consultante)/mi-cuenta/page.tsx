"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SesionData {
  id: string;
  fecha_hora: string;
  estado: string;
  modalidad: string;
  precio_usd: number;
  evaluacion_enviada: boolean;
  daily_room_url: string | null;
  counselor: { nombre: string } | null;
}

export default function MiCuentaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sesiones, setSesiones] = useState<SesionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprogramandoId, setReprogramandoId] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("sesiones")
        .select(
          `
          id,
          fecha_hora,
          estado,
          modalidad,
          precio_usd,
          evaluacion_enviada,
          daily_room_url,
          counselor:counselor_id ( users ( nombre ) )
        `
        )
        .order("fecha_hora", { ascending: false });

      if (data) {
        setSesiones(
          data.map((s: Record<string, unknown>) => ({
            ...s,
            counselor: s.counselor
              ? ((s.counselor as unknown as { users: { nombre: string }[] }).users?.[0] ?? null)
              : null,
          })) as SesionData[]
        );
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const horasRestantes = (fechaHora: string) => {
    const ahora = new Date();
    const fecha = new Date(fechaHora);
    return (fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  };

  const handleReprogramar = async (sesionId: string) => {
    if (!nuevaFecha || !nuevaHora) {
      setMensaje("Seleccioná día y horario.");
      return;
    }

    const fechaHora = `${nuevaFecha}T${nuevaHora}:00-03:00`;

    const res = await fetch(`/api/sesiones/${sesionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reprogramar", nueva_fecha_hora: fechaHora }),
    });

    const data = await res.json();
    if (res.ok) {
      setMensaje("✅ Sesión reprogramada.");
      setReprogramandoId(null);
      // Recargar
      window.location.reload();
    } else {
      setMensaje(data.error ?? "Error al reprogramar.");
    }
  };

  const handleCancelar = async (sesionId: string) => {
    if (!confirm("¿Cancelar esta sesión? El pago queda como crédito (30 días).")) return;

    const res = await fetch(`/api/sesiones/${sesionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancelar" }),
    });

    if (res.ok) {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--nv-bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="spinner" />
      </div>
    );
  }

  const proximas = sesiones.filter(
    (s) => s.estado === "confirmada" || s.estado === "en_curso"
  );
  const pasadas = sesiones.filter(
    (s) => s.estado === "finalizada" || s.estado === "cancelada"
  );

  // Próximos 7 días para reprogramar
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }),
    };
  });
  const horas = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        padding: "24px 16px 80px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "var(--nv-accent)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← Home
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 12,
            color: "var(--nv-text-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--nv-font-body)",
          }}
        >
          Salir
        </button>
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 400,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-text-primary)",
          marginBottom: 24,
        }}
      >
        Mi Cuenta
      </h1>

      {/* Próximas sesiones */}
      <h2
        style={{
          fontSize: 13,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-accent)",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Próximas sesiones
      </h2>

      {proximas.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginBottom: 32 }}>
          No tenés sesiones próximas.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {proximas.map((s) => (
          <div key={s.id} className="card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 2 }}>
                  {new Date(s.fecha_hora).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p style={{ fontSize: 14, color: "var(--nv-text-primary)", fontWeight: 500 }}>
                  {s.counselor?.nombre ?? "Counselor"}
                </p>
                <p style={{ fontSize: 11, color: "var(--nv-text-muted)" }}>
                  {s.modalidad === "online" ? "💻 Online" : "🏠 Presencial"} · 50 min
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                {s.daily_room_url && (
                  <Link
                    href={`/sesion/${s.id}`}
                    className="btn-primary"
                    style={{
                      fontSize: 12,
                      padding: "6px 14px",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Entrar
                  </Link>
                )}

                {horasRestantes(s.fecha_hora) > 24 && (
                  <button
                    onClick={() =>
                      setReprogramandoId(reprogramandoId === s.id ? null : s.id)
                    }
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                  >
                    Reprogramar
                  </button>
                )}
              </div>
            </div>

            {/* Expander reprogramar */}
            {reprogramandoId === s.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--nv-border)" }}>
                <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginBottom: 8 }}>
                  Elegí nuevo día y horario:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {dias.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => { setNuevaFecha(d.value); setNuevaHora(""); }}
                      className={nuevaFecha === d.value ? "btn-primary" : "btn-ghost"}
                      style={{ fontSize: 10, padding: "4px 8px" }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {nuevaFecha && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {horas.map((h) => (
                      <button
                        key={h}
                        onClick={() => setNuevaHora(h)}
                        className={nuevaHora === h ? "btn-primary" : "btn-ghost"}
                        style={{ fontSize: 10, padding: "4px 8px" }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
                {mensaje && (
                  <p
                    style={{
                      fontSize: 11,
                      color: mensaje.startsWith("✅") ? "var(--nv-accent)" : "var(--nv-state-error)",
                      marginBottom: 8,
                    }}
                  >
                    {mensaje}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleReprogramar(s.id)}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    disabled={!nuevaFecha || !nuevaHora}
                  >
                    Confirmar cambio
                  </button>
                  <button
                    onClick={() => handleCancelar(s.id)}
                    className="btn-ghost"
                    style={{
                      fontSize: 12,
                      padding: "6px 14px",
                      color: "var(--nv-state-error)",
                      borderColor: "var(--nv-state-error)",
                    }}
                  >
                    Cancelar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Historial */}
      <h2
        style={{
          fontSize: 13,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-accent)",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Historial
      </h2>

      {pasadas.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>
          No tenés sesiones pasadas.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pasadas.map((s) => (
          <div key={s.id} className="card" style={{ padding: 14, opacity: 0.7 }}>
            <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 2 }}>
              {new Date(s.fecha_hora).toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p style={{ fontSize: 13, color: "var(--nv-text-primary)" }}>
              {s.counselor?.nombre ?? "Counselor"} ·{" "}
              {s.estado === "finalizada" ? "✅ Finalizada" : "❌ Cancelada"}
            </p>
            {s.estado === "finalizada" && !s.evaluacion_enviada && (
              <Link
                href={`/evaluar/${s.id}`}
                style={{
                  fontSize: 12,
                  color: "var(--nv-accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                  marginTop: 4,
                  display: "inline-block",
                }}
              >
                Evaluar ★
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
