"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import { useEsMultiRol } from "@/hooks/useEsMultiRol";
import RoleSwitch from "@/components/RoleSwitch";
import ThemeProvider from "@/components/consultorio/ThemeProvider";

const DEFAULT_PREFS = { themeId: "newen", fontId: "newen", sizeId: "mediana" };

const TABS = [
  { href: "/panel/consultorio", label: "Consultorio", icon: "consultorio" },
  { href: "/panel", label: "Perfil", icon: "user" },
  { href: "/panel/notificaciones", label: "Notif.", icon: "bell" },
  { href: "/panel/muro", label: "Muro", icon: "users" },
  { href: "/panel/talleres", label: "Talleres", icon: "workshop" },
  { href: "/panel/apariencia", label: "Apariencia", icon: "palette" },
];

function Icon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "var(--nv-accent)" : "var(--nv-text-muted)";
  const stroke = active ? "var(--nv-accent)" : "var(--nv-text-muted)";

  switch (name) {
    case "consultorio":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "user":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "bell":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "users":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "workshop":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case "palette":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a10 10 0 1 1 10-10c0 2-1 3-2.5 3-1.5 0-2-1-3-1.5-.8-.4-1.5-.5-2.5-.5a4 4 0 0 0 0 8c1 0 1 .4 0 1z" />
          <circle cx="7.5" cy="11.5" r="1" /><circle cx="10.5" cy="7.5" r="1" /><circle cx="15" cy="7.5" r="1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  // Auto-logout después de 10 min de inactividad
  useAutoLogout();
  const { isAdmin, isEmpresa } = useEsMultiRol();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setReady(true);
        return;
      }
      const { data: u } = await supabase
        .from("users")
        .select("theme_id, font_id, font_size")
        .eq("id", user.id)
        .single();
      if (u) {
        setPrefs({
          themeId: u.theme_id ?? "newen",
          fontId: u.font_id ?? "newen",
          sizeId: u.font_size ?? "mediana",
        });
      }
      setReady(true);
    })();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <ThemeProvider initial={prefs}>
      {children}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--nv-bg-card)",
          borderTop: "1px solid var(--nv-border)",
          display: "flex",
          justifyContent: "space-around",
          padding: "6px 0 10px",
          zIndex: 50,
          fontFamily: "var(--nv-font-body)",
        }}
      >
        {TABS.map((tab) => {
          const active = tab.href === "/panel"
            ? pathname === "/panel" || pathname.startsWith("/panel/perfil")
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                textDecoration: "none",
                fontSize: 10,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--nv-accent)" : "var(--nv-text-muted)",
                minWidth: 56,
              }}
            >
              <Icon name={tab.icon} active={active} />
              {tab.label}
              {active && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--nv-accent)", marginTop: -2 }} />
              )}
            </Link>
          );
        })}
        {/* Switch de rol (cuentas con acceso admin y/o empresa) */}
        {(isAdmin || isEmpresa) && <RoleSwitch compact isEmpresa={isEmpresa} />}
        {/* Botón salir */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 500,
            color: "var(--nv-text-muted)",
            minWidth: 56,
            fontFamily: "var(--nv-font-body)",
            padding: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--nv-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Salir
        </button>
      </nav>
    </ThemeProvider>
  );
}
