"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoLogout } from "@/hooks/useAutoLogout";

const TABS = [
  { href: "/admin", label: "Panel", icon: "dashboard" },
  { href: "/admin/postulaciones", label: "Postul.", icon: "clipboard" },
  { href: "/admin/counselors", label: "Counsel.", icon: "users" },
];

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "var(--nv-accent)" : "rgba(28,18,8,0.35)";
  switch (name) {
    case "dashboard":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "clipboard":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
    case "users":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  useAutoLogout();

  return (
    <>
      {children}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFFFFF", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-around", padding: "6px 0 10px", zIndex: 50, fontFamily: "var(--nv-font-body)" }}>
        {TABS.map(t => {
          const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, fontWeight: active ? 600 : 500, color: active ? "var(--nv-accent)" : "rgba(28,18,8,0.35)", minWidth: 60 }}>
              <Icon name={t.icon} active={active} />{t.label}
              {active && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--nv-accent)", marginTop: -2 }} />}
            </Link>
          );
        })}
        <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 500, color: "rgba(28,18,8,0.35)", minWidth: 60, fontFamily: "var(--nv-font-body)", padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(28,18,8,0.35)" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Salir
        </button>
      </nav>
    </>
  );
}
