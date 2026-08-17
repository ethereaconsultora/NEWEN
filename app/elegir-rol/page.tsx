"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoLogout } from "@/hooks/useAutoLogout";

export default function ElegirRolPage() {
  const router = useRouter();
  const supabase = createClient();
  useAutoLogout();

  const [estado, setEstado] = useState<"cargando" | "dual" | "redirigiendo">("cargando");
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: u } = await supabase.from("users").select("*").eq("id", user.id).single();

      const isAdmin = u?.es_admin === true || u?.rol === "admin";
      const isCounselor = u?.rol === "counselor";

      setNombre(u?.nombre?.split(" ")[0] ?? "");

      if (isAdmin && isCounselor) {
        setEstado("dual");
      } else if (isAdmin) {
        router.replace("/admin");
      } else if (isCounselor) {
        router.replace("/panel");
      } else {
        router.replace("/");
      }
    })();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--nv-font-body)",
      }}
    >
      {estado === "cargando" && <span className="spinner" />}

      {estado === "dual" && (
        <div
          style={{
            background: "var(--nv-bg-card)",
            borderRadius: "var(--nv-radius-xl)",
            padding: 32,
            width: "100%",
            maxWidth: 420,
            boxShadow: "var(--nv-shadow)",
            border: "1px solid var(--nv-border)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--nv-accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--nv-font-display)",
              fontSize: 26,
              margin: "0 auto 16px",
              boxShadow: "0 4px 14px rgba(27,67,50,0.3)",
            }}
          >
            n.
          </div>

          <h1 style={{ fontFamily: "var(--nv-font-display)", fontSize: 24, marginBottom: 4 }}>
            {nombre ? `Hola, ${nombre}` : "Hola"}
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--nv-text-secondary)", marginBottom: 24 }}>
            Tu cuenta tiene doble acceso. ¿Cómo querés continuar?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => router.push("/panel")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                textAlign: "left",
                background: "var(--nv-accent)",
                color: "#fff",
                border: "1.5px solid rgba(27,67,50,0.35)",
                borderRadius: "var(--nv-radius-lg)",
                padding: 18,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "var(--nv-font-body)",
                boxShadow: "0 2px 14px rgba(27,67,50,0.28)",
              }}
            >
              <span style={{ fontSize: 24 }}>🌿</span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>Panel profesional</span>
                <span style={{ display: "block", fontSize: 12.5, opacity: 0.85 }}>
                  Mi consultorio, agenda y pacientes
                </span>
              </span>
            </button>

            <button
              onClick={() => router.push("/admin")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                textAlign: "left",
                background: "var(--nv-bg-card)",
                color: "var(--nv-accent)",
                border: "1.5px solid var(--nv-accent)",
                borderRadius: "var(--nv-radius-lg)",
                padding: 18,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "var(--nv-font-body)",
              }}
            >
              <span style={{ fontSize: 24 }}>🗂</span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>Panel admin</span>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--nv-text-secondary)" }}>
                  Counselors, postulaciones y métricas
                </span>
              </span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: 20,
              background: "none",
              border: "none",
              color: "var(--nv-text-muted)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "var(--nv-font-body)",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
