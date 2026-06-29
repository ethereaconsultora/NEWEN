"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CounselorCard from "@/components/counselor/CounselorCard";
import type { Counselor } from "@/types/newen";

type C = Counselor & { nombre: string };

function Content() {
  const sp = useSearchParams();
  const router = useRouter();
  const [query] = useState(sp.get("q") ?? "");
  const [modalidad] = useState(sp.get("modalidad") ?? "");
  const [provincia] = useState(sp.get("provincia") ?? "");
  const [data, setData] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (modalidad) p.set("modalidad", modalidad);
    if (provincia) p.set("provincia", provincia);
    fetch(`/api/counselors?${p}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [query, modalidad, provincia]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--nv-bg-base)",
      fontFamily: "var(--nv-font-body)",
    }}>
      {/* HEADER BAR */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        {/* Back arrow */}
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", padding: 4,
            color: "var(--nv-text-primary)",
          }}
          aria-label="Volver"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        {/* Title */}
        <h1 style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: "var(--nv-accent)", textTransform: "uppercase",
          margin: 0, textAlign: "center",
        }}>
          COUNSELORS DISPONIBLES
        </h1>

        {/* Search icon */}
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", padding: 4,
            color: "var(--nv-text-primary)",
          }}
          aria-label="Buscar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "16px 16px 60px", maxWidth: 500, margin: "0 auto" }}>
        {/* Subtitle */}
        <p style={{
          fontSize: 12, color: "var(--nv-text-muted)", marginBottom: 16,
          textAlign: "center",
        }}>
          {loading ? "Buscando counselors…" : data.length === 0 ? "No encontramos counselors con esos filtros." : `${data.length} counselor${data.length !== 1 ? "s" : ""} disponible${data.length !== 1 ? "s" : ""}`}
        </p>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <span className="spinner" />
          </div>
        )}

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map(c => (
            <CounselorCard
              key={c.id}
              id={c.id}
              nombre={c.nombre}
              especialidades={c.especialidades ?? []}
              modalidad={c.modalidad}
              provincia={c.provincia}
              promedio_estrellas={c.promedio_estrellas}
              total_sesiones={c.total_sesiones}
              aac_verificado={c.aac_verificado}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    }>
      <Content />
    </Suspense>
  );
}
