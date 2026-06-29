"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluarPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [sesion, setSesion] = useState<{
    counselorNombre: string;
    fecha_hora: string;
    estado: string;
  } | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const [hoverEstrellas, setHoverEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    async function load() {
      // Cargar sesión
      const { data: s, error: sErr } = await supabase
        .from("sesiones")
        .select("fecha_hora, estado, counselor:counselor_id(users(nombre))")
        .eq("id", id)
        .single();

      if (sErr || !s) {
        setError("Sesión no encontrada.");
        setLoading(false);
        return;
      }

      const counselorData = s.counselor as unknown as { users: { nombre: string }[] } | null;
      const counselorNombre = counselorData?.users?.[0]?.nombre ?? "Counselor";

      setSesion({
        counselorNombre,
        fecha_hora: s.fecha_hora,
        estado: s.estado,
      });

      // Verificar si ya evaluó
      const { data: evalData } = await supabase
        .from("evaluaciones")
        .select("estrellas, comentario")
        .eq("sesion_id", id)
        .maybeSingle();

      if (evalData) {
        setEstrellas(evalData.estrellas);
        setComentario(evalData.comentario ?? "");
        setModoEdicion(true);
      }

      setLoading(false);
    }
    load();
  }, [id, supabase]);

  const handleEnviar = async () => {
    if (estrellas === 0) {
      setError("Seleccioná al menos 1 estrella.");
      return;
    }

    setEnviando(true);
    setError("");

    const method = modoEdicion ? "PUT" : "POST";
    const res = await fetch("/api/evaluaciones", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sesion_id: id,
        estrellas,
        comentario: comentario || undefined,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setExito(true);
      if (!modoEdicion) setModoEdicion(true);
    } else {
      setError(data.error ?? "Error al enviar.");
    }
    setEnviando(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (error && !sesion) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🌿</p>
          <h2 style={{ fontSize: 20, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>{error}</h2>
          <Link href="/mi-cuenta" style={{ fontSize: 14, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500 }}>← Mi Cuenta</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 420, margin: "0 auto" }}>
      <Link href="/mi-cuenta" style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>
        ← Mi Cuenta
      </Link>

      <h1 style={{ fontSize: 26, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 6 }}>
        {modoEdicion ? "Corregir evaluación" : "¿Cómo fue tu sesión?"}
      </h1>
      <p style={{ fontSize: 14, color: "var(--nv-text-secondary)", marginBottom: 24 }}>
        con {sesion?.counselorNombre}
      </p>

      {/* Estrellas */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 40, lineHeight: 1, userSelect: "none" }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setEstrellas(n)}
              onMouseEnter={() => setHoverEstrellas(n)}
              onMouseLeave={() => setHoverEstrellas(0)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color:
                  (hoverEstrellas || estrellas) >= n
                    ? "var(--nv-accent)"
                    : "var(--nv-border)",
                transition: "color 0.15s",
                padding: 0,
                fontSize: 40,
                lineHeight: 1,
              }}
            >
              ★
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginTop: 8 }}>
          {estrellas === 0 ? "Tocá una estrella" : estrellas === 5 ? "¡Excelente!" : estrellas === 4 ? "Muy bien" : estrellas === 3 ? "Bien" : estrellas === 2 ? "Regular" : "No me gustó"}
        </p>
      </div>

      {/* Comentario */}
      <div style={{ marginBottom: 24 }}>
        <label className="label" htmlFor="comentario">
          {modoEdicion ? "Tu reseña (podés corregirla)" : "Reseña (opcional)"}
        </label>
        <textarea
          id="comentario"
          className="input"
          rows={4}
          placeholder="Contanos brevemente cómo te sentiste en la sesión..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          style={{ resize: "vertical", fontFamily: "var(--nv-font-body)", lineHeight: 1.6 }}
        />
      </div>

      {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}

      {exito && (
        <div
          style={{
            background: "var(--nv-accent-soft)",
            border: "1px solid var(--nv-accent-border)",
            borderRadius: "var(--nv-radius-md)",
            padding: "12px 14px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--nv-accent)", fontWeight: 500 }}>
            {modoEdicion ? "✅ Evaluación actualizada." : "✅ ¡Gracias por evaluar!"}
          </p>
          <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 4 }}>
            {modoEdicion ? "Podés seguir corrigiéndola cuando quieras." : "Podés corregirla después desde Mi Cuenta."}
          </p>
        </div>
      )}

      <button onClick={handleEnviar} className="btn-primary" disabled={enviando || estrellas === 0} style={{ width: "100%", marginBottom: 16 }}>
        {enviando ? "Enviando..." : modoEdicion ? "Actualizar evaluación" : "Enviar evaluación"}
      </button>

      <Link
        href="/mi-cuenta"
        className="btn-ghost"
        style={{ width: "100%", textAlign: "center", display: "block", textDecoration: "none" }}
      >
        Volver a Mi Cuenta
      </Link>
    </div>
  );
}
