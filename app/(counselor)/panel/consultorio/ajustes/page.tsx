"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../pages.module.css";

export default function AjustesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ nombre: string; email: string } | null>(null);

  // Cambio de contraseña
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data } = await supabase.from("users").select("nombre, email").eq("id", user.id).single();
      if (data) setProfile({ nombre: data.nombre ?? "", email: data.email ?? "" });
      setLoading(false);
    })();
  }, [supabase, router]);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwOk(false);
    if (pw1.length < 6) {
      setPwError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (pw1 !== pw2) {
      setPwError("Las contraseñas no coinciden.");
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setPwSaving(false);
    if (error) {
      setPwError("No se pudo actualizar. Intentá de nuevo.");
    } else {
      setPwOk(true);
      setPw1("");
      setPw2("");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Ajustes</h1>
          <div className={styles.pageSub}>Datos de tu cuenta y contraseña</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className={styles.fieldLabel} style={{ marginBottom: 12 }}>Perfil</div>
          <div style={{ marginBottom: 12 }}>
            <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>Profesional</div>
            <div style={{ fontWeight: 600 }}>{profile?.nombre || "—"}</div>
          </div>
          <div>
            <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>Email</div>
            <div>{profile?.email || "—"}</div>
          </div>
        </div>

        <div className="card">
          <div className={styles.fieldLabel} style={{ marginBottom: 12 }}>Cambiar contraseña</div>
          <form onSubmit={handlePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label className="label">Nueva contraseña</label>
              <input
                type="password"
                value={pw1}
                onChange={(e) => { setPw1(e.target.value); setPwError(""); setPwOk(false); }}
                className="input"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Confirmá la contraseña</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => { setPw2(e.target.value); setPwError(""); setPwOk(false); }}
                className="input"
                placeholder="Repetí tu nueva contraseña"
                autoComplete="new-password"
              />
            </div>
            {pwError && <p className="error-text">{pwError}</p>}
            {pwOk && <p style={{ fontSize: 13, color: "var(--nv-accent)" }}>✓ Contraseña actualizada</p>}
            <button type="submit" className="btn-secondary" disabled={pwSaving}>
              {pwSaving ? "Actualizando…" : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
