"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditarPerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const [bio, setBio] = useState("");
  const [enfoque, setEnfoque] = useState("");
  const [especialidades, setEspecialidades] = useState("");
  const [modalidad, setModalidad] = useState("ambas");
  const [provincia, setProvincia] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [mpToken, setMpToken] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("counselors")
        .select("bio, enfoque, especialidades, modalidad, provincia, experiencia_anios, mp_access_token, foto_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setBio(data.bio ?? "");
        setEnfoque(data.enfoque ?? "");
        setEspecialidades((data.especialidades ?? []).join(", "));
        setModalidad(data.modalidad ?? "ambas");
        setProvincia(data.provincia ?? "");
        setExperiencia(String(data.experiencia_anios ?? ""));
        setMpToken(data.mp_access_token ?? "");
        if (data.foto_url) setFotoPreview(data.foto_url);
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMensaje("Solo imágenes."); return; }
    if (file.size > 5 * 1024 * 1024) { setMensaje("Máximo 5 MB."); return; }
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const guardar = async () => {
    setGuardando(true); setMensaje("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let foto_url = fotoPreview;

    // Subir foto si hay nueva
    if (fotoFile) {
      const ext = fotoFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("counselors")
        .upload(path, fotoFile, { upsert: true });
      if (uploadError) { setMensaje("Error al subir foto: " + uploadError.message); setGuardando(false); return; }

      const { data: urlData } = supabase.storage.from("counselors").getPublicUrl(path);
      foto_url = urlData.publicUrl;
    }

    // Upsert: insertar si no existe, actualizar si existe
    const { error } = await supabase
      .from("counselors")
      .upsert({
        id: user.id,
        bio: bio || null,
        enfoque: enfoque || null,
        especialidades: especialidades ? especialidades.split(",").map(s => s.trim()).filter(Boolean) : [],
        modalidad,
        provincia: provincia || null,
        experiencia_anios: experiencia ? parseInt(experiencia) : null,
        mp_access_token: mpToken || null,
        foto_url: foto_url || null,
      });

    if (error) { setMensaje("Error al guardar: " + error.message); }
    else { setMensaje("✅ Perfil actualizado."); setTimeout(() => router.push("/panel"), 800); }
    setGuardando(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      {/* HEADER */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--nv-text-primary)", padding: 0 }}>←</button>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>Editar Perfil</h1>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
        {/* FOTO */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: fotoPreview ? `url(${fotoPreview}) center/cover` : "linear-gradient(145deg, #c8dccf 0%, #a8c9b0 40%, #8db89a 100%)",
              margin: "0 auto 8px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: fotoPreview ? "transparent" : "#fff",
              fontFamily: "var(--nv-font-display)",
              border: "3px solid var(--nv-accent-border)",
              position: "relative", overflow: "hidden",
            }}
          >
            {!fotoPreview && "?"}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", padding: "4px 0", fontSize: 9, color: "#fff" }}>
              Cambiar
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoChange} style={{ display: "none" }} />
          <p style={{ fontSize: 10, color: "var(--nv-text-muted)" }}>JPG o PNG, máx 5 MB</p>
        </div>

        {mensaje && <p style={{ fontSize: 12, color: mensaje.startsWith("✅") ? "var(--nv-accent)" : "var(--nv-state-error)", textAlign: "center", marginBottom: 14 }}>{mensaje}</p>}

        {/* FORM */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Bio</label>
            <textarea className="input" rows={3} placeholder="Contanos sobre vos y tu enfoque terapéutico…" value={bio} onChange={e => setBio(e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <div>
            <label className="label">Enfoque</label>
            <input className="input" placeholder="Ej: Terapia Cognitivo-Conductual" value={enfoque} onChange={e => setEnfoque(e.target.value)} />
          </div>
          <div>
            <label className="label">Especialidades (separadas por coma)</label>
            <input className="input" placeholder="Ej: Duelo, Ansiedad, Adolescencia" value={especialidades} onChange={e => setEspecialidades(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label">Modalidad</label>
              <select className="input" value={modalidad} onChange={e => setModalidad(e.target.value)}>
                <option value="ambas">Online y Presencial</option>
                <option value="online">Solo Online</option>
                <option value="presencial">Solo Presencial</option>
              </select>
            </div>
            <div>
              <label className="label">Provincia</label>
              <input className="input" placeholder="Buenos Aires" value={provincia} onChange={e => setProvincia(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Años de experiencia</label>
            <input className="input" type="number" min="0" max="50" placeholder="5" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
          </div>
          <div>
            <label className="label">Token de Mercado Pago</label>
            <input className="input" type="password" placeholder="APP_USR-…" value={mpToken} onChange={e => setMpToken(e.target.value)} />
            <p style={{ fontSize: 9, color: "var(--nv-text-muted)", marginTop: 4 }}>Se guarda encriptado. Solo vos podés verlo.</p>
          </div>

          <button onClick={guardar} disabled={guardando} className="btn-primary" style={{ width: "100%", marginTop: 8 }}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
