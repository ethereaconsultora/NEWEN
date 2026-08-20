"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Sala 1-1 (Daily.co) para el área de profesionales.
 * Crea una sala por llamada vía /api/daily/room y la abre en un iframe
 * (Prebuilt). El profesional comparte el enlace con la persona.
 */
export default function SalaUnoAUnoPage() {
  const supabase = createClient();
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [url, setUrl] = useState("");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      const { data: u } = await supabase.from("users").select("nombre").eq("id", uid).single();
      setNombre(u?.nombre ?? "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function iniciar() {
    setError(null);
    setCreando(true);
    setUrl("");
    const res = await fetch("/api/daily/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "sala-1-1" }),
    });
    const data = await res.json();
    setCreando(false);
    if (!res.ok) {
      setError(data.error || "No se pudo crear la sala.");
      return;
    }
    setUrl(data.url);
    setRoomName(data.name);
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 110px", color: "var(--nv-text-primary)", fontFamily: "var(--nv-font-body)" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--nv-text-muted)", marginBottom: 8 }}>
        Área profesionales
      </div>
      <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 30, fontWeight: 400, marginBottom: 6 }}>
        Sala 1-1 <span style={{ color: "var(--nv-accent)" }}>· videollamada</span>
      </h1>
      <p style={{ color: "var(--nv-text-secondary)", fontSize: 14, marginBottom: 22 }}>
        Sesiones individuales de counseling y supervisión por Daily.co. Iniciá la sala y compartí el
        enlace con la persona.
        {nombre && (
          <>
            {" "}
            Hola, <strong style={{ color: "var(--nv-accent)" }}>{nombre}</strong>.
          </>
        )}
      </p>

      {!url && (
        <button
          onClick={iniciar}
          disabled={creando}
          style={{
            background: "var(--nv-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--nv-radius-md)",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            opacity: creando ? 0.6 : 1,
          }}
        >
          {creando ? "Creando sala…" : "📞 Iniciar sala 1-1"}
        </button>
      )}

      {error && (
        <div
          style={{
            marginTop: 18,
            background: "var(--nv-state-error-soft, rgba(190,70,60,0.12))",
            border: "1px solid var(--nv-state-error, #be463c)",
            color: "var(--nv-state-error, #be463c)",
            padding: "12px 16px",
            borderRadius: "var(--nv-radius-md)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {url && (
        <>
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
            Sala <strong style={{ color: "var(--nv-accent)" }}>{roomName}</strong> lista. Enviá este enlace a
            la persona para que se una:
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                style={{
                  flex: 1,
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
                onClick={() => {
                  navigator.clipboard?.writeText(url);
                }}
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
            </div>
          </div>
          <iframe
            src={url}
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            style={{ width: "100%", height: "72vh", border: "none", borderRadius: "var(--nv-radius-lg)" }}
            allowFullScreen
          />
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={iniciar}
              style={{
                background: "none",
                border: "1px solid var(--nv-border-strong)",
                color: "var(--nv-text-secondary)",
                borderRadius: "var(--nv-radius-sm)",
                padding: "9px 16px",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              🔄 Nueva sala
            </button>
          </div>
        </>
      )}
    </div>
  );
}
