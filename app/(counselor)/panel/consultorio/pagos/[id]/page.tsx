import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../../pages.module.css";
import MarcarPagadoButton from "./MarcarPagadoButton";

export default async function PagoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const { data: pago } = await supabase
    .from("pagos")
    .select("*,pacientes(id,nombre)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!pago) notFound();

  return (
    <div>
      <div className={styles.pageHead} style={{ marginBottom: 12 }}>
        <Link href="/panel/consultorio/pagos" className="btn-ghost" style={{ display: "inline-flex" }}>
          ← Volver
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--nv-font-display)", fontSize: 30, color: "var(--nv-accent)", marginBottom: 4 }}>
          ${Number(pago.monto).toLocaleString("es-AR")}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{pago.pacientes?.nombre ?? "—"}</div>
        {pago.descripcion && (
          <div style={{ fontSize: 13, color: "var(--nv-text-secondary)", marginBottom: 8 }}>{pago.descripcion}</div>
        )}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className={pago.estado === "pagado" ? styles.badgeOk : styles.badgeWarn}>{pago.estado}</span>
          {pago.fecha && (
            <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>
              {new Date(pago.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {pago.estado === "pendiente" && <MarcarPagadoButton pagoId={id} />}

      {pago.pacientes?.id && (
        <div style={{ marginTop: 12 }}>
          <Link
            href={`/panel/consultorio/pacientes/${pago.pacientes.id}`}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", display: "inline-flex" }}
          >
            Ver ficha del paciente
          </Link>
        </div>
      )}
    </div>
  );
}
