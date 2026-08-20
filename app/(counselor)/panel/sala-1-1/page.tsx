"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Sala 1-1 (Daily.co) — área profesionales.
 * Crea la sala vía /api/daily/room (máximo 2 participantes) y la monta con
 * daily-js (método oficial de Daily). La llamada se crea en un useEffect
 * DESPUÉS del render (el contenedor ya existe y React no borra el iframe).
 */
export default function SalaUnoAUnoPage() {
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [roomUrl, setRoomUrl] = useState(""); // al setearse, el efecto monta la llamada
  const [roomName, setRoomName] = useState("");
  const [link, setLink] = useState("");
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

  // Monta la videollamada cuando hay roomUrl (efecto post-render).
  useEffect(() => {
    if (!roomUrl) return;
    const container = containerRef.current;
    if (!container) return;

    let call: any = null;
    let done = false;

    (async () => {
      try {
        container.innerHTML = "";
        call = DailyIframe.createFrame(container, {
          showLeaveButton: true,
          iframeStyle: {
            width: "100%",
            height: "72vh",
            border: "none",
            borderRadius: "16px",
          },
        });
        call.on("error", (e: any) => {
          if (!done) setError("Error de Daily: " + (e?.errorMsg || e?.type || "desconocido"));
        });
        await call.join({ url: roomUrl, userName: nombre || "Profesional" });
      } catch (e: any) {
        if (!done) setError("No se pudo iniciar la videollamada: " + (e?.message || "error"));
      }
    })();

    return () => {
      done = true;
      try {
        call?.destroy();
      } catch {
        // ignorar
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUrl]);

  async function iniciar() {
    setError(null);
    setCreando(true);
    setRoomUrl("");
    setLink("");

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

    setRoomName(data.name);
    setLink(data.roomUrl || data.url || "");
    setRoomUrl(data.roomUrl || data.url || "");
  }

  function salir() {
    setRoomUrl("");
    setLink("");
    setRoomName("");
    setError(null);
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
        Sesiones individuales de counseling y supervisión por Daily.co — máximo 2 personas por sala.
        Iniciá la sala y compartí el enlace con la persona.
        {nombre && (
          <>
            {" "}
            Hola, <strong style={{ color: "var(--nv-accent)" }}>{nombre}</strong>.
          </>
        )}
      </p>

      {!roomUrl && (
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
            background: "rgba(190,70,60,0.12)",
            border: "1px solid #be463c",
            color: "#be463c",
            padding: "12px 16px",
            borderRadius: "var(--nv-radius-md)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {link && (
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
          Sala <strong style={{ color: "var(--nv-accent)" }}>{roomName}</strong> lista (máx. 2 personas).
          Enviá este enlace a la persona:
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
      )}

      <div ref={containerRef} />

      {roomUrl && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={salir}
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
            📵 Finalizar y salir
          </button>
        </div>
      )}
    </div>
  );
}
