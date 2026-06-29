"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/panel", label: "Perfil", icon: "user" },
  { href: "/panel/notificaciones", label: "Notif.", icon: "bell" },
  { href: "/panel/agenda", label: "Agenda", icon: "calendar" },
  { href: "/panel/muro", label: "Muro", icon: "users" },
];

function Icon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "var(--nv-accent)" : "rgba(28,18,8,0.35)";
  const stroke = active ? "var(--nv-accent)" : "rgba(28,18,8,0.35)";

  switch (name) {
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
    case "calendar":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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
    default:
      return null;
  }
}

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {children}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#FFFFFF",
          borderTop: "1px solid rgba(0,0,0,0.06)",
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
                color: active ? "var(--nv-accent)" : "rgba(28,18,8,0.35)",
                minWidth: 60,
              }}
            >
              <Icon name={tab.icon} active={active} />
              {tab.label}
              {active && (
                <span style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: "var(--nv-accent)", marginTop: -2,
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
