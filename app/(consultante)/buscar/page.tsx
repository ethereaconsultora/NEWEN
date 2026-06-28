"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CounselorCard from "@/components/counselor/CounselorCard";
import type { Counselor } from "@/types/newen";

type CounselorWithNombre = Counselor & { nombre: string };

export default function BuscarPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [modalidad, setModalidad] = useState("todas");
  const [provincia, setProvincia] = useState("");
  const [counselors, setCounselors] = useState<CounselorWithNombre[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCounselors() {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (modalidad !== "todas") params.set("modalidad", modalidad);
      if (provincia) params.set("provincia", provincia);

      const res = await fetch(`/api/counselors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCounselors(data);
      }
      setLoading(false);
    }

    fetchCounselors();
  }, [query, modalidad, provincia]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        padding: "24px 16px 80px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "var(--nv-accent)",
            textDecoration: "none",
            fontWeight: 500,
            display: "inline-block",
            marginBottom: 16,
          }}
        >
          ← Volver
        </Link>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "var(--nv-font-display)",
            color: "var(--nv-text-primary)",
            marginBottom: 8,
          }}
        >
          {query ? `"${query}"` : "Counselors"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--nv-text-secondary)" }}>
          {loading
            ? "Buscando..."
            : counselors.length === 0
            ? "No encontramos counselors con esos filtros."
            : `${counselors.length} counselor${counselors.length !== 1 ? "s" : ""} encontrado${counselors.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          className="input"
          style={{ width: "auto", padding: "8px 12px", fontSize: 12 }}
        >
          <option value="todas">Todas las modalidades</option>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
        </select>

        <input
          type="text"
          className="input"
          placeholder="Provincia..."
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
          style={{ width: "auto", flex: 1, padding: "8px 12px", fontSize: 12, minWidth: 130 }}
        />
      </div>

      {/* Resultados */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {counselors.map((c) => (
          <CounselorCard
            key={c.id}
            id={c.id}
            nombre={c.nombre}
            bio={c.bio}
            enfoque={c.enfoque}
            especialidades={c.especialidades ?? []}
            modalidad={c.modalidad}
            provincia={c.provincia}
            promedio_estrellas={c.promedio_estrellas}
            total_sesiones={c.total_sesiones}
            aac_verificado={c.aac_verificado}
          />
        ))}
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <span className="spinner" />
        </div>
      )}

      {!loading && counselors.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--nv-text-muted)",
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 12 }}>🌿</p>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Probá con otros términos o filtros.<br />
            La comunidad está creciendo.
          </p>
        </div>
      )}
    </div>
  );
}
