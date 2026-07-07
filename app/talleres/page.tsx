"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDolar } from "@/hooks/useDolar";

// ── Fondos painterly 16:9 — textura a pincel, tonos tierra, luz suave ──

const bgLuz = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs>
    <radialGradient id="luz" cx="70%" cy="30%" r="70%"><stop offset="0%" stop-color="#F5EDE0" stop-opacity="0.9"/><stop offset="50%" stop-color="#E8DCC8" stop-opacity="0.7"/><stop offset="100%" stop-color="#C4B5A0" stop-opacity="0.9"/></radialGradient>
    <filter id="textura"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/><feColorMatrix type="saturate" values="0" in="noise" result="gray"/><feBlend in="SourceGraphic" in2="gray" mode="multiply" result="textured"/></filter>
  </defs>
  <rect width="320" height="180" fill="url(#luz)" filter="url(#textura)"/>
  <rect x="0" y="0" width="320" height="180" fill="#D4C4AC" opacity="0.08"/>
  <circle cx="240" cy="50" r="90" fill="#F0E8D5" opacity="0.4"/>
  <circle cx="260" cy="40" r="60" fill="#FAF3E5" opacity="0.35"/>
  <path d="M0 130 Q80 100 160 120 Q240 140 320 110" stroke="#8B7D6B" stroke-width="0.5" fill="none" opacity="0.15"/>
  <path d="M0 150 Q100 130 200 145 Q280 155 320 140" stroke="#9B8D7B" stroke-width="0.4" fill="none" opacity="0.12"/>
</svg>`)}`;

const bgSendero = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#EDE4D3"/><stop offset="40%" stop-color="#E0D4BE"/><stop offset="100%" stop-color="#B8A88E"/></linearGradient>
    <filter id="grano"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
  </defs>
  <rect width="320" height="180" fill="url(#cielo)" filter="url(#grano)"/>
  <ellipse cx="160" cy="140" rx="140" ry="50" fill="#A89878" opacity="0.5"/>
  <path d="M120 180 Q140 150 160 145 Q180 140 200 155 L200 180 Z" fill="#9B8B6E" opacity="0.4"/>
  <path d="M60 160 Q80 170 95 155 Q110 140 125 145 Q140 150 145 160" stroke="#8B7D6B" stroke-width="1.5" fill="none" opacity="0.25"/>
  <ellipse cx="240" cy="50" rx="25" ry="18" fill="#D4C4A0" opacity="0.3"/>
  <ellipse cx="250" cy="45" rx="15" ry="10" fill="#E8DCC0" opacity="0.25"/>
  <ellipse cx="60" cy="70" rx="30" ry="22" fill="#C4B598" opacity="0.2"/>
  <ellipse cx="70" cy="65" rx="18" ry="13" fill="#D8CCB0" opacity="0.2"/>
  <rect x="75" y="50" width="2.5" height="25" rx="1" fill="#7A6B58" opacity="0.3"/>
  <rect x="88" y="55" width="2" height="20" rx="1" fill="#7A6B58" opacity="0.25"/>
  <rect x="235" y="35" width="2" height="22" rx="1" fill="#8B7D6B" opacity="0.25"/>
</svg>`)}`;

const bgVeladura = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="vel" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EBE0D0"/><stop offset="40%" stop-color="#DDCEB4"/><stop offset="100%" stop-color="#C8B898"/></linearGradient>
    <filter id="tela"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3"/><feColorMatrix type="saturate" values="0.1"/><feBlend in="SourceGraphic" mode="soft-light"/></filter>
  </defs>
  <rect width="320" height="180" fill="url(#vel)" filter="url(#tela)"/>
  <circle cx="60" cy="120" r="40" fill="#A8B89A" opacity="0.15"/>
  <circle cx="70" cy="110" r="30" fill="#B8C8A8" opacity="0.12"/>
  <path d="M200 20 Q230 50 220 90" stroke="#9BA88A" stroke-width="1" fill="none" opacity="0.2"/>
  <path d="M210 25 Q235 55 225 85" stroke="#8B9B7A" stroke-width="0.8" fill="none" opacity="0.15"/>
  <circle cx="270" cy="30" r="15" fill="#D4C4A0" opacity="0.18"/>
  <circle cx="280" cy="25" r="8" fill="#E0D4B0" opacity="0.15"/>
  <rect x="0" y="0" width="320" height="180" fill="#C8B898" opacity="0.05"/>
</svg>`)}`;

const bgPapel = `data:image/svg+xml,${encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs>
    <filter id="papel"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="5"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer></filter>
  </defs>
  <rect width="320" height="180" fill="#EDE3D3"/>
  <rect width="320" height="180" filter="url(#papel)"/>
  <rect x="0" y="0" width="320" height="180" fill="#D4C4A8" opacity="0.06"/>
  <ellipse cx="160" cy="140" rx="120" ry="30" fill="#C4B498" opacity="0.12"/>
  <ellipse cx="160" cy="135" rx="100" ry="20" fill="#D4C8A8" opacity="0.1"/>
  <circle cx="100" cy="60" r="50" fill="#E8DCC4" opacity="0.2"/>
  <circle cx="110" cy="55" r="35" fill="#F0E8D5" opacity="0.18"/>
  <rect x="95" y="30" width="2" height="35" rx="1" fill="#B8A88E" opacity="0.2"/>
  <rect x="115" y="35" width="1.5" height="28" rx="1" fill="#B8A88E" opacity="0.15"/>
</svg>`)}`;

const FONDOS = [bgLuz, bgSendero, bgVeladura, bgPapel];

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
    <div style={{
      minHeight: "100vh",
      background: "#EBE0D0",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* HERO — painterly, cálido */}
      <div style={{
        background: "linear-gradient(180deg, #D4C4A8 0%, #E0D4BC 40%, #EBE0D0 100%)",
        padding: "56px 24px 36px",
        textAlign: "center",
        borderBottom: "1px solid rgba(139,125,107,0.12)",
      }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
          color: "var(--nv-accent)", textDecoration: "none",
          background: "rgba(27,67,50,0.08)", border: "1.5px solid rgba(27,67,50,0.2)",
          padding: "6px 14px", borderRadius: 8, marginBottom: 16,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          ATRÁS
        </Link>
        <h1 style={{
          fontSize: 34, fontFamily: "var(--nv-font-display)",
          color: "#5A3E2B", margin: "14px 0 6px",
          letterSpacing: -0.5, fontWeight: 400,
        }}>Talleres</h1>
        <p style={{
          fontSize: 13, color: "rgba(90,60,40,0.55)",
          maxWidth: 320, margin: "0 auto", lineHeight: 1.7,
          fontStyle: "italic",
        }}>
          Espacios de calma, aprendizaje y transformación. Cada taller es una invitación a detenerse, sentir y crecer.
        </p>
      </div>

      {/* LISTA */}
      <div style={{ padding: "24px 16px 60px", maxWidth: 520, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <span className="spinner" style={{ borderTopColor: "#8B7D6B" }} />
          </div>
        ) : talleres.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 56,
            background: "rgba(255,255,255,0.3)", borderRadius: 8,
          }}>
            <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>🕯️</p>
            <p style={{ fontSize: 13, color: "rgba(90,60,40,0.5)", fontStyle: "italic" }}>
              Pronto vas a encontrar talleres acá. Mientras tanto, respirá hondo.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {talleres.map((t, i) => {
              const bg = FONDOS[i % FONDOS.length];
              return (
                <Link key={t.id} href={`/talleres/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    background: "#FAF6F0",
                    borderRadius: 6,
                    overflow: "hidden",
                    border: "1px solid rgba(139,125,107,0.12)",
                    transition: "all 0.35s ease",
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 6px 28px rgba(90,60,40,0.10)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Header 16:9 painterly */}
                    <div style={{
                      aspectRatio: "16/9",
                      backgroundImage: `url(${bg})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                      padding: "14px 16px",
                      position: "relative",
                    }}>
                      <div style={{ position: "absolute", inset: 0, background: "rgba(139,125,107,0.06)" }} />
                      {t.gratuito && (
                        <span style={{
                          position: "absolute", top: 12, right: 14,
                          background: "rgba(255,250,245,0.75)",
                          backdropFilter: "blur(4px)",
                          color: "#5A3E2B", fontSize: 10, fontWeight: 600,
                          padding: "3px 10px", borderRadius: 999,
                          letterSpacing: "0.04em",
                          border: "1px solid rgba(139,125,107,0.15)",
                        }}>Gratuito</span>
                      )}
                      <span style={{
                        background: "rgba(250,245,238,0.8)",
                        backdropFilter: "blur(3px)",
                        color: "#6B5A4A", fontSize: 10, fontWeight: 500,
                        padding: "3px 10px", borderRadius: 999,
                      }}>{t.modalidad === "grabado" ? "Grabado" : "En vivo"}</span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "18px 20px" }}>
                      <h3 style={{
                        fontSize: 17, fontWeight: 600, color: "#4A3222",
                        margin: "0 0 4px", fontFamily: "var(--nv-font-display)",
                        letterSpacing: -0.3,
                      }}>{t.titulo}</h3>
                      <p style={{
                        fontSize: 12, color: "rgba(90,60,40,0.5)",
                        margin: "0 0 14px", lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {t.descripcion || "Un espacio para la pausa, la contemplación y el aprendizaje sereno."}
                      </p>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid rgba(139,125,107,0.08)",
                        paddingTop: 12,
                      }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#5A3E2B" }}>
                          {t.gratuito ? "Gratuito" : `$${t.precio_usd} USD`}
                        </span>
                        {!t.gratuito && dolar && (
                          <span style={{ fontSize: 10, color: "rgba(90,60,40,0.45)" }}>
                            ≈ ${(t.precio_usd * dolar).toLocaleString("es-AR")} ARS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
