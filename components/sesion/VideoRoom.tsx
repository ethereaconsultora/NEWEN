"use client";

import { useEffect, useRef, useState } from "react";

interface VideoRoomProps {
  roomUrl: string;
  onLeave?: () => void;
}

/**
 * Componente de videollamada Daily.co embebido en Newen.
 * Se carga el iframe de Daily.co con la sala ya creada.
 * Sin dependencias extra — usa el modo iframe nativo de Daily.
 */
export default function VideoRoom({ roomUrl, onLeave }: VideoRoomProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Marcar como cargado cuando el iframe termine de cargar
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => setLoading(false);
    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#e8e2d4",
            fontWeight: 500,
            fontFamily: "var(--nv-font-body)",
          }}
        >
          🌿 Sesión Newen
        </span>
        {onLeave && (
          <button
            onClick={onLeave}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#e8e2d4",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--nv-font-body)",
            }}
          >
            Salir
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span className="spinner" style={{ borderTopColor: "var(--nv-accent)" }} />
            <p
              style={{
                marginTop: 16,
                color: "#e8e2d4",
                fontSize: 14,
                fontFamily: "var(--nv-font-body)",
              }}
            >
              Conectando con tu espacio...
            </p>
          </div>
        </div>
      )}

      {/* Iframe Daily.co */}
      <iframe
        ref={iframeRef}
        src={roomUrl}
        allow="camera; microphone; fullscreen"
        style={{
          flex: 1,
          border: "none",
          width: "100%",
          height: "100%",
        }}
        title="Sesión Newen"
      />
    </div>
  );
}
