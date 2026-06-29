"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PerfilCounselorPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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
        .select("bio, enfoque, especialidades, modalidad, provincia, experiencia_anios, mp_access_token")
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
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const guardar = async () => {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("counselors")
      .update({
        bio: bio || null,
        enfoque: enfoque || null,
        especialidades: especialidades ? especialidades.split(",").map((s) => s.trim()).filter(Boolean) : [],
        modalidad,
        provincia: provincia || null,
        experiencia_anios: experiencia ? parseInt(experiencia) : null,
        mp_access_token: mpToken || null,
      })
      .eq("id", user.id);

    if (error) {
      setMensaje("Error al guardar.");
    } else {
      setMensaje("✅ Perfil actualizado.");
    }
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/panel" style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>← Panel</Link>

      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 24 }}>Mi Perfil</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Contá sobre vos, tu formación, tu mirada..." style={{ resize: "vertical", fontFamily: "var(--nv-font-body)", lineHeight: 1.6 }} />
        </div>

        <div>
          <label className="label">Enfoque</label>
          <input className="input" value={enfoque} onChange={(e) => setEnfoque(e.target.value)} placeholder="Humanista, Rogeriano, Gestáltico..." />
        </div>

        <div>
          <label className="label">Especialidades (separadas por coma)</label>
          <input className="input" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} placeholder="Ansiedad, Duelo, Pareja, Trabajo..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Modalidad</label>
            <select className="input" value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
              <option value="ambas">Online y Presencial</option>
              <option value="online">Solo Online</option>
              <option value="presencial">Solo Presencial</option>
            </select>
          </div>
          <div>
            <label className="label">Provincia</label>
            <input className="input" value={provincia} onChange={(e) => setProvincia(e.target.value)} placeholder="Buenos Aires..." />
          </div>
        </div>

        <div>
          <label className="label">Años de experiencia</label>
          <input className="input" type="number" min={0} max={50} value={experiencia} onChange={(e) => setExperiencia(e.target.value)} placeholder="5" />
        </div>

        <hr className="separator" />

        <div>
          <label className="label">Token de Mercado Pago</label>
          <input className="input" type="password" value={mpToken} onChange={(e) => setMpToken(e.target.value)} placeholder="APP_USR-..." />
          <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            Necesario para recibir pagos. Lo obtenés en Mercado Pago → Configuración → Credenciales → Access Token de producción.
            <strong> Nunca compartas este token.</strong>
          </p>
        </div>

        {mensaje && <p style={{ fontSize: 13, color: mensaje.startsWith("✅") ? "var(--nv-accent)" : "var(--nv-state-error)", textAlign: "center" }}>{mensaje}</p>}

        <button onClick={guardar} className="btn-primary" disabled={guardando} style={{ width: "100%" }}>
          {guardando ? "Guardando..." : "Guardar perfil"}
        </button>
      </div>
    </div>
  );
}
