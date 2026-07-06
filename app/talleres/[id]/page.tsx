"use client";

import { Suspense, useEffect, useState, useRef, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDolar } from "@/hooks/useDolar";

interface Taller {
  id: string; titulo: string; descripcion: string;
  precio_usd: number; gratuito: boolean; modalidad: string;
  video_url: string | null;
}

function DetalleContent({ id }: { id: string }) {
  const sp = useSearchParams();
  const pagoExito = sp.get("pago") === "exito";
  const supabase = createClient();
  const { venta: dolar } = useDolar();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [loading, setLoading] = useState(true);
  const [comprado, setComprado] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null; setUserId(uid);
      const { data: t } = await supabase.from("talleres").select("*").eq("id", id).eq("estado", "publicado").single();
      setTaller(t);
      if (uid && t) {
        const { data: c } = await supabase.from("compras_talleres").select("estado").eq("consultante_id", uid).eq("taller_id", id).maybeSingle();
        if (c?.estado === "aprobado" || pagoExito) setComprado(true);
        if (t.gratuito) setComprado(true);
      }
      setLoading(false);
    }
    load();
  }, [id, supabase, pagoExito]);

  useEffect(() => {
    if (!taller || loading || comprado || taller.gratuito) return;
    const t = setTimeout(() => { setPreviewEnded(true); videoRef.current?.pause(); }, 60_000);
    return () => clearTimeout(t);
  }, [taller, loading, comprado]);

  const pagar = async () => {
    if (!userId) { alert("Iniciá sesión para comprar."); return; }
    setPagando(true);
    const r = await fetch(`/api/talleres/${id}/pagar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultante_id: userId }) });
    const d = await r.json();
    if (d.init_point) window.location.href = d.init_point;
    else { alert("Error: " + (d.error || "Intentalo de nuevo.")); setPagando(false); }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0D1F17", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  if (!taller) return <div style={{ minHeight: "100vh", background: "#0D1F17", padding: 24, maxWidth: 500, margin: "0 auto" }}><Link href="/talleres" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 12 }}>← Talleres</Link><div style={{ textAlign: "center", padding: 40 }}><p style={{ color: "rgba(255,255,255,0.5)" }}>Taller no encontrado.</p></div></div>;

  const ars = dolar ? taller.precio_usd * dolar : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0D1F17", fontFamily: "var(--nv-font-body)", color: "#FFF" }}>
      <div style={{ padding: "16px 16px 0", maxWidth: 500, margin: "0 auto" }}>
        <Link href="/talleres" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 12 }}>← Talleres</Link>
      </div>
      <div style={{ maxWidth: 500, margin: "16px auto 0", position: "relative" }}>
        {taller.video_url ? (
          <>
            <video ref={videoRef} src={taller.video_url} controls={comprado || taller.gratuito} muted={!comprado && !taller.gratuito}
              style={{ width: "100%", borderRadius: "12px 12px 0 0", background: "#000", maxHeight: 320 }}
              onTimeUpdate={() => { if (!comprado && !taller.gratuito && videoRef.current && videoRef.current.currentTime > 60) { videoRef.current.currentTime = 60; videoRef.current.pause(); setPreviewEnded(true); } }} />
            {!comprado && !taller.gratuito && previewEnded && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "12px 12px 0 0", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center", padding: "0 20px" }}>La preview terminó. Adquirí el taller para verlo completo.</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ height: 200, background: "linear-gradient(135deg, #1B4332, #2D5A3D)", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 48, opacity: 0.4 }}>🎬</span></div>
        )}
      </div>
      <div style={{ background: "#122A1F", padding: "20px 20px 60px", maxWidth: 500, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontFamily: "var(--nv-font-display)", margin: "0 0 6px" }}>{taller.titulo}</h1>
        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 999, color: "rgba(255,255,255,0.7)" }}>{taller.modalidad === "grabado" ? "📹 Grabado" : "🔴 En vivo"}</span>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "16px 0 24px" }}>{taller.descripcion || "Un espacio de aprendizaje y transformación personal."}</p>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
          {comprado || taller.gratuito ? (
            <div style={{ textAlign: "center" }}><p style={{ fontSize: 24, marginBottom: 4 }}>✅</p><p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>{taller.gratuito ? "Taller gratuito." : "Ya tenés acceso."}</p></div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#7ECB8A", margin: 0 }}>${taller.precio_usd} USD</p>
                {ars && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>≈ ${ars.toLocaleString("es-AR")} ARS</p>}
              </div>
              <button onClick={pagar} disabled={pagando} style={{ width: "100%", padding: "16px 0", background: "linear-gradient(135deg, #7ECB8A, #5BA86A)", border: "none", borderRadius: 12, color: "#0D1F17", fontSize: 15, fontWeight: 700, fontFamily: "var(--nv-font-body)", cursor: "pointer", letterSpacing: "0.04em", boxShadow: "0 4px 20px rgba(126,203,138,0.3)" }}>
                {pagando ? "Redirigiendo…" : "Comprar taller"}
              </button>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 10 }}>Pago seguro con Mercado Pago</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TallerDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0D1F17", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>}>
      <DetalleContent id={id} />
    </Suspense>
  );
}
