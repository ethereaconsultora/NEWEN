"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TEMAS, TIPOGRAFIAS, TAMANOS } from "@/lib/consultorio-apariencia";
import { useApariencia } from "@/components/consultorio/ThemeProvider";

export default function AparienciaPage() {
  const supabase = createClient();
  const { prefs, setPrefs } = useApariencia();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
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
        setTimeout(() => setSaved(false), 2500);
      }
    }
    setSaving(false);
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--nv-bg-card)",
    border: "1px solid var(--nv-border)",
    borderRadius: "var(--nv-radius-lg)",
    padding: 22,
    marginBottom: 16,
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 96px", fontFamily: "var(--nv-font-body)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 26, color: "var(--nv-text-primary)", margin: 0 }}>
            Apariencia
          </h1>
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)", margin: "4px 0 0" }}>
            Se aplica a todo tu panel. Los cambios se previsualizan al instante.
          </p>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving} style={{ whiteSpace: "nowrap" }}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {saved && (
        <p style={{ fontSize: 13, color: "var(--nv-accent)", marginBottom: 14 }}>✓ Preferencias guardadas</p>
      )}

      {/* Paleta */}
      <div style={cardStyle}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--nv-text-muted)", marginBottom: 12 }}>
          Paleta de colores
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {TEMAS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPrefs({ ...prefs, themeId: t.id })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: "var(--nv-radius-md)",
                border: prefs.themeId === t.id ? "2px solid var(--nv-accent)" : "1px solid var(--nv-border)",
                background: "var(--nv-bg-input)",
                color: "var(--nv-text-primary)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
              }}
            >
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
              {t.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Tipografía */}
      <div style={cardStyle}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--nv-text-muted)", marginBottom: 12 }}>
          Tipografía
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {TIPOGRAFIAS.map((f) => (
            <button
              key={f.id}
              onClick={() => setPrefs({ ...prefs, fontId: f.id })}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--nv-radius-md)",
                border: prefs.fontId === f.id ? "2px solid var(--nv-accent)" : "1px solid var(--nv-border)",
                background: "var(--nv-bg-input)",
                color: "var(--nv-text-primary)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.nombre}</div>
              <div style={{ fontSize: 12, color: "var(--nv-text-muted)", fontFamily: f.fh }}>{f.preview}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tamaño */}
      <div style={cardStyle}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--nv-text-muted)", marginBottom: 12 }}>
          Tamaño de letra
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TAMANOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setPrefs({ ...prefs, sizeId: s.id })}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--nv-radius-full)",
                border: prefs.sizeId === s.id ? "2px solid var(--nv-accent)" : "1px solid var(--nv-border)",
                background: prefs.sizeId === s.id ? "var(--nv-accent-soft)" : "var(--nv-bg-input)",
                color: "var(--nv-text-primary)",
                cursor: "pointer",
                fontSize: s.zoom * 13,
                fontFamily: "inherit",
              }}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
