"use client";

import { useState } from "react";
import styles from "../pages.module.css";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function keyOf(iso: string) {
  return (iso ?? "").slice(0, 7);
}

export default function ResumenClient({
  pacientes,
  turnos,
  pagos,
}: {
  pacientes: any[];
  turnos: any[];
  pagos: any[];
}) {
  const [periodo, setPeriodo] = useState("mes");

  const hoy = new Date();
  const startOf = (() => {
    if (periodo === "semana") {
      const d = new Date(hoy);
      d.setDate(d.getDate() - 7);
      return d.toISOString().split("T")[0];
    }
    if (periodo === "ano") return hoy.getFullYear() + "-01-01";
    return hoy.toISOString().slice(0, 7) + "-01";
  })();

  const enPeriodo = (iso: string) => iso >= startOf;

  const turnosPeriodo = turnos.filter((t) => enPeriodo(t.fecha));
  const realizados = turnosPeriodo.filter((t) => t.estado === "realizado").length;
  const ausentes = turnosPeriodo.filter((t) => t.estado === "ausente").length;
  const asistencia = realizados + ausentes > 0 ? Math.round((realizados / (realizados + ausentes)) * 100) : 0;

  const ingresos = pagos
    .filter((p) => p.estado === "pagado" && enPeriodo(p.fecha))
    .reduce((s, p) => s + (Number(p.monto) || 0), 0);

  const pacientesNuevos = pacientes.filter((p) => p.created_at && enPeriodo(p.created_at.slice(0, 10))).length;

  // Ingresos por mes (últimos 6 meses)
  const meses: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const total = pagos
      .filter((p) => p.estado === "pagado" && keyOf(p.fecha) === key)
      .reduce((s, p) => s + (Number(p.monto) || 0), 0);
    meses.push({ label: MESES[d.getMonth()], total });
  }
  const maxMes = Math.max(...meses.map((m) => m.total), 1);

  const formatMoneda = (n: number) => "$" + n.toLocaleString("es-AR");

  const modCounts: Record<string, number> = {};
  turnosPeriodo.forEach((t) => {
    const m = t.modalidad || "sin definir";
    modCounts[m] = (modCounts[m] ?? 0) + 1;
  });
  const modTotal = turnosPeriodo.length || 1;

  return (
    <div>
      <div className={styles.tabs} style={{ marginBottom: 18 }}>
        {[
          { id: "semana", label: "Semana" },
          { id: "mes", label: "Mes" },
          { id: "ano", label: "Año" },
        ].map((p) => (
          <button
            key={p.id}
            className={`${styles.tab}${periodo === p.id ? ` ${styles.tabActive}` : ""}`}
            onClick={() => setPeriodo(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.kpiGrid}>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Turnos realizados</div>
          <div className={styles.kpiValue}>{realizados}</div>
        </div>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Ingresos</div>
          <div className={styles.kpiValue}>{formatMoneda(ingresos)}</div>
        </div>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Pacientes nuevos</div>
          <div className={styles.kpiValue}>{pacientesNuevos}</div>
        </div>
        <div className={`card ${styles.kpi}`}>
          <div className={styles.kpiLabel}>Asistencia</div>
          <div className={styles.kpiValue}>{asistencia}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h2 style={{ fontFamily: "var(--nv-font-display)", fontSize: 18, marginBottom: 14 }}>Ingresos por mes</h2>
          <div className={styles.bars}>
            {meses.map((m, i) => (
              <div key={i} className={styles.bar}>
                <div className={styles.barVal}>{m.total > 0 ? formatMoneda(m.total) : ""}</div>
                <div
                  className={`${styles.barFill}${i === meses.length - 1 ? ` ${styles.barFillHot}` : ""}`}
                  style={{ height: `${Math.max(6, (m.total / maxMes) * 100)}%` }}
                />
                <div className={styles.barLb}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: "var(--nv-font-display)", fontSize: 18, marginBottom: 14 }}>Modalidad de atención</h2>
          {Object.entries(modCounts).map(([mod, count]) => (
            <div key={mod} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, textTransform: "capitalize" }}>{mod}</span>
                <b style={{ fontSize: 12.5 }}>{Math.round((count / modTotal) * 100)}%</b>
              </div>
              <div className={`${styles.progressLine}${mod === "online" || mod === "virtual" ? ` ${styles.progressLineGold}` : ""}`}>
                <div style={{ width: `${(count / modTotal) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
