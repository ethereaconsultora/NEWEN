"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CrearPublicacionPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { setMensaje("Solo se permiten videos."); return; }
    if (file.size > 100 * 1024 * 1024) { setMensaje("Máximo 100 MB."); return; }

    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMensaje("");
  };

  const subir = async () => {
    if (!videoFile) { setMensaje("Seleccioná un video."); return; }
    setSubiendo(true); setMensaje(""); setProgreso(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const ext = videoFile.name.split(".").pop();
    const timestamp = Date.now();
    const path = `${user.id}/${timestamp}.${ext}`;

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("publicaciones")
      .upload(path, videoFile, { upsert: false });

    if (uploadError) {
      setMensaje("Error al subir video: " + uploadError.message);
      setSubiendo(false);
      return;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("publicaciones").getPublicUrl(path);
    const videoUrl = urlData.publicUrl;

    // Guardar en la tabla publicaciones
    const { error: dbError } = await supabase
      .from("publicaciones")
      .insert({
        counselor_id: user.id,
        contenido: videoUrl,
      });

    if (dbError) {
      setMensaje("Error al guardar: " + dbError.message);
    } else {
      setExito(true);
      setTimeout(() => router.push("/panel"), 1500);
    }
    setSubiendo(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      {/* HEADER */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--nv-text-primary)", padding: 0 }}>←</button>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>Nueva Publicación</h1>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        {exito ? (
          <div className="card" style={{ padding: 32 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
            <p style={{ fontSize: 13, color: "var(--nv-accent)", margin: 0 }}>¡Video publicado! Redirigiendo…</p>
          </div>
        ) : (
          <>
            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="card"
              style={{
                padding: 40,
                cursor: "pointer",
                border: "2px dashed var(--nv-accent-border)",
                marginBottom: 16,
                transition: "border-color 0.2s",
              }}
            >
              {previewUrl ? (
                <video src={previewUrl} controls style={{ width: "100%", maxHeight: 280, borderRadius: 10 }} />
              ) : (
                <>
                  <p style={{ fontSize: 48, marginBottom: 8 }}>🎬</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", marginBottom: 4 }}>
                    Subir video
                  </p>
                  <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: 0 }}>
                    Tocá para seleccionar · MP4, MOV, WebM · Máx 100 MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {videoFile && !subiendo && (
              <p style={{ fontSize: 12, color: "var(--nv-text-secondary)", marginBottom: 12 }}>
                {videoFile.name} · {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}

            {subiendo && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ height: 6, background: "var(--nv-bg-input)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--nv-accent)", borderRadius: 3, width: `${progreso}%`, transition: "width 0.3s" }} />
                </div>
                <p style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4 }}>Subiendo…</p>
              </div>
            )}

            {mensaje && (
              <p style={{ fontSize: 12, color: "var(--nv-state-error)", marginBottom: 12 }}>{mensaje}</p>
            )}

            <button
              onClick={subir}
              disabled={!videoFile || subiendo}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {subiendo ? "Subiendo…" : "Publicar video"}
            </button>

            <p style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 12 }}>
              Solo videos. Sin texto ni imágenes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
