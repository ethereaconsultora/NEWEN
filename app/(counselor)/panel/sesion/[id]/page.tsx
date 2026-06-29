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
 * Pantalla de sesión para el counselor.
 * Igual que la del consultante pero con botón de "Finalizar sesión".
 */
export default function SesionCounselorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("sesiones")
        .select("daily_room_url, estado")
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

      if (data.estado === "confirmada") {
        await supabase
          .from("sesiones")
          .update({ estado: "en_curso" })
          .eq("id", id);
      }

      setLoading(false);
    }

    load();
  }, [id, supabase]);

  const handleFinalizar = async () => {
    setFinalizando(true);
    await supabase
      .from("sesiones")
      .update({ estado: "finalizada" })
      .eq("id", id);
    router.push("/panel");
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
        <span className="spinner" style={{ borderTopColor: "#7dba8f" }} />
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
            href="/panel"
            style={{
              fontSize: 14,
              color: "var(--nv-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Volver al Panel
          </Link>
        </div>
      </div>
    );
  }

  if (!roomUrl) return null;

  return (
    <VideoRoom
      roomUrl={roomUrl}
      onLeave={finalizando ? undefined : undefined}
    />
  );
}
