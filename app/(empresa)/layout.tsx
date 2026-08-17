"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import styles from "./empresa.module.css";

const TABS = [
  { href: "/empresa", label: "Workspace", icon: "🏛️" },
  { href: "/empresa/campus", label: "Campus", icon: "🎓" },
];

/**
 * Shell del área Empresa (espacio comercial multicliente).
 * Estética propia (oscura/dorada), separada de los shells counselor/admin.
 */
export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useAutoLogout();

  return (
    <>
      <div className={styles.root}>{children}</div>
      <nav className={styles.nav}>
        {TABS.map((t) => {
          const active =
            t.href === "/empresa" ? pathname === "/empresa" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`${styles.navItem}${active ? ` ${styles.navItemActive}` : ""}`}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
        <button
          className={styles.navItem}
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/auth/login");
          }}
        >
          <span className={styles.navIcon}>↩</span>
          Salir
        </button>
      </nav>
    </>
  );
}
