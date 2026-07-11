"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PostularsePage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", wsp: "", provincia: "", especialidades: "", modalidad: "ambas", enfoque: "", aac: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [exito, setExito] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email) { setMsg("Nombre, apellido y email son obligatorios."); return; }
    setLoading(true); setMsg("");

    const { error } = await supabase.from("postulaciones").insert({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      wsp: form.wsp || null,
      provincia: form.provincia || null,
      especialidades: form.especialidades ? form.especialidades.split(",").map(s => s.trim()).filter(Boolean) : [],
      modalidad: form.modalidad,
      enfoque: form.enfoque || null,
      aac_estado: form.aac || null,
    });

    if (error) { setMsg("Error: " + error.message); setLoading(false); return; }
    setExito(true);
    setTimeout(() => router.push("/"), 2000);
  };

  if (exito) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--nv-font-body)" }}>
        <div className="card" style={{ padding: 32, textAlign: "center", maxWidth: 380 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
          <h2 style={{ fontSize: 20, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>¡Postulación enviada!</h2>
          <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", lineHeight: 1.6 }}>Gracias por tu interés. Vamos a revisar tu perfil y te contactaremos pronto.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 60px", maxWidth: 480, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--nv-accent)", textDecoration: "none", background: "rgba(27,67,50,0.08)", border: "1.5px solid rgba(27,67,50,0.2)", padding: "6px 12px", borderRadius: 8, marginBottom: 24 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>ATRÁS
      </Link>

      <h1 style={{ fontSize: 24, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 4 }}>Postulate como Counselor</h1>
      <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>Completá tus datos y contanos sobre tu enfoque. Revisaremos tu perfil y te contactaremos.</p>

      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="label">Nombre</label><input className="input" name="nombre" value={form.nombre} onChange={handle} required /></div>
          <div><label className="label">Apellido</label><input className="input" name="apellido" value={form.apellido} onChange={handle} required /></div>
        </div>
        <div><label className="label">Email</label><input className="input" type="email" name="email" value={form.email} onChange={handle} required /></div>
        <div><label className="label">WhatsApp</label><input className="input" name="wsp" placeholder="+54 11 ..." value={form.wsp} onChange={handle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="label">Provincia</label><input className="input" name="provincia" value={form.provincia} onChange={handle} /></div>
          <div><label className="label">Modalidad</label><select className="input" name="modalidad" value={form.modalidad} onChange={handle}>
            <option value="ambas">Online y Presencial</option><option value="online">Solo Online</option><option value="presencial">Solo Presencial</option>
          </select></div>
        </div>
        <div><label className="label">Especialidades (separadas por coma)</label><input className="input" name="especialidades" placeholder="Ansiedad, Duelo, Crecimiento personal" value={form.especialidades} onChange={handle} /></div>
        <div><label className="label">Enfoque terapéutico</label><input className="input" name="enfoque" placeholder="Terapia Cognitivo-Conductual, Humanista..." value={form.enfoque} onChange={handle} /></div>
        <div><label className="label">Estado AAC</label><input className="input" name="aac" placeholder="En trámite / Verificado / Pendiente" value={form.aac} onChange={handle} /></div>

        {msg && <p style={{ fontSize: 12, color: "var(--nv-state-error)" }}>{msg}</p>}

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: 8 }}>
          {loading ? "Enviando…" : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}
