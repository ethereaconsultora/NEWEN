"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * "Ojo" de vista clientes: flota sobre la página pública /e/[slug] y solo
 * aparece cuando el usuario actual es dueño/miembro de esa organización.
 * Click → vuelve al espacio empresa (/empresa). Los visitantes no lo ven.
 */
export default function OjoVistaEmpresa({ slug }: { slug: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/organizations/mine");
        const data = await res.json();
        if (data.org?.slug === slug) setVisible(true);
      } catch {
        // Sin sesión o sin membresía → no mostrar
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!visible) return null;

  return (
    <button
      onClick={() => router.push("/empresa")}
      title="Activá/desactivá el ojo para volver a tu espacio empresa"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        gap: 9,
        background: "#17130f",
        color: "#c4a87e",
        border: "1px solid #c4a87e",
        borderRadius: 999,
        padding: "11px 18px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        fontFamily: "inherit",
        letterSpacing: 0.2,
      }}
    >
      <span style={{ fontSize: 15 }}>👁</span> Vista clientes · volver a mi espacio
    </button>
  );
}
