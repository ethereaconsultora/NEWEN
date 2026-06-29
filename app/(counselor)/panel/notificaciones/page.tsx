"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Notif {
  id: string;
  tipo: "nueva_sesion" | "cancelacion" | "reprogramacion" | "recordatorio";
  mensaje: string;
  fecha: string;
  sesion_id?: string;
  leida: boolean;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // Cargar sesiones recientes como notificaciones
      const { data: sesiones } = await supabase
        .from("sesiones")
        .select("id, fecha_hora, estado, consultante:consultante_id(nombre), created_at")
        .eq("counselor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);

      const items: Notif[] = (sesiones ?? []).map((s: Record<string, unknown>) => {
        const estado = s.estado as string;
        const consultanteNombre = (s.consultante as unknown as { nombre: string } | null)?.nombre ?? "Consultante";
        const tipo = estado === "confirmada" ? "nueva_sesion"
          : estado === "cancelada" ? "cancelacion"
          : estado === "reprogramada" ? "reprogramacion"
          : "recordatorio";

        const mensaje = estado === "confirmada"
          ? `${consultanteNombre} reservó una sesión`
          : estado === "cancelada"
          ? `${consultanteNombre} canceló su sesión`
          : `${consultanteNombre} — sesión ${estado}`;

        return {
          id: s.id as string,
          tipo: tipo as Notif["tipo"],
          mensaje,
          fecha: s.created_at as string,
          sesion_id: s.id as string,
          leida: false,
        };
      });

      setNotifs(items);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const iconFor = (tipo: Notif["tipo"]) => {
    switch (tipo) {
      case "nueva_sesion": return "🟢";
      case "cancelacion": return "🔴";
      case "reprogramacion": return "🔄";
      case "recordatorio": return "⏰";
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      {/* HEADER */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "14px 18px",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#6aa87c", textTransform: "uppercase", margin: 0 }}>
          Notificaciones
        </h1>
      </div>

      <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>
        {notifs.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔔</p>
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>No tenés notificaciones todavía.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifs.map(n => (
              <Link
                key={n.id}
                href={n.sesion_id ? `/panel/sesion/${n.sesion_id}` : "#"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card" style={{
                  padding: 14,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{iconFor(n.tipo)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--nv-text-primary)", margin: 0, lineHeight: 1.5 }}>{n.mensaje}</p>
                    <p style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 4 }}>
                      {new Date(n.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
