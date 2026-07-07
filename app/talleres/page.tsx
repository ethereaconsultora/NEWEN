"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDolar } from "@/hooks/useDolar";

interface Taller {
  id: string; titulo: string; descripcion: string;
  precio_usd: number; gratuito: boolean; modalidad: string;
  video_url: string | null; created_at: string;
}

export default function TalleresPage() {
  const supabase = createClient();
  const { venta: dolar } = useDolar();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("talleres").select("*").eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setTalleres(data ?? []); setLoading(false); });
  }, [supabase]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", fontFamily: "var(--nv-font-body)", paddingBottom: 60 }}>
      {/* HEADER */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
          color: "var(--nv-accent)", textDecoration: "none",
          background: "rgba(27,67,50,0.08)", border: "1.5px solid rgba(27,67,50,0.2)",
          padding: "6px 12px", borderRadius: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          ATRÁS
        </Link>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>Talleres</h1>
        <div style={{ width: 60 }} />
      </div>

      {/* CONTENT */}
      <div style={{ padding: "16px 16px 60px", maxWidth: 500, margin: "0 auto" }}>
        <p style={{ fontSize: 12, color: "var(--nv-text-muted)", textAlign: "center", marginBottom: 16 }}>
          {loading ? "Cargando…" : talleres.length === 0 ? "No hay talleres todavía." : `${talleres.length} taller${talleres.length !== 1 ? "es" : ""} disponible${talleres.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><span className="spinner" /></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {talleres.map(t => (
              <Link key={t.id} href={`/talleres/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--nv-shadow-card)"; }}
                >
                  {/* Imagen de preview */}
                  <div style={{
                    height: 150,
                    background: t.video_url
                      ? `url(${t.video_url}) center/cover`
                      : "linear-gradient(135deg, #1B4332, #2D5A3D)",
                    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                    padding: "12px 14px", position: "relative",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.12)" }} />
                    <span style={{ position: "relative", zIndex: 1, background: "rgba(0,0,0,0.35)", color: "#FFF", fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 999 }}>
                      {t.modalidad === "grabado" ? "Grabado" : "En vivo"}
                    </span>
                    {t.gratuito && (
                      <span style={{ position: "relative", zIndex: 1, background: "rgba(27,67,50,0.7)", color: "#FFF", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                        Gratuito
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "14px 16px" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 2px" }}>{t.titulo}</h3>
                    <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
                      {t.descripcion ? t.descripcion.slice(0, 100) + (t.descripcion.length > 100 ? "…" : "") : "Un espacio de aprendizaje."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--nv-accent)" }}>
                        {t.gratuito ? "Gratuito" : `$${t.precio_usd} USD`}
                      </span>
                      {!t.gratuito && dolar && (
                        <span style={{ fontSize: 10, color: "var(--nv-text-muted)" }}>
                          ≈ ${(t.precio_usd * dolar).toLocaleString("es-AR")} ARS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
