import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./pages.module.css";

export default async function ConsultorioInicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const { data: profile } = await supabase
    .from("users")
    .select("nombre")
    .eq("id", user.id)
    .single();
  const nombre = profile?.nombre?.split(" ")[0] ?? "Counselor";

  const hoy = new Date();
  const hoyIso = hoy.toISOString().split("T")[0];
  const mesIso = hoyIso.slice(0, 7);

  const [{ data: pacientes }, { data: turnosHoy }, { data: pendientes }, { data: cobradosMes }, { data: proximos }] =
    await Promise.all([
      supabase.from("pacientes").select("id").is("deleted_at", null),
      supabase.from("turnos").select("id").eq("fecha", hoyIso).in("estado", ["confirmado"]),
      supabase.from("pagos").select("monto").eq("estado", "pendiente"),
      supabase.from("pagos").select("monto").eq("estado", "pagado").gte("fecha", mesIso + "-01"),
      supabase
        .from("turnos")
        .select("id,hora,fecha,modalidad,pacientes(nombre)")
        .gte("fecha", hoyIso)
        .eq("estado", "confirmado")
        .order("fecha")
        .order("hora")
        .limit(3),
    ]);

  const totalPendiente = (pendientes ?? []).reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const ingresosMes = (cobradosMes ?? []).reduce((s, p) => s + (Number(p.monto) || 0), 0);

  const formatMoneda = (n: number) => "$" + n.toLocaleString("es-AR");
  const fechaLarga = hoy.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Buenos días, {nombre}</h1>
          <div className={styles.pageSub}>
            {fechaLarga} · {turnosHoy?.length ?? 0} turnos hoy
          </div>
        </div>
        <Link href="/panel/consultorio/agenda/nuevo" className="btn-primary">
          + Nuevo turno
        </Link>
      </div>

      <div className={styles.kpiGrid}>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Pacientes activos</div>
          <div className={styles.kpiValue}>{pacientes?.length ?? 0}</div>
        </div>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Turnos hoy</div>
          <div className={styles.kpiValue}>{turnosHoy?.length ?? 0}</div>
        </div>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Ingresos del mes</div>
          <div className={styles.kpiValue}>{formatMoneda(ingresosMes)}</div>
        </div>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Pendiente de cobro</div>
          <div className={styles.kpiValue}>{formatMoneda(totalPendiente)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className={styles.pageHead} style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: "var(--nv-font-display)", fontSize: 18 }}>Próximos turnos</h2>
            <Link href="/panel/consultorio/agenda" style={{ color: "var(--nv-accent)", fontSize: 12.5, fontWeight: 600 }}>
              Ver agenda →
            </Link>
          </div>
          {(proximos ?? []).length === 0 && (
            <p style={{ fontSize: 13, color: "var(--nv-text-muted)" }}>No tenés turnos próximos.</p>
          )}
          {(proximos ?? []).map((t: any) => (
            <div key={t.id} className={styles.turnoRow}>
              <div className={styles.turnoHora}>{t.hora?.slice(0, 5)}</div>
              <div className={styles.turnoBody}>
                <b>{t.pacientes?.nombre ?? "—"}</b>
                <span>{t.modalidad ?? "Sin modalidad"}</span>
              </div>
              <span className={styles.badgeOk}>Confirmado</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className={styles.pageHead} style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: "var(--nv-font-display)", fontSize: 18 }}>Accesos rápidos</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Link href="/panel/consultorio/pacientes/nuevo" className="btn-secondary" style={{ justifyContent: "center" }}>
              + Paciente
            </Link>
            <Link href="/panel/consultorio/agenda/nuevo" className="btn-secondary" style={{ justifyContent: "center" }}>
              + Turno
            </Link>
            <Link href="/panel/consultorio/pagos/nuevo" className="btn-secondary" style={{ justifyContent: "center" }}>
              + Cobro
            </Link>
            <Link href="/panel/consultorio/pacientes" className="btn-secondary" style={{ justifyContent: "center" }}>
              Pacientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
