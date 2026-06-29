"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Stars from "@/components/ui/Stars";

interface ProfileData {
  nombre: string;
  email: string;
  bio: string | null;
  enfoque: string | null;
  especialidades: string[];
  modalidad: string | null;
  provincia: string | null;
  experiencia_anios: number | null;
  promedio_estrellas: number;
  total_sesiones: number;
  aac_verificado: boolean;
}

interface Publicacion {
  id: string;
  contenido: string;
  created_at: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: c } = await supabase
        .from("counselors")
        .select("bio, enfoque, especialidades, modalidad, provincia, experiencia_anios, promedio_estrellas, total_sesiones, aac_verificado, users!inner(nombre, email)")
        .eq("id", user.id)
        .single();

      if (c) {
        const u = c.users as unknown as { nombre: string; email: string };
        setProfile({
          nombre: u.nombre ?? "Sin nombre",
          email: u.email ?? "",
          bio: c.bio,
          enfoque: c.enfoque,
          especialidades: c.especialidades ?? [],
          modalidad: c.modalidad,
          provincia: c.provincia,
          experiencia_anios: c.experiencia_anios,
          promedio_estrellas: c.promedio_estrellas,
          total_sesiones: c.total_sesiones,
          aac_verificado: c.aac_verificado,
        });
      }

      // Publicaciones
      const { data: pubs } = await supabase
        .from("publicaciones")
        .select("id, contenido, created_at")
        .eq("counselor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setPublicaciones(pubs ?? []);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  const iniciales = profile?.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", paddingBottom: 80, fontFamily: "var(--nv-font-body)" }}>
      {/* HEADER */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "14px 18px",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--nv-accent)", textTransform: "uppercase", margin: 0 }}>
          Mi Perfil
        </h1>
      </div>

      {/* PROFILE CARD */}
      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div className="card" style={{ padding: 24, textAlign: "center", marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(145deg, #c8dccf 0%, #a8c9b0 40%, #8db89a 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            fontSize: 28, fontWeight: 700, color: "#fff",
            fontFamily: "var(--nv-font-display)",
            textShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}>
            {iniciales}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--nv-text-primary)", margin: "0 0 2px" }}>
            Clr. {profile?.nombre}
          </h2>

          <div style={{ marginBottom: 8 }}>
            <Stars rating={profile?.promedio_estrellas ?? 0} size="md" />
          </div>

          {profile?.bio && (
            <p style={{ fontSize: 13, color: "var(--nv-text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{profile?.total_sesiones ?? 0}</div>
              <div style={{ fontSize: 10, color: "var(--nv-text-muted)" }}>Sesiones</div>
            </div>
            <div style={{ width: 1, background: "var(--nv-border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{profile?.experiencia_anios ?? "—"}</div>
              <div style={{ fontSize: 10, color: "var(--nv-text-muted)" }}>Años exp.</div>
            </div>
            <div style={{ width: 1, background: "var(--nv-border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontFamily: "var(--nv-font-display)", color: "var(--nv-accent)" }}>{profile?.aac_verificado ? "✓" : "—"}</div>
              <div style={{ fontSize: 10, color: "var(--nv-text-muted)" }}>AAC</div>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginBottom: 16 }}>
            {profile?.especialidades.map(t => (
              <span key={t} style={{
                fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                padding: "3px 10px", borderRadius: 999,
                color: "var(--nv-text-secondary)",
                background: "rgba(0,0,0,0.04)",
                textTransform: "uppercase",
              }}>{t}</span>
            ))}
          </div>

          <Link href="/panel/perfil/editar" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", padding: "10px 28px", fontSize: 12 }}>
            Editar perfil
          </Link>
        </div>

        {/* PUBLICACIONES */}
        <h3 style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--nv-accent)",
          textTransform: "uppercase", marginBottom: 12, paddingLeft: 4,
        }}>
          Publicaciones
        </h3>

        {publicaciones.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginBottom: 12 }}>Todavía no hiciste publicaciones.</p>
            <Link href="/panel/perfil/editar" style={{ fontSize: 12, fontWeight: 600, color: "var(--nv-accent)" }}>
              Crear primera publicación →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {publicaciones.map(p => (
              <div key={p.id} className="card" style={{ padding: 16 }}>
                <p style={{ fontSize: 13, color: "var(--nv-text-primary)", lineHeight: 1.6, margin: 0 }}>{p.contenido}</p>
                <p style={{ fontSize: 10, color: "var(--nv-text-muted)", marginTop: 8 }}>
                  {new Date(p.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
