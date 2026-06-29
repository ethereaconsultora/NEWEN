"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import DolarBadge from "@/components/ui/DolarBadge";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página de reserva de sesión.
 * Muestra calendario simple + slots disponibles.
 * Si no está autenticado, redirige a Magic Link.
 */
export default function ReservarPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { user, loading: userLoading } = useUser();

  const [counselor, setCounselor] = useState<{
    nombre: string;
    modalidad: string | null;
    especialidades: string[];
  } | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [modalidad, setModalidad] = useState<"online" | "presencial">("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "redirecting">("form");

  // Cargar datos del counselor
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/counselors`);
      if (res.ok) {
        const data = await res.json();
        const found = data.find(
          (c: { id: string }) => c.id === id
        );
        if (found) setCounselor(found);
      }
    }
    load();
  }, [id]);

  // Si no está logueado, redirigir a Magic Link
  useEffect(() => {
    if (!userLoading && !user) {
      router.push(
        `/auth/magic-link?redirect=${encodeURIComponent(`/reservar/${id}`)}`
      );
    }
  }, [user, userLoading, router, id]);

  // Generar próximos 7 días
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // desde mañana
    return {
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });

  // Slots horarios
  const horas = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const handleReservar = async () => {
    if (!fecha || !hora) {
      setError("Seleccioná día y horario.");
      return;
    }

    setError("");
    setLoading(true);

    const fechaHora = `${fecha}T${hora}:00-03:00`; // Argentina timezone

    try {
      const res = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselor_id: id,
          fecha_hora: fechaHora,
          modalidad,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al reservar.");
        setLoading(false);
        return;
      }

      setPaymentUrl(data.paymentUrl);
      setStep("redirecting");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  };

  // Redirigir a Mercado Pago
  useEffect(() => {
    if (paymentUrl && step === "redirecting") {
      window.location.href = paymentUrl;
    }
  }, [paymentUrl, step]);

  if (userLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--nv-bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="spinner" />
      </div>
    );
  }

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
      <Link
        href={`/counselor/${id}`}
        style={{
          fontSize: 13,
          color: "var(--nv-accent)",
          textDecoration: "none",
          fontWeight: 500,
          display: "inline-block",
          marginBottom: 24,
        }}
      >
        ← Volver al perfil
      </Link>

      {step === "redirecting" ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 20px" }} />
          <h2
            style={{
              fontSize: 20,
              fontFamily: "var(--nv-font-display)",
              color: "var(--nv-text-primary)",
              marginBottom: 8,
            }}
          >
            Redirigiendo a Mercado Pago...
          </h2>
          <p style={{ fontSize: 13, color: "var(--nv-text-secondary)" }}>
            Vas a pagar $18 USD por tu sesión.
          </p>
        </div>
      ) : (
        <>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 400,
              fontFamily: "var(--nv-font-display)",
              color: "var(--nv-text-primary)",
              marginBottom: 6,
            }}
          >
            Reservar sesión
          </h1>
          {counselor && (
            <p style={{ fontSize: 14, color: "var(--nv-text-secondary)", marginBottom: 24 }}>
              con {counselor.nombre}
            </p>
          )}

          {/* Modalidad */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Modalidad</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["online", "presencial"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModalidad(m as "online" | "presencial")}
                  className={modalidad === m ? "btn-primary" : "btn-ghost"}
                  style={{ padding: "10px 0", fontSize: 13 }}
                >
                  {m === "online" ? "💻 Online" : "🏠 Presencial"}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Día</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                gap: 6,
              }}
            >
              {dias.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => { setFecha(d.value); setHora(""); }}
                  className={fecha === d.value ? "btn-primary" : "btn-ghost"}
                  style={{
                    padding: "8px 6px",
                    fontSize: 11,
                    textTransform: "capitalize",
                    lineHeight: 1.3,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hora */}
          {fecha && (
            <div style={{ marginBottom: 24 }}>
              <label className="label">Horario</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 6,
                }}
              >
                {horas.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={hora === h ? "btn-primary" : "btn-ghost"}
                    style={{ padding: "8px 0", fontSize: 12 }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}

          {/* Resumen + Botón */}
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <p
              style={{
                fontSize: 11,
                color: "var(--nv-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              Total
            </p>
            <div style={{ marginBottom: 16 }}>
              <DolarBadge usd={18} size="md" />
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--nv-text-muted)",
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              50 minutos · {modalidad === "online" ? "Videollamada" : "Presencial"}
              {fecha && hora && (
                <>
                  <br />
                  {new Date(fecha + "T" + hora).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  a las {hora} hs
                </>
              )}
            </p>

            {/* Política de flexibilidad */}
            <div
              style={{
                background: "var(--nv-accent-soft)",
                border: "1px solid var(--nv-accent-border)",
                borderRadius: "var(--nv-radius-md)",
                padding: "12px 14px",
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--nv-text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                💡 <strong style={{ color: "var(--nv-text-primary)" }}>¿Surgió un imprevisto?</strong>
                <br />
                Tenés hasta 24 horas antes de la sesión para reprogramar tu turno sin perder el pago.
              </p>
            </div>

            <button
              onClick={handleReservar}
              className="btn-primary"
              disabled={loading || !fecha || !hora}
              style={{ width: "100%", padding: "14px 0", fontSize: 15 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="spinner" /> Reservando...
                </span>
              ) : (
                "Ir a pagar"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
