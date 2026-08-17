import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../pages.module.css";

const DOW = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function CalendarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = hoy.getMonth();
  const hoyIso = hoy.toISOString().split("T")[0];

  const firstDay = new Date(year, month, 1);
  // Lunes como primer día: 0 = Lun … 6 = Dom
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

  const { data: turnos } = await supabase
    .from("turnos")
    .select("fecha")
    .gte("fecha", monthStart)
    .lte("fecha", monthEnd);

  const fechasConTurnos = new Set((turnos ?? []).map((t: any) => t.fecha));

  // Celdas (hasta 42)
  const cells: { day: number; iso: string | null }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, iso: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  while (cells.length % 7 !== 0) cells.push({ day: 0, iso: null });

  const anterior = new Date(year, month - 1, 1);
  const siguiente = new Date(year, month + 1, 1);

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Calendario</h1>
          <div className={styles.pageSub}>Vista mensual de turnos</div>
        </div>
        <Link href="/panel/consultorio/agenda/nuevo" className="btn-primary">
          + Nuevo turno
        </Link>
      </div>

      <div className="card">
        <div className={styles.calHead}>
          <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>
            {MESES[anterior.getMonth()].charAt(0).toUpperCase() + MESES[anterior.getMonth()].slice(1)} {anterior.getFullYear()}
          </span>
          <b style={{ fontFamily: "var(--nv-font-display)", fontSize: 19 }}>
            {MESES[month].charAt(0).toUpperCase() + MESES[month].slice(1)} {year}
          </b>
          <span style={{ fontSize: 12, color: "var(--nv-text-muted)" }}>
            {MESES[siguiente.getMonth()].charAt(0).toUpperCase() + MESES[siguiente.getMonth()].slice(1)} {siguiente.getFullYear()}
          </span>
        </div>

        <div className={styles.calGrid}>
          {DOW.map((d) => (
            <div key={d} className={styles.calDow}>
              {d}
            </div>
          ))}

          {cells.map((c, i) => {
            if (!c.iso) return <div key={i} className={`${styles.calDay} ${styles.calDayMuted}`} />;
            const isToday = c.iso === hoyIso;
            const hasTurno = fechasConTurnos.has(c.iso);
            return (
              <div
                key={i}
                className={`${styles.calDay}${isToday ? ` ${styles.calDayToday}` : ""}`}
                title={hasTurno ? `${c.day}: turnos` : undefined}
              >
                {c.day}
                {hasTurno && <span className={styles.calDot} />}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: 16, fontSize: 12, color: "var(--nv-text-secondary)" }}>
          <span>
            <i style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", marginRight: 6, background: "var(--nv-tierra)", verticalAlign: "middle" }} />
            Día con turnos
          </span>
          <span style={{ opacity: 0.7 }}>Hoy: {hoy.getDate()} de {MESES[month]}</span>
        </div>
      </div>
    </div>
  );
}
