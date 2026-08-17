"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../pages.module.css";

const FILTROS = [
  { id: "proximos", label: "Próximos" },
  { id: "hoy", label: "Hoy" },
  { id: "pasados", label: "Pasados" },
  { id: "todos", label: "Todos" },
];

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DAYS_FULL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS_FULL = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function fmtFecha(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function buildWaMsg(nombre: string, fecha: string, hora: string) {
  const primerNombre = nombre.split(" ")[0];
  const d = new Date(fecha + "T12:00:00");
  const fechaStr = `${DAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
  const horaStr = (hora ?? "").slice(0, 5);
  return `Hola ${primerNombre}\n\nTe recuerdo nuestro encuentro agendado para el ${fechaStr} a las ${horaStr}hs.\n\n¿Podés confirmar tu asistencia?\n\n¡Hasta pronto!`;
}

const ESTADO_BADGE: Record<string, string> = {
  confirmado: "badgeOk",
  realizado: "badgeMuted",
  cancelado: "badgeLive",
  ausente: "badgeWarn",
};

export default function AgendaClient({ turnos, hoy }: { turnos: any[]; hoy: string }) {
  const [filtro, setFiltro] = useState("proximos");

  const filtered = turnos.filter((t) => {
    if (filtro === "hoy") return t.fecha === hoy;
    if (filtro === "proximos") return t.fecha >= hoy;
    if (filtro === "pasados") return t.fecha < hoy;
    return true;
  });

  const grouped: Record<string, any[]> = {};
  filtered.forEach((t) => {
    if (!grouped[t.fecha]) grouped[t.fecha] = [];
    grouped[t.fecha].push(t);
  });
  const dates = Object.keys(grouped).sort((a, b) => (filtro === "pasados" ? b.localeCompare(a) : a.localeCompare(b)));

  return (
    <div>
      <div className={styles.tabs} style={{ marginBottom: 18 }}>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={`${styles.tab}${filtro === f.id ? ` ${styles.tabActive}` : ""}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!dates.length ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
          <p style={{ fontWeight: 600 }}>Sin turnos</p>
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginTop: 4 }}>
            No hay turnos {filtro === "hoy" ? "para hoy" : filtro === "proximos" ? "próximos" : filtro === "pasados" ? "pasados" : ""}.
          </p>
          <Link href="/panel/consultorio/agenda/nuevo" className="btn-primary" style={{ display: "inline-flex", marginTop: 14 }}>
            + Agregar turno
          </Link>
        </div>
      ) : (
        dates.map((fecha) => (
          <div key={fecha} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--nv-font-display)", fontSize: 17 }}>{fmtFecha(fecha)}</span>
              {fecha === hoy && <span className={styles.badgeOk}>Hoy</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[fecha].map((t: any) => {
                const nombre = t.patient_name || t.pacientes?.nombre || t.consultante?.nombre || "—";
                const phone = (t.patient_phone || t.pacientes?.telefono || "").replace(/\D/g, "");
                const msg = buildWaMsg(nombre, t.fecha, t.hora ?? "");
                const badgeClass = styles[ESTADO_BADGE[t.estado] ?? "badgeMuted"];
                return (
                  <div key={t.id} className="card" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 52, flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, color: "var(--nv-accent)" }}>{t.hora?.slice(0, 5)}</div>
                        <div style={{ fontSize: 10.5, color: "var(--nv-text-muted)" }}>{t.tipo || "Sesión"}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{nombre}</div>
                        <div style={{ fontSize: 11.5, color: "var(--nv-text-muted)" }}>
                          {t.modalidad ? `${t.modalidad.charAt(0).toUpperCase() + t.modalidad.slice(1)}` : ""}
                        </div>
                        {t.notas && <div style={{ fontSize: 11.5, color: "var(--nv-text-muted)", marginTop: 2 }}>{t.notas}</div>}
                      </div>
                      <span className={badgeClass}>{t.estado}</span>
                      <Link href={`/panel/consultorio/agenda/${t.id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>
                        Ver
                      </Link>
                      {phone && (
                        <a
                          href={`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost"
                          style={{ padding: "4px 10px", fontSize: 13 }}
                          title="Confirmar por WhatsApp"
                        >
                          📲
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
