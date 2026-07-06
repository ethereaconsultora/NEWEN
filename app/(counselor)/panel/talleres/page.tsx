"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Taller {
  id: string;
  titulo: string;
  descripcion: string;
  precio_usd: number;
  gratuito: boolean;
  modalidad: string;
  fecha_hora: string | null;
  estado: string;
  created_at: string;
}

export default function TalleresListPage() {
  const router = useRouter();
  const supabase = createClient();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("talleres")
        .select("*")
        .eq("counselor_id", user.id)
        .order("created_at", { ascending: false });

      setTalleres(data ?? []);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const eliminar = async (id: string) => {
    await supabase.from("talleres").delete().eq("id", id);
    setTalleres(talleres.filter(t => t.id !== id));
  };

  const publicar = async (id: string) => {
    await supabase.from("talleres").update({ estado: "publicado" }).eq("id", id);
    setTalleres(talleres.map(t => t.id === id ? { ...t, estado: "publicado" } : t));
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>Talleres</h1>
        <Link href="/panel/talleres/crear" className="btn-primary" style={{ textDecoration: "none", padding: "6px 14px", fontSize: 11 }}>+ Nuevo</Link>
      </div>

      <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>
        {talleres.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🎓</p>
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginBottom: 14 }}>No tenés talleres todavía.</p>
            <Link href="/panel/talleres/crear" className="btn-primary" style={{ textDecoration: "none", padding: "8px 20px", fontSize: 11 }}>
              Crear primer taller
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {talleres.map(t => (
              <div key={t.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 4px" }}>🎓 {t.titulo}</h3>
                    <p style={{ fontSize: 11, color: "var(--nv-text-muted)", margin: "0 0 6px" }}>
                      {t.modalidad === "grabado" ? "📹 Grabado" : "🔴 En vivo"}
                      {t.fecha_hora && ` · ${new Date(t.fecha_hora).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                      {" · "}{t.gratuito ? "Gratuito" : `$${t.precio_usd} USD`}
                    </p>
                    <span className="badge" style={{
                      background: t.estado === "publicado" ? "rgba(27,67,50,0.08)" : "rgba(0,0,0,0.04)",
                      color: t.estado === "publicado" ? "var(--nv-accent)" : "var(--nv-text-muted)",
                      border: "none",
                    }}>{t.estado === "publicado" ? "Publicado" : "Borrador"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link href={`/panel/talleres/crear?id=${t.id}`}
                    className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "8px 0", textAlign: "center", textDecoration: "none" }}>
                    Editar
                  </Link>
                  {t.estado !== "publicado" && (
                    <button onClick={() => publicar(t.id)}
                      className="btn-primary" style={{ flex: 1, fontSize: 11, padding: "8px 0" }}>
                      Publicar
                    </button>
                  )}
                  <button onClick={() => eliminar(t.id)}
                    style={{ background: "none", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, color: "var(--nv-state-error)", cursor: "pointer", fontSize: 11, padding: "8px 12px" }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
