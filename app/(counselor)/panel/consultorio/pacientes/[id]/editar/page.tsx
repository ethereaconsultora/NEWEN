"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "../../../pages.module.css";

const ESTADOS = ["Estable", "Vulnerable", "En proceso", "En crisis"];
const MOOD_KEY = (m: string) => m.replace(/\s/g, "");

export default function EditarPacientePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [paciente, setPaciente] = useState<any>(null);
  const [estadoAnimo, setEstadoAnimo] = useState("Estable");

  useEffect(() => {
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.from("pacientes").select("*").eq("id", id).single();
      if (data) {
        setPaciente(data);
        setEstadoAnimo(data.estado_animo ?? "Estable");
      }
      setLoading(false);
    })();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    if (!nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    const payload: Record<string, any> = { estado_animo: MOOD_KEY(estadoAnimo) };
    fd.forEach((v, k) => {
      if (k === "notas_iniciales") payload["notas_iniciales"] = (v as string).trim() || null;
      else payload[k] = (v as string).trim() || null;
    });

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: err } = await supabase.from("pacientes").update(payload).eq("id", id);
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    router.push(`/panel/consultorio/pacientes/${id}`);
  }

  if (loading) {
    return <div style={{ textAlign: "center", paddingTop: 40, color: "var(--nv-text-muted)" }}>Cargando…</div>;
  }
  if (!paciente) return null;

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Editar paciente</h1>
        </div>
        <Link href={`/panel/consultorio/pacientes/${id}`} className="btn-ghost" style={{ display: "inline-flex" }}>
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
        <div>
          <label className="label">Nombre completo *</label>
          <input name="nombre" className="input" required defaultValue={paciente.nombre} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" className="input" type="tel" defaultValue={paciente.telefono ?? ""} />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" className="input" type="email" defaultValue={paciente.email ?? ""} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Modalidad</label>
            <select name="modalidad" className="input" defaultValue={paciente.modalidad ?? ""}>
              <option value="">Sin definir</option>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input name="fecha_nacimiento" className="input" type="date" defaultValue={paciente.fecha_nacimiento ?? ""} />
          </div>
        </div>

        <div>
          <label className="label">Estado anímico</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {ESTADOS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEstadoAnimo(e)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: "1.5px solid",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: "var(--nv-font-body)",
                  borderColor: estadoAnimo === e ? "transparent" : "var(--nv-border)",
                  background: estadoAnimo === e ? "var(--nv-accent)" : "transparent",
                  color: estadoAnimo === e ? "#fff" : "var(--nv-text-muted)",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Obra social</label>
          <input name="obra_social" className="input" defaultValue={paciente.obra_social ?? ""} />
        </div>

        <div>
          <label className="label">Motivo de consulta</label>
          <textarea name="motivo_consulta" className="input" rows={3} defaultValue={paciente.motivo_consulta ?? ""} />
        </div>

        <div>
          <label className="label">Notas iniciales</label>
          <textarea name="notas_iniciales" className="input" rows={3} defaultValue={paciente.notas_iniciales ?? ""} />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
