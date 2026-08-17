"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../pages.module.css";

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pacientes, setPacientes] = useState<{ id: string; nombre: string; telefono: string | null }[]>([]);

  useEffect(() => {
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("pacientes")
        .select("id,nombre,telefono")
        .is("deleted_at", null)
        .order("nombre");
      if (data) setPacientes(data);
    })();
  }, []);

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
          <label className="label">Paciente *</label>
          <select name="paciente_id" className="input" required defaultValue="">
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
          {loading ? "Guardando…" : "Crear turno"}
        </button>
      </form>
    </div>
  );
}
