"use client";

import { useEffect, useState } from "react";
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

export default function TalleresPublicPage() {
  const supabase = createClient();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("talleres")
      .select("*")
      .eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTalleres(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 60px", maxWidth: 480, margin: "0 auto", fontFamily: "var(--nv-font-body)" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 20 }}>← Volver</Link>

      <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 6 }}>Talleres</h1>
      <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", marginBottom: 24 }}>Workshops y cursos de nuestros counselors.</p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>
      ) : talleres.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🎓</p>
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>No hay talleres publicados todavía.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {talleres.map(t => (
            <Link key={t.id} href={`/talleres/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 80, height: 60, minWidth: 80, borderRadius: 10,
                    background: "linear-gradient(135deg, #1B4332 0%, #2D5A3D 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, color: "#fff",
                  }}>🎓</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 2px" }}>{t.titulo}</h3>
                    <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: "0 0 4px" }}>
                      {t.modalidad === "grabado" ? "📹 Grabado" : "🔴 En vivo"}
                      {t.fecha_hora && ` · ${new Date(t.fecha_hora).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--nv-accent)" }}>
                      {t.gratuito ? "Gratuito" : `$${t.precio_usd} USD`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
