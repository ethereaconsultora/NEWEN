"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PacienteForm from "../../pacientes/PacienteForm";
import styles from "../../pages.module.css";

type Paciente = { id: string; nombre: string; telefono: string | null };

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState("");

  // Alta rápida de paciente (mismo formulario completo)
  const [mostrarAlta, setMostrarAlta] = useState(false);

  async function cargarPacientes() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase
      .from("pacientes")
      .select("id,nombre,telefono")
      .is("deleted_at", null)
      .order("nombre");
    if (data) setPacientes(data);
  }

  useEffect(() => {
    cargarPacientes();
  }, []);

  async function handlePacienteCreado(id: string) {
    setMostrarAlta(false);
    setPacienteId(id);
    await cargarPacientes();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, any> = { estado: "confirmado" };
    fd.forEach((v, k) => {
      if (v) payload[k] = v;
    });

    const paciente = pacientes.find((p) => p.id === payload.paciente_id);
    if (paciente) {
      payload.patient_name = paciente.nombre;
      payload.patient_phone = paciente.telefono ?? null;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: err } = await supabase.from("turnos").insert(payload);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/panel/consultorio/agenda`);
    router.refresh();
  }

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Nuevo turno</h1>
        </div>
        <Link href="/panel/consultorio/agenda" className="btn-ghost" style={{ display: "inline-flex" }}>
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label className="label" style={{ marginBottom: 0 }}>Paciente *</label>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: "5px 12px", fontSize: 12 }}
              onClick={() => setMostrarAlta(true)}
            >
              + Nuevo paciente
            </button>
          </div>

          <select name="paciente_id" className="input" required value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
            <option value="">Seleccioná un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Fecha *</label>
            <input name="fecha" className="input" type="date" defaultValue={hoy} required />
          </div>
          <div>
            <label className="label">Hora *</label>
            <input name="hora" className="input" type="time" required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Modalidad</label>
            <select name="modalidad" className="input" defaultValue="">
              <option value="">Sin definir</option>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
          <div>
            <label className="label">Duración (minutos)</label>
            <input name="duracion" className="input" type="number" defaultValue="50" min="15" max="240" step="5" />
          </div>
        </div>

        <div>
          <label className="label">Notas</label>
          <textarea name="notas" className="input" rows={3} placeholder="Información adicional…" />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando…" : "Guardar turno"}
        </button>
      </form>

      {/* Modal alta de paciente (formulario completo) */}
      {mostrarAlta && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,18,8,0.45)",
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setMostrarAlta(false)}
        >
          <div
            style={{
              background: "var(--nv-bg-card)",
              borderRadius: "var(--nv-radius-lg)",
              padding: 20,
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--nv-shadow)",
              border: "1px solid var(--nv-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: "var(--nv-font-display)", fontSize: 20, marginBottom: 16 }}>Nuevo paciente</h2>
            <PacienteForm onSuccess={handlePacienteCreado} onCancel={() => setMostrarAlta(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
