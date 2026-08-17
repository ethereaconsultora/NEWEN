"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Switch de rol en la barra inferior: prende perfil profesional o admin.
 * El lado activo se resalta según la ruta actual.
 */
export default function RoleSwitch({
  compact = false,
  isEmpresa = false,
}: {
  compact?: boolean;
  isEmpresa?: boolean;
}) {
  const pathname = usePathname();
  const esAdmin = pathname.startsWith("/admin");
  const esEmpresa = pathname.startsWith("/empresa");

  const seg = (active: boolean) => ({
    padding: compact ? "5px 10px" : "7px 14px",
    borderRadius: 999,
    fontSize: compact ? 10 : 11,
    fontWeight: active ? 700 : 500,
    textAlign: "center" as const,
    textDecoration: "none",
    lineHeight: 1.2,
    background: active ? "var(--nv-accent)" : "transparent",
    color: active ? "#fff" : "var(--nv-text-muted)",
    transition: "all .15s",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div
      style={{
        display: "flex",
        alignSelf: "center",
        background: "var(--nv-bg-input)",
        borderRadius: 999,
        padding: 3,
        gap: 3,
        border: "1px solid var(--nv-border)",
        flexShrink: 0,
      }}
    >
      <Link href="/panel" style={seg(!esAdmin && !esEmpresa)}>
        {compact ? "Prof." : "Profesional"}
      </Link>
      {isEmpresa && (
        <Link href="/empresa" style={seg(esEmpresa)}>
          {compact ? "Empr." : "Empresa"}
        </Link>
      )}
      <Link href="/admin" style={seg(esAdmin)}>
        Admin
      </Link>
    </div>
  );
}
