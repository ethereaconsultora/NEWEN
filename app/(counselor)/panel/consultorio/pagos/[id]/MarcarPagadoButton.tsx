"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarcarPagadoButton({ pagoId }: { pagoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase
      .from("pagos")
      .update({ estado: "pagado", fecha_pago: new Date().toISOString().split("T")[0] })
      .eq("id", pagoId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
      {loading ? "Procesando…" : "✓ Marcar como pagado"}
    </button>
  );
}
