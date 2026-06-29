import Link from "next/link";

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* BottomNav counselor */}
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
          padding: "8px 0 12px",
          zIndex: 50,
        }}
      >
        <Link href="/panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, color: "var(--nv-text-muted)", fontWeight: 500 }}>
          <span style={{ fontSize: 18 }}>📊</span> Panel
        </Link>
        <Link href="/panel/agenda" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, color: "var(--nv-text-muted)", fontWeight: 500 }}>
          <span style={{ fontSize: 18 }}>📅</span> Agenda
        </Link>
        <Link href="/panel/perfil" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", fontSize: 10, color: "var(--nv-text-muted)", fontWeight: 500 }}>
          <span style={{ fontSize: 18 }}>👤</span> Perfil
        </Link>
      </nav>
    </>
  );
}
