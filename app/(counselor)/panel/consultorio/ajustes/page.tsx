"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TEMAS, TIPOGRAFIAS, TAMANOS } from "@/lib/consultorio-apariencia";
import { useApariencia } from "@/components/consultorio/ThemeProvider";
import styles from "../pages.module.css";

export default function AjustesPage() {
  const router = useRouter();
  const supabase = createClient();
  const { prefs, setPrefs } = useApariencia();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ nombre: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        router.push("/auth/magic-link");
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("nombre, email")
        .eq("id", user.id)
        .single();
      if (data) setProfile({ nombre: data.nombre ?? "", email: data.email ?? "" });
      setLoading(false);
    })();
  }, [supabase, router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("users")
        .update({ theme_id: prefs.themeId, font_id: prefs.fontId, font_size: prefs.sizeId })
        .eq("id", user.id);
      if (!error) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    }
    setSaving(false);
  };

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
          <div className={styles.pageSub}>Personalizá tu consultorio — los cambios se previsualizan al instante</div>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {saved && (
        <p style={{ fontSize: 13, color: "var(--nv-accent)", marginBottom: 14 }}>✓ Preferencias guardadas</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ── Apariencia ── */}
        <div className="card">
          <div className={styles.fieldLabel} style={{ marginBottom: 14 }}>
            Apariencia
          </div>

          <div className={styles.fieldLabel} style={{ marginBottom: 8 }}>
            Paleta de colores
          </div>
          <div className={styles.swatches} style={{ marginBottom: 18 }}>
            {TEMAS.map((t) => (
              <div
                key={t.id}
                className={`${styles.swatch}${prefs.themeId === t.id ? ` ${styles.swatchSel}` : ""}`}
                onClick={() => setPrefs({ ...prefs, themeId: t.id })}
              >
                <div className={styles.swatchDot} style={{ background: t.accent }} />
                <span className={styles.swatchName}>{t.nombre}</span>
              </div>
            ))}
          </div>

          <div className={styles.fieldLabel} style={{ marginBottom: 8 }}>
            Tipografía
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {TIPOGRAFIAS.map((f) => (
              <div
                key={f.id}
                className={`${styles.fopt}${prefs.fontId === f.id ? ` ${styles.foptSel}` : ""}`}
                onClick={() => setPrefs({ ...prefs, fontId: f.id })}
              >
                <div className={styles.foptName}>{f.nombre}</div>
                <div className={styles.foptPrev} style={{ fontFamily: f.fh }}>{f.preview}</div>
              </div>
            ))}
          </div>

          <div className={styles.fieldLabel} style={{ marginBottom: 8 }}>
            Tamaño de letra
          </div>
          <div className={styles.sizeOpts}>
            {TAMANOS.map((s) => (
              <div
                key={s.id}
                className={`${styles.sizeOpt}${prefs.sizeId === s.id ? ` ${styles.sizeOptSel}` : ""}`}
                onClick={() => setPrefs({ ...prefs, sizeId: s.id })}
              >
                {s.nombre}
              </div>
            ))}
          </div>
        </div>

        {/* ── Perfil + contraseña ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className={styles.fieldLabel} style={{ marginBottom: 12 }}>
              Perfil
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
                Profesional
              </div>
              <div style={{ fontWeight: 600 }}>{profile?.nombre || "—"}</div>
            </div>
            <div>
              <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
                Email
              </div>
              <div>{profile?.email || "—"}</div>
            </div>
          </div>

          <div className="card">
            <div className={styles.fieldLabel} style={{ marginBottom: 12 }}>
              Cambiar contraseña
            </div>
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
    </div>
  );
}
