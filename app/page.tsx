"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Access = { counselor: boolean; admin: boolean; empresa: boolean };

const AREAS: { key: keyof Access; label: string; desc: string; href: string; icon: string }[] = [
  {
    key: "counselor",
    label: "PROFESIONAL",
    desc: "Panel del counselor · consultorio, agenda y comunidad",
    href: "/panel",
    icon: "🩺",
  },
  {
    key: "empresa",
    label: "EMPRESA",
    desc: "Espacio comercial multicliente de tu organización",
    href: "/empresa",
    icon: "🏛️",
  },
];

export default function HomePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);
  const [access, setAccess] = useState<Access>({ counselor: false, admin: false, empresa: false });

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: u } = await supabase.from("users").select("*").eq("id", user.id).single();
      const { data: memb } = await supabase
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      setLogged(true);
      setAccess({
        counselor: u?.rol === "counselor",
        admin: u?.es_admin === true || u?.rol === "admin",
        empresa: u?.rol === "empresa" || (Array.isArray(memb) && memb.length > 0),
      });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px 56px",
        fontFamily: "var(--nv-font-body)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 400,
            fontFamily: "var(--nv-font-display)",
            color: "var(--nv-text-primary)",
            letterSpacing: -1,
            margin: "0 0 6px",
            lineHeight: 1,
          }}
        >
          Newen
        </h1>
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.26em",
            color: "var(--nv-accent)",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          ¿A qué área querés entrar?
        </p>
      </div>

      {/* Áreas */}
      {loading ? (
        <span className="spinner" />
      ) : (
        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
          {AREAS.map((a) => {
            const enabled = access[a.key];
            const clickable = !logged || enabled;
            const href = logged
              ? enabled
                ? a.href
                : null
              : `/auth/login?redirect=${encodeURIComponent(a.href)}`;

            const inner = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  padding: "18px 20px",
                  borderRadius: "var(--nv-radius-lg)",
                  background: enabled ? "var(--nv-accent)" : "var(--nv-bg-card)",
                  border: enabled ? "1.5px solid var(--nv-accent)" : "1px solid var(--nv-border)",
                  color: enabled ? "#fff" : "var(--nv-text-primary)",
                  opacity: clickable ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: 26 }}>{a.icon}</span>
                <span style={{ flex: 1 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {a.label}
                    {logged && !enabled && (
                      <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 8, opacity: 0.7 }}>
                        · sin acceso
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12.5,
                      opacity: 0.8,
                      marginTop: 2,
                      fontWeight: 400,
                    }}
                  >
                    {a.desc}
                  </span>
                </span>
                <span style={{ fontSize: 18 }}>→</span>
              </div>
            );

            return clickable && href ? (
              <Link key={a.key} href={href} style={{ textDecoration: "none" }}>
                {inner}
              </Link>
            ) : (
              <div key={a.key}>{inner}</div>
            );
          })}
        </div>
      )}

      {/* Acceso consultante */}
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <Link
          href="/buscar"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--nv-accent)",
            textDecoration: "none",
          }}
        >
          ¿Buscás acompañamiento? Explorá counselors →
        </Link>
      </div>

      {!loading && !logged && (
        <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginTop: 18, textAlign: "center" }}>
          Al tocar un área te va a pedir iniciar sesión y te lleva directo a esa sección.
        </p>
      )}
    </div>
  );
}
