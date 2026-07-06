"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDolar } from "@/hooks/useDolar";

interface Taller {
  id: string;
  titulo: string;
  descripcion: string;
  precio_usd: number;
  gratuito: boolean;
  modalidad: string;
  video_url: string | null;
  created_at: string;
}

export default function TalleresPage() {
  const supabase = createClient();
  const { venta: dolar } = useDolar();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("talleres")
      .select("*")
      .eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setTalleres(data ?? []); setLoading(false); });
  }, [supabase]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #F0EBE0 0%, #E8E0D3 100%)", fontFamily: "var(--nv-font-body)" }}>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, #1B4332 0%, #2D5A3D 50%, #1B4332 100%)",
        padding: "60px 20px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 12, position: "relative", zIndex: 1 }}>← Volver</Link>
        <h1 style={{ fontSize: 32, fontFamily: "var(--nv-font-display)", color: "#FFFFFF", margin: "16px 0 8px", letterSpacing: -0.5, position: "relative", zIndex: 1 }}>
          Talleres
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 300, margin: "0 auto", lineHeight: 1.6, position: "relative", zIndex: 1 }}>
          Espacios de aprendizaje y transformación. Cada taller es una invitación a explorar, sentir y crecer.
        </p>
      </div>

      {/* LISTA */}
      <div style={{ padding: "20px 16px 60px", maxWidth: 500, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><span className="spinner" /></div>
        ) : talleres.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🎓</p>
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>Pronto vas a encontrar talleres acá.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {talleres.map(t => (
              <Link key={t.id} href={`/talleres/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  transition: "all 0.3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    height: 140,
                    background: t.video_url
                      ? "#1B4332"
                      : "linear-gradient(135deg, #2D5A3D 0%, #1B4332 50%, #3A6B4F 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <span style={{ fontSize: 40, opacity: 0.6 }}>🎬</span>
                    {t.gratuito && (
                      <span style={{
                        position: "absolute", top: 10, right: 10,
                        background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                        color: "#FFF", fontSize: 10, fontWeight: 700,
                        padding: "4px 10px", borderRadius: 999,
                        textTransform: "uppercase", letterSpacing: 1,
                      }}>Gratuito</span>
                    )}
                    <span style={{
                      position: "absolute", bottom: 10, left: 10,
                      background: "rgba(0,0,0,0.4)", color: "#FFF",
                      fontSize: 9, fontWeight: 600,
                      padding: "3px 8px", borderRadius: 999,
                    }}>{t.modalidad === "grabado" ? "📹 Grabado" : "🔴 En vivo"}</span>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 4px" }}>{t.titulo}</h3>
                    <p style={{ fontSize: 12, color: "var(--nv-text-muted)", margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {t.descripcion || "Un espacio para explorar, sentir y transformar."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--nv-accent)" }}>
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
