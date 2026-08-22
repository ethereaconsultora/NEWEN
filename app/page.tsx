"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoNewen from "@/components/LogoNewen";

type Access = { counselor: boolean; admin: boolean; empresa: boolean };

function AreaIcon({ name }: { name: "user" | "building" }) {
  const p = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "user")
    return (
      <svg {...p}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  return (
    <svg {...p}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

const AREAS: { key: keyof Access; label: string; desc: string; href: string; iconKey: "user" | "building" }[] = [
  { key: "counselor", label: "Profesional", desc: "Panel del counselor · consultorio, agenda y comunidad", href: "/panel", iconKey: "user" },
  { key: "empresa", label: "Empresa", desc: "Espacio comercial multicliente de tu organización", href: "/empresa", iconKey: "building" },
];

export default function HomePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);
  const [access, setAccess] = useState<Access>({ counselor: false, admin: false, empresa: false });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
        color: "var(--nv-text-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "var(--nv-font-body)",
      }}
    >
      {/* Marca */}
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <LogoNewen height={64} />
        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.28em",
            color: "var(--nv-text-muted)",
            textTransform: "uppercase",
          }}
        >
          Acceso por área
        </div>
        <div
          style={{
            width: 48,
            height: 1,
            background: "var(--nv-border-strong)",
            margin: "18px auto 0",
          }}
        />
      </div>

      {/* Áreas */}
      {loading ? (
        <span className="spinner" />
      ) : (
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
          {AREAS.map((a) => {
            const enabled = access[a.key];
            const clickable = !logged || enabled;
            const href = logged ? (enabled ? a.href : null) : `/auth/login?redirect=${encodeURIComponent(a.href)}`;

            const inner = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: "20px 22px",
                  borderRadius: "var(--nv-radius-lg)",
                  background: "var(--nv-bg-card)",
                  border: enabled ? "1px solid var(--nv-accent)" : "1px solid var(--nv-border)",
                  color: "var(--nv-text-primary)",
                  opacity: clickable ? 1 : 0.45,
                  transition: "border-color .15s, transform .15s",
                }}
              >
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: enabled ? "var(--nv-accent)" : "var(--nv-accent-soft, rgba(196,168,126,0.12))",
                    color: enabled ? "#fff" : "var(--nv-accent)",
                    flexShrink: 0,
                  }}
                >
                  <AreaIcon name={a.iconKey} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      color: enabled ? "var(--nv-text-primary)" : "var(--nv-text-secondary)",
                    }}
                  >
                    {a.label}
                    {logged && !enabled && (
                      <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 8, color: "var(--nv-text-muted)" }}>
                        · sin acceso
                      </span>
                    )}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--nv-text-secondary)", marginTop: 3 }}>
                    {a.desc}
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: enabled ? "var(--nv-accent)" : "var(--nv-text-muted)", flexShrink: 0 }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
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

      {/* Consultante */}
      <div style={{ marginTop: 30, textAlign: "center" }}>
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
