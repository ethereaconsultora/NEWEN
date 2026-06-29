"use client";

import Link from "next/link";

export default function EmpresasPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--nv-bg-base)", padding: "24px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
      <Link href="/admin" style={{ fontSize: 13, color: "var(--nv-accent)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 24 }}>← Admin</Link>

      <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 24 }}>Empresas</h1>

      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🏢</p>
        <p style={{ fontSize: 14, color: "var(--nv-text-secondary)", lineHeight: 1.6 }}>
          Gestión de empresas y planes corporativos.<br />
          Disponible en la próxima versión.
        </p>
      </div>
    </div>
  );
}
