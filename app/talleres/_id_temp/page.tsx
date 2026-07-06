"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Taller {
  id: string;
  titulo: string;
  descripcion: string;
  precio_usd: number;
  gratuito: boolean;
  modalidad: string;
  fecha_hora: string | null;
  video_url: string | null;
  created_at: string;
}

export default function TallerDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [taller, setTaller] = useState<Taller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("talleres")
      .select("*")
      .eq("id", id)
      .eq("estado", "publicado")
      .single()
      .then(({ data }) => {
        setTaller(data);
        setLoading(false);
      });
  }, [id, supabase]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!taller) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px", maxWidth: 480, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
        <Link href="/talleres" style={{ fontSize: 12, color: "var(--nv-accent)", textDecoration: "none" }}>← Talleres</Link>
        <div className="card" style={{ padding: 32, textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>Taller no encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 60px", maxWidth: 480, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
      <Link href="/talleres" style={{ fontSize: 12, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 20 }}>← Talleres</Link>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", margin: "0 0 8px" }}>🎓 {taller.titulo}</h1>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <span className="badge" style={{ border: "none", background: "rgba(27,67,50,0.08)" }}>
            {taller.modalidad === "grabado" ? "📹 Grabado" : "🔴 En vivo"}
          </span>
          <span className="badge" style={{
            border: "none",
            background: taller.gratuito ? "rgba(27,67,50,0.08)" : "rgba(27,67,50,0.12)",
            color: "var(--nv-accent)",
            fontWeight: 700,
          }}>
            {taller.gratuito ? "Gratuito" : `$${taller.precio_usd} USD`}
          </span>
        </div>

        {taller.fecha_hora && (
          <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 12 }}>
            📅 {new Date(taller.fecha_hora).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {taller.descripcion && (
          <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{taller.descripcion}</p>
        )}

        {taller.video_url && (
          <video src={taller.video_url} controls style={{ width: "100%", borderRadius: 10, background: "#000", marginTop: 12 }} />
        )}
      </div>
    </div>
  );
}
