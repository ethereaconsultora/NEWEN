"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./consultorio.module.css";

const ITEMS = [
  { href: "/panel/consultorio", label: "Inicio", icon: "home" },
  { href: "/panel/consultorio/pacientes", label: "Pacientes", icon: "users" },
  { href: "/panel/consultorio/agenda", label: "Agenda", icon: "calendar" },
  { href: "/panel/consultorio/calendario", label: "Calendario", icon: "grid" },
  { href: "/panel/consultorio/pagos", label: "Pagos", icon: "dollar" },
  { href: "/panel/consultorio/resumen", label: "Resumen", icon: "chart" },
  { href: "/panel/consultorio/ajustes", label: "Ajustes", icon: "gear" },
];

function Icon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "rgba(28,18,8,0.5)",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return <svg {...common}><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></svg>;
    case "users":
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "grid":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="4" x2="9" y2="9" /><line x1="15" y1="4" x2="15" y2="9" /></svg>;
    case "dollar":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15.5 9.5c-.5-1-1.5-1.5-3-1.5-2 0-3.5 1-3.5 2.5s1.5 2 3.5 2.5 3.5 1.5 3.5 3-1.5 2.5-3.5 2.5c-1.5 0-2.5-.5-3-1.5" /></svg>;
    case "chart":
      return <svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "gear":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" /></svg>;
    default:
      return null;
  }
}

function isActivePath(pathname: string, href: string) {
  return href === "/panel/consultorio" ? pathname === href : pathname.startsWith(href);
}

export function ConsultorioChips() {
  const pathname = usePathname();
  return (
    <div className={styles.chips}>
      {ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.chip}${active ? ` ${styles.chipActive}` : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function ConsultorioNav() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandName}>
          newen<span>.</span>
        </div>
        <div className={styles.brandSub}>Mi consultorio</div>
      </div>

      <div className={styles.navLabel}>Consultorio</div>
      {ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem}${active ? ` ${styles.navItemActive}` : ""}`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        );
      })}

      <div className={styles.sidebarFoot}>
        <strong>Anexo integrado</strong>
        Anima · Gestión clínica dentro de newen.
      </div>
    </aside>
  );
}
