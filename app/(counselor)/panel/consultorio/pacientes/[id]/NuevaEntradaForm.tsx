"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../../pages.module.css";

const MOODS = ["Estable", "Vulnerable", "En proceso", "En crisis"];
const MOOD_KEY = (m: string) => m.replace(/\s/g, "");
const TIPOS_SESION = ["Primera vez", "Seguimiento", "Cierre"];

const TOPICS = [
  "Trauma / Herida temprana",
  "Vínculo / Apego",
  "Proceso somático",
  "Felt sense · Focusing",
  "Sueños / Imágenes",
  "Duelo / Pérdida",
  "Identidad / Self",
  "Límites",
  "Relaciones",
  "Crisis",
  "Recursos internos",
  "Sombra",
  "Autocompasión",
  "Cuerpo / Sensación",
  "Infancia",
  "Sexualidad",
  "Espiritualidad",
  "Trabajo / Propósito",
];

export default function NuevaEntradaForm({
  pacienteId,
  estadoActual,
  onSaved,
}: {
  pacienteId: string;
  estadoActual: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState(
    estadoActual === "Enproceso" ? "En proceso" : estadoActual === "Encrisis" ? "En crisis" : estadoActual || "Estable"
  );
  const [tipoSesion, setTipoSesion] = useState("Seguimiento");
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("");
  const [tareas, setTareas] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleTopic(t: string) {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo && !notas && !estado && topics.length === 0) {
      setError("Completá al menos un campo antes de guardar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const sb = createClient();
      const moodDb = MOOD_KEY(mood);
      const { error: err } = await sb.from("entradas").insert({
        paciente_id: pacienteId,
        fecha,
        estado_animo: moodDb,
        tipo_sesion: tipoSesion,
        motivo_consulta: motivo || null,
        estado_actual: estado || null,
        tareas: tareas || null,
        topics,
        texto: notas || "",
      });
      if (err) throw err;
      await sb.from("pacientes").update({ estado_animo: moodDb }).eq("id", pacienteId);
      setMotivo("");
      setEstado("");
      setTareas("");
      setTopics([]);
      setNotas("");
      setTipoSesion("Seguimiento");
      router.refresh();
      onSaved?.();
    } catch {
      setError("Error al guardar. Intentá de nuevo.");
    }
    setLoading(false);
  }

  const fieldStyle = { marginBottom: 14 } as const;

  return (
    <form onSubmit={handleSubmit} className="card">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label className="label">Fecha de sesión</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Estado emocional</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                style={{
                  cursor: "pointer",
                  border: mood === m ? "2px solid var(--nv-accent)" : "2px solid transparent",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontFamily: "var(--nv-font-body)",
                  fontSize: 12,
                  background: mood === m ? "var(--nv-accent-soft)" : "var(--nv-bg-input)",
                  color: mood === m ? "var(--nv-accent)" : "var(--nv-text-muted)",
                  fontWeight: mood === m ? 600 : 500,
                  transition: "all .15s",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={fieldStyle}>
        <label className="label">Tipo de sesión</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {TIPOS_SESION.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipoSesion(t)}
              style={{
                padding: "5px 16px",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: "var(--nv-font-body)",
                fontSize: 12.5,
                fontWeight: 500,
                background: tipoSesion === t ? "var(--nv-accent)" : "var(--nv-bg-input)",
                color: tipoSesion === t ? "#fff" : "var(--nv-text-muted)",
                border: tipoSesion === t ? "1.5px solid var(--nv-accent)" : "1.5px solid var(--nv-border)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={fieldStyle}>
        <label className="label">Motivo de consulta</label>
        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="¿Qué trae el paciente hoy?" rows={3} className="input" />
      </div>

      <div style={fieldStyle}>
        <label className="label">Estado actual</label>
        <textarea value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="¿Cómo llega a la sesión?" rows={3} className="input" />
      </div>

      <div style={fieldStyle}>
        <label className="label">Temas trabajados</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {TOPICS.map((t) => {
            const sel = topics.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTopic(t)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "var(--nv-font-body)",
                  fontSize: 12,
                  border: sel ? "1.5px solid var(--nv-accent)" : "1px solid var(--nv-border)",
                  background: sel ? "var(--nv-accent)" : "var(--nv-bg-card)",
                  color: sel ? "#fff" : "var(--nv-text-secondary)",
                  transition: "all .15s",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div style={fieldStyle}>
        <label className="label">Tareas / compromisos</label>
        <textarea value={tareas} onChange={(e) => setTareas(e.target.value)} placeholder="¿Qué se lleva el paciente?" rows={2} className="input" />
      </div>

      <div style={{ marginBottom: 0 }}>
        <label className="label">Notas libres</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones, intervenciones, impresiones…" rows={3} className="input" />
      </div>

      {error && <p className="error-text" style={{ marginTop: 8 }}>{error}</p>}

      <button type="submit" className="btn-primary" style={{ marginTop: 14, width: "100%" }} disabled={loading}>
        {loading ? "Guardando…" : "Guardar sesión"}
      </button>
    </form>
  );
}
