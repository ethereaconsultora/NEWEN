"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página pública de agenda del counselor.
 * Cualquiera puede ver los slots disponibles y reservar.
 * Link compartible: /agenda/[counselor_id]
 */
export default function AgendaPublicaPage({ params }: PageProps) {
  const { id } = use(params);

  const [counselor, setCounselor] = useState<{ nombre: string } | null>(null);
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reservado, setReservado] = useState(false);

  useEffect(() => {
    // Cargar nombre del counselor
    fetch("/api/counselors")
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((c: { id: string }) => c.id === id);
        if (found) setCounselor(found);
      });
  }, [id]);

  useEffect(() => {
    if (!fecha) return;
    setLoading(true);
    setError("");

    fetch(`/api/counselors/${id}/slots?fecha=${fecha}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSlots(data.slots ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al consultar.");
        setLoading(false);
      });
  }, [fecha, id]);

  const handleReservar = () => {
    setReservado(true);
  };

  const dias = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }),
    };
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
      <Link href={`/counselor/${id}`} style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>
        ← Perfil
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 6 }}>
        {counselor?.nombre ?? "Agenda"}
      </h1>
      <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", marginBottom: 24 }}>
        Elegí un día para ver los horarios disponibles.
      </p>

      {/* Días */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6, marginBottom: 24 }}>
        {dias.map((d) => (
          <button
            key={d.value}
            onClick={() => { setFecha(d.value); setReservado(false); }}
            className={fecha === d.value ? "btn-primary" : "btn-ghost"}
            style={{ padding: "10px 6px", fontSize: 11, textTransform: "capitalize", lineHeight: 1.3 }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Slots */}
      {fecha && (
        <>
          <h2 style={{ fontSize: 13, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </h2>

          {loading && <span className="spinner" style={{ display: "block", margin: "20px auto" }} />}

          {error && <p style={{ fontSize: 13, color: "var(--nv-state-error)" }}>{error}</p>}

          {!loading && !error && slots.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)", textAlign: "center", padding: "20px 0" }}>
              No hay horarios disponibles para este día.
            </p>
          )}

          {!loading && slots.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {slots.map((h) => (
                <Link
                  key={h}
                  href={`/reservar/${id}?fecha=${fecha}&hora=${h}`}
                  className="btn-ghost"
                  style={{
                    textAlign: "center",
                    padding: "12px 0",
                    fontSize: 13,
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {h}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {reservado && (
        <div className="card" style={{ padding: 20, textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 20, marginBottom: 8 }}>🌿</p>
          <p style={{ fontSize: 14, color: "var(--nv-text-primary)" }}>Redirigiendo a la reserva...</p>
        </div>
      )}
    </div>
  );
}
