"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import VideoRoom from "@/components/sesion/VideoRoom";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Pantalla de sesión para el consultante.
 * Muestra la videollamada de Daily.co.
 */
export default function SesionConsultantePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("sesiones")
        .select("daily_room_url, estado, fecha_hora")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Sesión no encontrada.");
        setLoading(false);
        return;
      }

      if (!data.daily_room_url) {
        setError("La sala de videollamada aún no está disponible.");
        setLoading(false);
        return;
      }

      setRoomUrl(data.daily_room_url);

      // Si la sesión está confirmada, marcar como en curso
      if (data.estado === "confirmada") {
        await supabase
          .from("sesiones")
          .update({ estado: "en_curso" })
          .eq("id", id);
      }

      setActive(true);
      setLoading(false);
    }

    load();
  }, [id, supabase]);

  const handleLeave = () => {
    router.push("/mi-cuenta");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="spinner" style={{ borderTopColor: "var(--nv-accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--nv-bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🌿</p>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "var(--nv-font-display)",
              color: "var(--nv-text-primary)",
              marginBottom: 8,
            }}
          >
            {error}
          </h2>
          <Link
            href="/mi-cuenta"
            style={{
              fontSize: 14,
              color: "var(--nv-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Volver a Mi Cuenta
          </Link>
        </div>
      </div>
    );
  }

  if (!roomUrl) return null;

  return <VideoRoom roomUrl={roomUrl} onLeave={handleLeave} />;
}
