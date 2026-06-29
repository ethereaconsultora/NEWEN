"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CounselorCard from "@/components/counselor/CounselorCard";
import type { Counselor } from "@/types/newen";

type CounselorWithNombre = Counselor & { nombre: string };

function BuscarContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [modalidad, setModalidad] = useState("todas");
  const [provincia, setProvincia] = useState("");
  const [counselors, setCounselors] = useState<CounselorWithNombre[]>([]);
  const [loading, setLoading] = useState(false);
  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const p = new URLSearchParams();
      if (query) p.set("q", query);
      if (modalidad !== "todas") p.set("modalidad", modalidad);
      if (provincia) p.set("provincia", provincia);
      const res = await fetch(`/api/counselors?${p.toString()}`);
      if (res.ok) setCounselors(await res.json());
      setLoading(false);
    }
    load();
  }, [query, modalidad, provincia]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)" }}>
      {/* ── HEADER ANIMA ── */}
      <header style={{ background: "var(--nv-bg-surface)", borderBottom: "1px solid var(--nv-border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
        <Link href="/" style={{ fontSize: 18, color: "var(--nv-accent)", textDecoration: "none", lineHeight: 1 }}>←</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--nv-text-primary)", fontFamily: "var(--nv-font-display)", letterSpacing: -0.3 }}>
            {query ? `"${query}"` : "Counselors"}
          </div>
          <div style={{ fontSize: 10, color: "var(--nv-text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Newen · {hoy}</div>
        </div>
      </header>

      <div style={{ padding: "16px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
        {/* Filtros */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="input" style={{ width: "auto", padding: "8px 12px", fontSize: 12, flex: 1 }}>
            <option value="todas">Todas</option><option value="online">Online</option><option value="presencial">Presencial</option>
          </select>
          <input value={provincia} onChange={e => setProvincia(e.target.value)} className="input" placeholder="Provincia" style={{ width: 120, padding: "8px 12px", fontSize: 12 }} />
        </div>

        {/* Resultados */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {counselors.map(c => <CounselorCard key={c.id} id={c.id} nombre={c.nombre} bio={c.bio} enfoque={c.enfoque} especialidades={c.especialidades ?? []} modalidad={c.modalidad} provincia={c.provincia} promedio_estrellas={c.promedio_estrellas} total_sesiones={c.total_sesiones} aac_verificado={c.aac_verificado} />)}
        </div>

        {loading && <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><span className="spinner" /></div>}

        {!loading && counselors.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🌿</p>
            <p style={{ fontSize: 14, color: "var(--nv-text-muted)", lineHeight: 1.6 }}>Probá con otros términos o filtros.<br />La comunidad está creciendo.</p>
          </div>
        )}
      </div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--nv-bg-surface)", borderTop: "1px solid var(--nv-border)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 50 }}>
        {[{ href: "/", icon: "🔍", label: "Explorar" }, { href: "/mi-cuenta", icon: "👤", label: "Cuenta" }].map(n => (
          <Link key={n.href} href={n.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, color: "var(--nv-text-muted)", fontWeight: 500 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function BuscarPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>}><BuscarContent /></Suspense>;
}
