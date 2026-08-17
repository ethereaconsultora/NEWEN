"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../pages.module.css";

export default function NuevoPagoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pacientes, setPacientes] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.from("pacientes").select("id,nombre").is("deleted_at", null).order("nombre");
      if (data) setPacientes(data);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, any> = { estado: "pendiente" };
    fd.forEach((v, k) => {
      if (v) payload[k] = v;
    });
    if (payload.monto) payload.monto = Number(payload.monto);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: err } = await supabase.from("pagos").insert(payload);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/panel/consultorio/pagos");
    router.refresh();
  }

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Nuevo pago</h1>
        </div>
        <Link href="/panel/consultorio/pagos" className="btn-ghost" style={{ display: "inline-flex" }}>
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

        <div>
          <label className="label">Monto *</label>
          <input name="monto" className="input" type="number" min="0" step="100" placeholder="0" required />
        </div>

        <div>
          <label className="label">Fecha *</label>
          <input name="fecha" className="input" type="date" defaultValue={hoy} required />
        </div>

        <div>
          <label className="label">Descripción</label>
          <input name="descripcion" className="input" placeholder="Ej: Sesión de agosto, honorarios…" />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando…" : "Registrar pago"}
        </button>
      </form>
    </div>
  );
}
