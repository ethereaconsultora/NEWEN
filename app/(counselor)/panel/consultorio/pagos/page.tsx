import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../pages.module.css";

export default async function PagosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const [{ data: pendientes }, { data: pagados }] = await Promise.all([
    supabase
      .from("pagos")
      .select("id,monto,fecha,descripcion,pacientes(id,nombre)")
      .eq("estado", "pendiente")
      .order("fecha"),
    supabase
      .from("pagos")
      .select("id,monto,fecha,fecha_pago,descripcion,pacientes(id,nombre)")
      .eq("estado", "pagado")
      .order("fecha", { ascending: false })
      .limit(20),
  ]);

  const totalPendiente = (pendientes ?? []).reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const formatMoneda = (n: number) => "$" + n.toLocaleString("es-AR");

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Pagos</h1>
          <div className={styles.pageSub}>{formatMoneda(totalPendiente)} pendientes de cobro</div>
        </div>
        <Link href="/panel/consultorio/pagos/nuevo" className="btn-primary">
          + Registrar pago
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
          Pendientes ({pendientes?.length ?? 0})
        </div>
        {(pendientes ?? []).length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>Sin cobros pendientes 🎉</p>
        ) : (
          (pendientes ?? []).map((p: any) => (
            <Link key={p.id} href={`/panel/consultorio/pagos/${p.id}`} className={styles.payRow} style={{ textDecoration: "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{p.pacientes?.nombre ?? "—"}</div>
                <div style={{ fontSize: 11.5, color: "var(--nv-text-muted)" }}>
                  {p.descripcion ? `${p.descripcion} · ` : ""}
                  {p.fecha ? new Date(p.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : ""}
                </div>
              </div>
              <span className={styles.payAmount}>{formatMoneda(Number(p.monto))}</span>
            </Link>
          ))
        )}
      </div>

      {(pagados ?? []).length > 0 && (
        <div className="card">
          <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
            Recientes cobrados
          </div>
          {(pagados ?? []).map((p: any) => (
            <Link key={p.id} href={`/panel/consultorio/pagos/${p.id}`} className={styles.payRow} style={{ textDecoration: "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{p.pacientes?.nombre ?? "—"}</div>
                <div style={{ fontSize: 11.5, color: "var(--nv-text-muted)" }}>
                  {p.descripcion ? `${p.descripcion} · ` : ""}
                  {p.fecha ? new Date(p.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : ""}
                </div>
              </div>
              <span className={`${styles.payAmount} ${styles.payAmountPaid}`}>{formatMoneda(Number(p.monto))}</span>
              <span className={styles.badgeOk}>Cobrado</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
