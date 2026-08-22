"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const JITSI_BASE = process.env.NEXT_PUBLIC_JITSI_BASE || "https://meet.jit.si";

/**
 * Sala 1-1 (Jitsi Meet) para el área de profesionales.
 * Cada profesional tiene su sala determinística (newen-1-1-<id>), sin
 * necesidad de API ni tarjeta. El primero en ingresar es el anfitrión.
 */
export default function SalaUnoAUnoPage() {
  const supabase = createClient();
  const [nombre, setNombre] = useState("");
  const [userId, setUserId] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      setUserId(uid);
      setLink(`${JITSI_BASE}/newen-1-1-${uid.replace(/-/g, "").slice(0, 12)}`);
      const { data: u } = await supabase.from("users").select("nombre").eq("id", uid).single();
      setNombre(u?.nombre ?? "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!link) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 110px", color: "var(--nv-text-primary)", fontFamily: "var(--nv-font-body)" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--nv-text-muted)", marginBottom: 8 }}>
        Área profesionales
      </div>
      <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 30, fontWeight: 400, marginBottom: 6 }}>
        Sala 1-1 <span style={{ color: "var(--nv-accent)" }}>· videollamada</span>
      </h1>
      <p style={{ color: "var(--nv-text-secondary)", fontSize: 14, marginBottom: 22 }}>
        Sesiones individuales de counseling y supervisión por <strong>Jitsi Meet</strong> (sin registro ni
        tarjeta). Tu sala es única y siempre la misma.
        {nombre && (
          <>
            {" "}
            Hola, <strong style={{ color: "var(--nv-accent)" }}>{nombre}</strong>.
          </>
        )}
      </p>

      <div
        style={{
          marginBottom: 16,
          background: "var(--nv-bg-card)",
          border: "1px solid var(--nv-border)",
          borderRadius: "var(--nv-radius-md)",
          padding: "12px 16px",
          fontSize: 12.5,
          color: "var(--nv-text-secondary)",
        }}
      >
        Enviá este enlace a la persona para que se una (el primero que ingresa es el anfitrión):
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            style={{
              flex: 1,
              minWidth: 220,
              background: "var(--nv-bg-input)",
              border: "1px solid var(--nv-border)",
              borderRadius: "var(--nv-radius-sm)",
              padding: "10px 12px",
              color: "var(--nv-text-primary)",
              fontSize: 12.5,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => navigator.clipboard?.writeText(link)}
            style={{
              background: "var(--nv-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--nv-radius-sm)",
              padding: "0 16px",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Copiar
          </button>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "none",
              border: "1px solid var(--nv-border-strong)",
              color: "var(--nv-text-secondary)",
              borderRadius: "var(--nv-radius-sm)",
              padding: "0 14px",
              fontSize: 12.5,
              textDecoration: "none",
            }}
          >
            ↗ Abrir en pestaña nueva
          </a>
        </div>
      </div>

      <iframe
        src={link}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        style={{ width: "100%", height: "72vh", border: "none", borderRadius: "var(--nv-radius-lg)" }}
        allowFullScreen
      />
    </div>
  );
}
