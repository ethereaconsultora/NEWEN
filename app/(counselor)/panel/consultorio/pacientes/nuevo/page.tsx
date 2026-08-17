"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../pages.module.css";

const ESTADOS = ["Estable", "Vulnerable", "En proceso", "En crisis"];
const MOOD_KEY = (m: string) => m.replace(/\s/g, "");

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [estadoAnimo, setEstadoAnimo] = useState("Estable");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    if (!nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    setLoading(true);
    const payload: Record<string, any> = { estado_animo: estadoAnimo };
    fd.forEach((v, k) => {
      if (!(v as string).trim()) return;
      if (k === "notas_iniciales") payload["notas"] = v;
      else payload[k] = v;
    });

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error: err } = await supabase.from("pacientes").insert(payload).select("id").single();
    if (err) {
      setError("Error al guardar. Intentá de nuevo.");
      setLoading(false);
      return;
    }
    router.push(`/panel/consultorio/pacientes/${data.id}`);
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Nuevo paciente</h1>
        </div>
        <Link href="/panel/consultorio/pacientes" className="btn-ghost" style={{ display: "inline-flex" }}>
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
        <div>
          <label className="label">Nombre completo *</label>
          <input name="nombre" className="input" required autoFocus placeholder="Nombre Apellido" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" className="input" type="tel" placeholder="+54 9 11 0000-0000" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" className="input" type="email" placeholder="paciente@email.com" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Modalidad</label>
            <select name="modalidad" className="input" defaultValue="">
              <option value="">Sin definir</option>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input name="fecha_nacimiento" className="input" type="date" />
          </div>
        </div>

        <div>
          <label className="label">Estado anímico inicial</label>
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
          <input name="obra_social" className="input" placeholder="Ej: OSDE, IOMA, particular…" />
        </div>

        <div>
          <label className="label">Motivo de consulta</label>
          <textarea name="motivo_consulta" className="input" rows={3} placeholder="¿Qué trae a la consulta?" />
        </div>

        <div>
          <label className="label">Notas iniciales</label>
          <textarea name="notas_iniciales" className="input" rows={3} placeholder="Observaciones, antecedentes, etc." />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando…" : "Guardar paciente"}
        </button>
      </form>
    </div>
  );
}
