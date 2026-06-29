"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CounselorCard from "@/components/counselor/CounselorCard";
import type { Counselor } from "@/types/newen";

type C = Counselor & { nombre: string };

function Content() {
  const sp = useSearchParams();
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
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "28px 20px 60px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: 12, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 20 }}>← Volver</Link>

      <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--nv-accent)", textTransform: "uppercase", marginBottom: 6 }}>
        {query ? query.toUpperCase() : "COUNSELORS DISPONIBLES"}
      </h1>
      <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", marginBottom: 24 }}>
        {loading ? "Buscando..." : data.length === 0 ? "No encontramos counselors." : `${data.length} counselor${data.length !== 1 ? "s" : ""} encontrado${data.length !== 1 ? "s" : ""}`}
      </p>

      {loading && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map(c => <CounselorCard key={c.id} id={c.id} nombre={c.nombre} especialidades={c.especialidades ?? []} modalidad={c.modalidad} provincia={c.provincia} promedio_estrellas={c.promedio_estrellas} total_sesiones={c.total_sesiones} aac_verificado={c.aac_verificado} />)}
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>}><Content /></Suspense>;
}
