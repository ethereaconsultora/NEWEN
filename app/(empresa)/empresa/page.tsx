"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../empresa.module.css";

const FASES = ["Diagnóstico", "Intervención", "Medición", "Seguimiento", "Consolidación", "Mantenimiento"];

const SERVICIOS = [
  "Liderazgo Sostenible",
  "Fortalecimiento de Equipos",
  "Recuperación del Clima",
  "Gestión de Conflictos",
  "Prevención de Burnout",
  "Onboarding",
  "Campus Digital",
];

const TEMAS = ["Estrés laboral", "Burnout", "Conflictos interpersonales", "Duelo", "Ansiedad", "Orientación de carrera"];

const COUNSELOR_BY_TEMA: Record<string, string> = {
  "Estrés laboral": "Lic. Ana Ferrer",
  "Burnout": "Lic. Ana Ferrer",
  "Conflictos interpersonales": "Lic. Pablo Ramos",
  "Duelo": "Lic. Silvia Torres",
  "Ansiedad": "Lic. Martín Salas",
  "Orientación de carrera": "Lic. Laura Ríos",
};

export default function EmpresaDashboard() {
  const supabase = createClient();
  const [org, setOrg] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [tab, setTab] = useState<"general" | "sistemas" | "empleados">("general");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const active: any | null = useMemo(
    () => clients.find((c) => c.id === selected) ?? clients[0] ?? null,
    [clients, selected]
  );

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/organizations/mine");
    const data = await res.json().catch(() => ({ org: null }));
    const orgData = data.org;
    setOrg(orgData ?? null);
    if (!orgData) {
      setLoading(false);
      return;
    }
    const { data: clientsData } = await supabase
      .from("organization_clients")
      .select("*")
      .eq("organization_id", orgData.id)
      .eq("archivado", false)
      .order("nombre");
    setClients(clientsData ?? []);
    if (clientsData?.length) setSelected(clientsData[0].id);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) {
      setEmployees([]);
      return;
    }
    supabase
      .from("organization_employees")
      .select("*")
      .eq("client_id", active.id)
      .order("nombre")
      .then(({ data }) => setEmployees(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  async function saveCliente() {
    const nombre = (document.getElementById("nc-nombre") as HTMLInputElement)?.value?.trim();
    if (!nombre) {
      notify("Ingresá el nombre de la empresa");
      return;
    }
    const servicios = Array.from(
      document.querySelectorAll<HTMLInputElement>("#nc-servicios input:checked")
    ).map((i) => i.value);
    const { error } = await supabase.from("organization_clients").insert({
      organization_id: org.id,
      nombre,
      cuit: (document.getElementById("nc-cuit") as HTMLInputElement)?.value || null,
      rubro: (document.getElementById("nc-rubro") as HTMLInputElement)?.value || null,
      sede: (document.getElementById("nc-sede") as HTMLInputElement)?.value || null,
      empleados:
        parseInt((document.getElementById("nc-empleados") as HTMLInputElement)?.value || "0", 10) || 0,
      contacto: (document.getElementById("nc-contacto") as HTMLInputElement)?.value || null,
      email: (document.getElementById("nc-email") as HTMLInputElement)?.value || null,
      telefono: (document.getElementById("nc-tel") as HTMLInputElement)?.value || null,
      servicios,
    });
    if (error) {
      notify("Error al cargar: " + error.message);
      return;
    }
    setModal(null);
    await load();
    notify("Cliente dado de alta");
  }

  async function saveEdicion() {
    if (!active) return;
    const servicios = Array.from(
      document.querySelectorAll<HTMLInputElement>("#ec-servicios input:checked")
    ).map((i) => i.value);
    const { error } = await supabase.from("organization_clients").update({
      nombre: (document.getElementById("ec-nombre") as HTMLInputElement)?.value?.trim() || active.nombre,
      rubro: (document.getElementById("ec-rubro") as HTMLInputElement)?.value || null,
      sede: (document.getElementById("ec-sede") as HTMLInputElement)?.value || null,
      contacto: (document.getElementById("ec-contacto") as HTMLInputElement)?.value || null,
      email: (document.getElementById("ec-email") as HTMLInputElement)?.value || null,
      telefono: (document.getElementById("ec-tel") as HTMLInputElement)?.value || null,
      servicios,
    }).eq("id", active.id);
    if (error) {
      notify("Error al guardar: " + error.message);
      return;
    }
    setModal(null);
    await load();
    notify("Datos del cliente actualizados");
  }

  async function archivarCliente() {
    if (!active) return;
    const { error } = await supabase.from("organization_clients").update({ archivado: true }).eq("id", active.id);
    if (error) {
      notify("Error al archivar: " + error.message);
      return;
    }
    setModal(null);
    await load();
    notify("Cliente archivado");
  }

  async function derivar(emp: any) {
    const temas = Array.from(
      document.querySelectorAll<HTMLInputElement>("#dv-temas input:checked")
    ).map((i) => i.value);
    if (!temas.length) {
      notify("Seleccioná al menos un tema");
      return;
    }
    const quienDeriva = (document.getElementById("dv-deriva") as HTMLInputElement)?.value?.trim();
    if (!quienDeriva) {
      notify('El campo "Quién deriva" es obligatorio');
      return;
    }
    const caso = (document.getElementById("dv-caso") as HTMLTextAreaElement)?.value?.trim() || null;
    const { error } = await supabase.from("organization_derivaciones").insert({
      organization_id: org.id,
      client_id: active.id,
      employee_id: emp.id,
      persona: emp.nombre,
      temas,
      counselor: COUNSELOR_BY_TEMA[temas[0]] ?? null,
      caso,
      quien_deriva: quienDeriva,
    });
    if (error) {
      notify("Error al derivar: " + error.message);
      return;
    }
    setModal(null);
    notify("Derivación enviada a Newen");
  }

  if (loading) {
    return (
      <div className={styles.root}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className={styles.root}>
        <div className={styles.content}>
          <div className={styles.panel}>
            <h3>Sin organización vinculada</h3>
            <p style={{ marginTop: 8 }}>
              Tu cuenta todavía no tiene un espacio de empresa. Creá el tuyo en un minuto:
            </p>
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link className={styles.btn} href="/empresas/crear">
                + Crear mi espacio
              </Link>
              <Link className={styles.btnOutline} href="/empresas">
                Ver la vidriera
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fase = active?.fase ?? 1;

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.badge}>🛡️ PANEL DE ADMINISTRACIÓN — {org.nombre.toUpperCase()}</div>
        <div className={styles.selector}>
          <span className={styles.selectorLabel}>Cliente seleccionado</span>
          <select
            className={styles.select}
            value={active?.id ?? ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => setModal({ type: "nuevo" })}>
            + Cargar Cliente
          </button>
          <Link className={styles.btnOutline} href="/empresa/campus">
            🎓 Campus
          </Link>
          <Link className={styles.btnOutline} href={`/e/${org.slug}`} target="_blank">
            🌐 Sitio público
          </Link>
        </div>
      </div>

      {/* Header */}
      {active && (
        <div className={styles.header}>
          <div>
            <div className={styles.title}>{active.nombre}</div>
            <div className={styles.subtitle}>
              Fase {fase} — {FASES[fase - 1]} · {active.rubro ?? "—"}
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnOutline} onClick={() => setModal({ type: "ficha" })}>
              👤 Ficha
            </button>
            <button className={styles.btnOutline} onClick={() => setModal({ type: "editar" })}>
              ✏️ Editar
            </button>
            <button className={styles.btnOutline} onClick={() => setModal({ type: "archivar" })}>
              🗂 Archivar
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab}${tab === "general" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("general")}>
          📊 Visión General
        </button>
        <button className={`${styles.tab}${tab === "sistemas" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("sistemas")}>
          ⚙️ Sistema (6 Fases)
        </button>
        <button className={`${styles.tab}${tab === "empleados" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("empleados")}>
          👥 Empleados
        </button>
      </div>

      <div className={styles.content}>
        {tab === "general" && (
          <>
            <div className={styles.grid3}>
              <div className={styles.panel}>
                <div className={styles.statLabel}>Clientes activos</div>
                <div className={styles.statNumber}>{clients.length}</div>
              </div>
              <div className={styles.panel}>
                <div className={styles.statLabel}>Empleados del cliente</div>
                <div className={styles.statNumber}>{employees.length}</div>
              </div>
              <div className={styles.panel}>
                <div className={styles.statLabel}>Fase actual</div>
                <div className={styles.statNumber}>{fase} / 6</div>
              </div>
            </div>
            {active && (
              <div className={styles.panel}>
                <h3>Resumen ejecutivo</h3>
                <p style={{ marginTop: 10 }}>
                  {active.nombre} se encuentra transitando la <strong style={{ color: "var(--ec-ac)" }}>Fase {fase} ({FASES[fase - 1]})</strong>.
                  Servicios contratados: {(active.servicios ?? []).join(", ") || "Sin servicios asignados"}.
                </p>
              </div>
            )}
          </>
        )}

        {tab === "sistemas" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h3>Sistema contratado</h3>
                <p>Ciclo metodológico de 6 fases para instalar la capacidad en la organización.</p>
              </div>
            </div>
            <div className={styles.phases}>
              {FASES.map((f, i) => {
                const n = i + 1;
                const cls =
                  n < fase ? styles.phaseDone : n === fase ? styles.phaseActive : "";
                return (
                  <div key={f} className={`${styles.phase} ${cls}`}>
                    <div className={styles.circle}>{n < fase ? "✓" : n}</div>
                    <div className={styles.phaseTitle}>
                      {n}. {f}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "empleados" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Empleados con ficha personal</h3>
            </div>
            {employees.length === 0 ? (
              <p className={styles.empty}>No hay empleados cargados para este cliente.</p>
            ) : (
              <div className={styles.empGrid}>
                {employees.map((e) => (
                  <div key={e.id} className={styles.empCard}>
                    <div className={styles.empName}>{e.nombre}</div>
                    <div className={styles.empMeta}>
                      {e.area ?? "—"} · {e.rol ?? "—"}
                    </div>
                    <div className={styles.progress}>
                      <i style={{ width: `${e.avance ?? 0}%` }} />
                    </div>
                    <div className={styles.empMeta} style={{ marginTop: 8 }}>
                      Avance: {e.avance ?? 0}%
                    </div>
                    <div className={styles.empActions}>
                      <button className={styles.btn} onClick={() => setModal({ type: "derivar", data: e })}>
                        ↗ Derivar a Newen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#c4a87e",
            color: "#0d0b09",
            fontWeight: 700,
            fontSize: 13,
            padding: "12px 22px",
            borderRadius: 8,
            zIndex: 200,
          }}
        >
          {toast}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>
                {modal.type === "nuevo" && "+ Cargar Cliente"}
                {modal.type === "ficha" && "Ficha del Cliente"}
                {modal.type === "editar" && "Editar Cliente"}
                {modal.type === "archivar" && "Archivar Cliente"}
                {modal.type === "derivar" && `Derivar a Newen · ${modal.data?.nombre}`}
              </h3>
              <button className={styles.modalClose} onClick={() => setModal(null)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {modal.type === "nuevo" && (
                <>
                  <div className={styles.grid2form}>
                    <div className={styles.field}>
                      <label>Nombre de la empresa</label>
                      <input id="nc-nombre" placeholder="Ej: Industrias Norte S.A." />
                    </div>
                    <div className={styles.field}>
                      <label>CUIT</label>
                      <input id="nc-cuit" placeholder="30-00000000-0" />
                    </div>
                    <div className={styles.field}>
                      <label>Rubro</label>
                      <input id="nc-rubro" placeholder="Ej: Manufactura" />
                    </div>
                    <div className={styles.field}>
                      <label>Sede</label>
                      <input id="nc-sede" placeholder="Ciudad, Provincia" />
                    </div>
                    <div className={styles.field}>
                      <label>Cantidad de empleados</label>
                      <input id="nc-empleados" type="number" defaultValue={100} />
                    </div>
                    <div className={styles.field}>
                      <label>Contacto</label>
                      <input id="nc-contacto" placeholder="Nombre del referente" />
                    </div>
                    <div className={styles.field}>
                      <label>Email corporativo</label>
                      <input id="nc-email" placeholder="nombre@empresa.com" />
                    </div>
                    <div className={styles.field}>
                      <label>Teléfono</label>
                      <input id="nc-tel" placeholder="+54 ..." />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Servicios contratados</label>
                    <div className={styles.checkGrid} id="nc-servicios">
                      {SERVICIOS.map((s) => (
                        <label key={s} className={styles.checkRow}>
                          <input type="checkbox" value={s} /> {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button className={styles.btn} onClick={saveCliente}>
                      Dar de alta
                    </button>
                  </div>
                </>
              )}

              {modal.type === "ficha" && active && (
                <>
                  <div className={styles.grid2form}>
                    <div className={styles.field}>
                      <label>Razón social</label>
                      <input value={active.nombre} readOnly />
                    </div>
                    <div className={styles.field}>
                      <label>CUIT</label>
                      <input value={active.cuit ?? "—"} readOnly />
                    </div>
                    <div className={styles.field}>
                      <label>Rubro</label>
                      <input value={active.rubro ?? "—"} readOnly />
                    </div>
                    <div className={styles.field}>
                      <label>Sede</label>
                      <input value={active.sede ?? "—"} readOnly />
                    </div>
                    <div className={styles.field}>
                      <label>Empleados</label>
                      <input value={active.empleados ?? "—"} readOnly />
                    </div>
                    <div className={styles.field}>
                      <label>Contacto</label>
                      <input value={active.contacto ?? "—"} readOnly />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Servicios contratados</label>
                    <div className={styles.chipRow}>
                      {(active.servicios ?? []).map((s: string) => (
                        <span key={s} className={styles.chip}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal({ type: "editar" })}>
                      ✏️ Editar
                    </button>
                    <button className={styles.btnOutline} onClick={archivarCliente}>
                      🗂 Archivar
                    </button>
                    <button className={styles.btn} onClick={() => setModal(null)}>
                      Cerrar
                    </button>
                  </div>
                </>
              )}

              {modal.type === "editar" && active && (
                <>
                  <div className={styles.grid2form}>
                    <div className={styles.field}>
                      <label>Nombre de la empresa</label>
                      <input id="ec-nombre" defaultValue={active.nombre} />
                    </div>
                    <div className={styles.field}>
                      <label>Rubro</label>
                      <input id="ec-rubro" defaultValue={active.rubro ?? ""} />
                    </div>
                    <div className={styles.field}>
                      <label>Sede</label>
                      <input id="ec-sede" defaultValue={active.sede ?? ""} />
                    </div>
                    <div className={styles.field}>
                      <label>Contacto</label>
                      <input id="ec-contacto" defaultValue={active.contacto ?? ""} />
                    </div>
                    <div className={styles.field}>
                      <label>Email</label>
                      <input id="ec-email" defaultValue={active.email ?? ""} />
                    </div>
                    <div className={styles.field}>
                      <label>Teléfono</label>
                      <input id="ec-tel" defaultValue={active.telefono ?? ""} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Servicios contratados</label>
                    <div className={styles.checkGrid} id="ec-servicios">
                      {SERVICIOS.map((s) => (
                        <label key={s} className={styles.checkRow}>
                          <input type="checkbox" value={s} defaultChecked={(active.servicios ?? []).includes(s)} /> {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal({ type: "ficha" })}>
                      Volver
                    </button>
                    <button className={styles.btn} onClick={saveEdicion}>
                      Guardar cambios
                    </button>
                  </div>
                </>
              )}

              {modal.type === "archivar" && active && (
                <>
                  <p>
                    ¿Archivar <strong style={{ color: "var(--ec-ac)" }}>{active.nombre}</strong>? Dejará de
                    aparecer en la lista activa pero quedará guardado.
                  </p>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button className={styles.btn} onClick={archivarCliente}>
                      Sí, archivar
                    </button>
                  </div>
                </>
              )}

              {modal.type === "derivar" && (
                <>
                  <p style={{ marginBottom: 14 }}>
                    Elegí los temas a tratar. Sugerimos un counselor específico y la persona recibe un
                    acceso para seleccionarlo en Newen.
                  </p>
                  <div className={styles.field}>
                    <label>Temas a tratar</label>
                    <div className={styles.checkGrid} id="dv-temas">
                      {TEMAS.map((t) => (
                        <label key={t} className={styles.checkRow}>
                          <input type="checkbox" value={t} /> {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Datos del caso (para el profesional)</label>
                    <textarea id="dv-caso" placeholder="Contexto del caso y motivo de la derivación…" />
                  </div>
                  <div className={styles.field}>
                    <label>Quién deriva * (obligatorio)</label>
                    <input id="dv-deriva" placeholder="Tu nombre y rol, ej: Lic. Ari Mangini — Espacio Crítico" />
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button className={styles.btn} onClick={() => derivar(modal.data)}>
                      Confirmar derivación
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
