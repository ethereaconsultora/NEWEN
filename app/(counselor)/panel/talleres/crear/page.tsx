"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CrearTallerForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("id");
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modalidad, setModalidad] = useState("grabado");
  const [fechaHora, setFechaHora] = useState("");
  const [precio, setPrecio] = useState("");
  const [gratuito, setGratuito] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!editId) return;
    async function load() {
      const { data } = await supabase.from("talleres").select("*").eq("id", editId).single();
      if (data) {
        setTitulo(data.titulo);
        setDescripcion(data.descripcion ?? "");
        setModalidad(data.modalidad ?? "grabado");
        setFechaHora(data.fecha_hora ? new Date(data.fecha_hora).toISOString().slice(0, 16) : "");
        setPrecio(String(data.precio_usd ?? ""));
        setGratuito(data.gratuito ?? false);
        if (data.video_url) setVideoPreview(data.video_url);
      }
    }
    load();
  }, [editId, supabase]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) { setMsg("Solo videos."); return; }
    if (f.size > 50 * 1024 * 1024) { setMsg("Máx 50 MB."); return; }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setMsg("");
  };

  const guardar = async () => {
    if (!titulo.trim()) { setMsg("Poné un título."); return; }
    setLoading(true); setMsg("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let video_url = videoPreview;

    if (videoFile) {
      const ext = videoFile.name.split(".").pop();
      const path = `${user.id}/talleres/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("publicaciones").upload(path, videoFile, { upsert: false });
      if (upErr) { setMsg("Error al subir video: " + upErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("publicaciones").getPublicUrl(path);
      video_url = urlData.publicUrl;
    }

    const payload = {
      counselor_id: user.id,
      titulo,
      descripcion: descripcion || null,
      modalidad,
      fecha_hora: modalidad === "vivo" && fechaHora ? new Date(fechaHora).toISOString() : null,
      precio_usd: gratuito ? 0 : (parseFloat(precio) || 0),
      gratuito,
      video_url: video_url || null,
    };

    if (editId) {
      const { error } = await supabase.from("talleres").update(payload).eq("id", editId);
      if (error) { setMsg("Error: " + error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from("talleres").insert(payload);
      if (error) { setMsg("Error: " + error.message); setLoading(false); return; }
    }

    router.push("/panel/talleres");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--nv-text-primary)", padding: 0 }}>←</button>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>
          {editId ? "Editar Taller" : "Nuevo Taller"}
        </h1>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
        {/* Video upload */}
        <div onClick={() => fileInputRef.current?.click()} className="card"
          style={{ padding: videoPreview ? 12 : 32, textAlign: "center", cursor: "pointer", marginBottom: 16, border: "2px dashed var(--nv-accent-border)" }}>
          {videoPreview ? (
            <video src={videoPreview} controls style={{ width: "100%", maxHeight: 200, borderRadius: 8, background: "#000" }} />
          ) : (
            <>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎬</p>
              <p style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>Subir video del taller (máx 50 MB)</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFile} style={{ display: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Título</label>
            <input className="input" placeholder="Nombre del taller" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input" rows={3} placeholder="De qué se trata…" value={descripcion} onChange={e => setDescripcion(e.target.value)} style={{ resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label">Modalidad</label>
              <select className="input" value={modalidad} onChange={e => setModalidad(e.target.value)}>
                <option value="grabado">Grabado</option>
                <option value="vivo">En vivo</option>
              </select>
            </div>
            <div>
              <label className="label">{gratuito ? "Gratuito" : "Precio USD"}</label>
              <input className="input" type="number" min="0" placeholder="15" value={precio} onChange={e => setPrecio(e.target.value)} disabled={gratuito} />
            </div>
          </div>

          {modalidad === "vivo" && (
            <div>
              <label className="label">Fecha y hora</label>
              <input className="input" type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} />
            </div>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={gratuito} onChange={e => setGratuito(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--nv-accent)" }} />
            Taller gratuito
          </label>

          {msg && <p style={{ fontSize: 12, color: msg.startsWith("Error") ? "var(--nv-state-error)" : "var(--nv-accent)", textAlign: "center" }}>{msg}</p>}

          <button onClick={guardar} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
            {loading ? "Guardando…" : editId ? "Actualizar taller" : "Crear taller"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrearTallerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>}>
      <CrearTallerForm />
    </Suspense>
  );
}
