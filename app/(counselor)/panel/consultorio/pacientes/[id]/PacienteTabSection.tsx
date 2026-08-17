"use client";

import { useState } from "react";
import NuevaEntradaForm from "./NuevaEntradaForm";
import styles from "../../pages.module.css";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fmtFecha(val: string | null) {
  if (!val) return "—";
  const d = new Date(val.slice(0, 10) + "T12:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PacienteTabSection({
  pacienteId,
  estadoActual,
  historial,
}: {
  pacienteId: string;
  estadoActual: string;
  historial: any[];
}) {
  const [tab, setTab] = useState<"registro" | "historia">("registro");

  return (
    <div>
      <div className={styles.tabs} style={{ marginBottom: 16 }}>
        <button
          className={`${styles.tab}${tab === "registro" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("registro")}
        >
          Registrar sesión
        </button>
        <button
          className={`${styles.tab}${tab === "historia" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("historia")}
        >
          Historia clínica ({historial.length})
        </button>
      </div>

      {tab === "registro" && (
        <NuevaEntradaForm
          pacienteId={pacienteId}
          estadoActual={estadoActual}
          onSaved={() => setTab("historia")}
        />
      )}

      {tab === "historia" && (
        <div>
          {!historial.length ? (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
              <p style={{ fontWeight: 600 }}>Sin sesiones registradas</p>
              <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginTop: 4 }}>
                Usá la pestaña “Registrar sesión” para agregar la primera.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {historial.map((entry: any, i: number) => {
                const num = historial.length - i;
                return (
                  <div key={entry.id} className="card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: "var(--nv-font-display)", fontSize: 16 }}>
                          {fmtFecha(entry.fecha || entry.created_at)}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--nv-text-muted)" }}>
                          Sesión #{num}
                          {entry.tipo_sesion && <span> · {entry.tipo_sesion}</span>}
                        </div>
                      </div>
                      {entry.estado_animo && (
                        <span className={styles.badgeOk}>
                          {entry.estado_animo.replace("Enproceso", "En proceso").replace("Encrisis", "En crisis")}
                        </span>
                      )}
                    </div>

                    {entry.motivo_consulta && (
                      <div style={{ marginBottom: 8 }}>
                        <div className={styles.fieldLabel}>Motivo de consulta</div>
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5 }}>{entry.motivo_consulta}</p>
                      </div>
                    )}
                    {entry.estado_actual && (
                      <div style={{ marginBottom: 8 }}>
                        <div className={styles.fieldLabel}>Estado actual</div>
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5 }}>{entry.estado_actual}</p>
                      </div>
                    )}
                    {entry.tareas && (
                      <div style={{ marginBottom: 8 }}>
                        <div className={styles.fieldLabel}>Tareas / compromisos</div>
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5 }}>{entry.tareas}</p>
                      </div>
                    )}
                    {entry.texto && (
                      <div style={{ marginBottom: 8 }}>
                        <div className={styles.fieldLabel}>Notas</div>
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5 }}>{entry.texto}</p>
                      </div>
                    )}
                    {Array.isArray(entry.topics) && entry.topics.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {entry.topics.map((t: string) => (
                          <span
                            key={t}
                            style={{
                              fontSize: 11,
                              padding: "3px 10px",
                              borderRadius: 999,
                              background: "var(--nv-tierra-soft)",
                              color: "var(--nv-text-secondary)",
                              border: "1px solid var(--nv-border)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
