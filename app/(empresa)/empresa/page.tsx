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

const ESTADOS_TAREA: Record<string, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "badgePend" },
  encurso: { label: "En curso", cls: "badgeCurso" },
  completada: { label: "Completada", cls: "badgeDone" },
};

type Tab = "general" | "sistemas" | "informes" | "agenda" | "seguimiento" | "empleados";

function hoy() {
  return new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

/** Abre una ventana de impresión con un informe formateado (el usuario elige "Guardar como PDF"). */
function downloadReport(title: string, body: string) {
  const w = window.open("", "_blank", "width=860,height=920");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>` +
      `<style>body{font-family:Georgia,serif;color:#1a1710;padding:44px;line-height:1.6;max-width:760px;margin:0 auto}` +
      `h1{font-size:26px;margin:0 0 4px}.meta{color:#6b5f4a;font-size:12px;margin-bottom:24px;border-bottom:1px solid #e2d9c8;padding-bottom:12px}` +
      `h2{font-size:16px;margin:22px 0 6px;color:#9a7b45}p{font-size:13px;margin:6px 0}` +
      `table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #d8cfc0;padding:8px 10px;font-size:12px;text-align:left;vertical-align:top}` +
      `.ac{color:#9a7b45}</style></head><body>${body}` +
      `<script>window.onload=function(){setTimeout(function(){window.print()},350)}</script></body></html>`
  );
  w.document.close();
}

export default function EmpresaDashboard() {
  const supabase = createClient();
  const [org, setOrg] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [derivaciones, setDerivaciones] = useState<any[]>([]);
  const [archived, setArchived] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selDerivId, setSelDerivId] = useState<string>("");
  const [msgs, setMsgs] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");

  const active: any | null = useMemo(
    () => clients.find((c) => c.id === selected) ?? clients[0] ?? null,
    [clients, selected]
  );

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function val(id: string): string {
    return (document.getElementById(id) as HTMLInputElement)?.value?.trim() || "";
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
    setSelected((prev) =>
      prev && (clientsData ?? []).some((c) => c.id === prev) ? prev : clientsData?.[0]?.id ?? ""
    );
    setLoading(false);
  }

  async function reloadActive() {
    if (!active) {
      setEmployees([]);
      setTasks([]);
      setDerivaciones([]);
      return;
    }
    const [empR, tskR, derR] = await Promise.all([
      supabase.from("organization_employees").select("*").eq("client_id", active.id).order("nombre"),
      supabase.from("organization_tasks").select("*").eq("client_id", active.id).order("created_at"),
      supabase
        .from("organization_derivaciones")
        .select("*")
        .eq("client_id", active.id)
        .order("created_at", { ascending: false }),
    ]);
    setEmployees(empR.data ?? []);
    setTasks(tskR.data ?? []);
    setDerivaciones(derR.data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reloadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  /* ── Clientes ── */
  async function saveCliente() {
    const nombre = val("nc-nombre");
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
      cuit: val("nc-cuit") || null,
      rubro: val("nc-rubro") || null,
      sede: val("nc-sede") || null,
      empleados: parseInt(val("nc-empleados") || "0", 10) || 0,
      contacto: val("nc-contacto") || null,
      email: val("nc-email") || null,
      telefono: val("nc-tel") || null,
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
    const { error } = await supabase
      .from("organization_clients")
      .update({
        nombre: val("ec-nombre") || active.nombre,
        rubro: val("ec-rubro") || null,
        sede: val("ec-sede") || null,
        contacto: val("ec-contacto") || null,
        email: val("ec-email") || null,
        telefono: val("ec-tel") || null,
        servicios,
      })
      .eq("id", active.id);
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

  async function openArchivados() {
    const { data } = await supabase
      .from("organization_clients")
      .select("*")
      .eq("organization_id", org.id)
      .eq("archivado", true)
      .order("nombre");
    setArchived(data ?? []);
    setModal({ type: "archivados" });
  }

  async function restaurarCliente(id: string) {
    const { error } = await supabase.from("organization_clients").update({ archivado: false }).eq("id", id);
    if (error) {
      notify("Error al restaurar: " + error.message);
      return;
    }
    setArchived(archived.filter((c) => c.id !== id));
    await load();
    notify("Cliente restaurado");
  }

  async function avanzarFase() {
    if (!active) return;
    const next = Math.min((active.fase ?? 1) + 1, 6);
    const { error } = await supabase.from("organization_clients").update({ fase: next }).eq("id", active.id);
    if (error) {
      notify("Error: " + error.message);
      return;
    }
    await load();
    notify(`Cliente avanzó a Fase ${next} (${FASES[next - 1]})`);
  }

  /* ── Empleados ── */
  async function saveEmpleado() {
    const nombre = val("ne-nombre");
    if (!nombre) {
      notify("Ingresá el nombre de la persona");
      return;
    }
    const { error } = await supabase.from("organization_employees").insert({
      client_id: active.id,
      nombre,
      area: val("ne-area") || null,
      rol: val("ne-rol") || null,
      avance: parseInt(val("ne-avance") || "0", 10) || 0,
      situacion: val("ne-situacion") || null,
      notas: val("ne-notas") || null,
    });
    if (error) {
      notify("Error al cargar: " + error.message);
      return;
    }
    setModal(null);
    await reloadActive();
    notify("Empleado cargado");
  }

  async function derivar(emp: any) {
    const temas = Array.from(
      document.querySelectorAll<HTMLInputElement>("#dv-temas input:checked")
    ).map((i) => i.value);
    if (!temas.length) {
      notify("Seleccioná al menos un tema");
      return;
    }
    const quienDeriva = val("dv-deriva");
    if (!quienDeriva) {
      notify('El campo "Quién deriva" es obligatorio');
      return;
    }
    const caso = val("dv-caso") || null;
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
    await reloadActive();
    notify("Derivación enviada a Newen");
  }

  /* ── Tareas ── */
  async function saveTarea() {
    const titulo = val("nt-titulo");
    if (!titulo) {
      notify("Ingresá el título de la tarea");
      return;
    }
    const estado = (val("nt-estado") as any) || "pendiente";
    const { error } = await supabase.from("organization_tasks").insert({
      client_id: active.id,
      titulo,
      estado,
    });
    if (error) {
      notify("Error: " + error.message);
      return;
    }
    setModal(null);
    await reloadActive();
    notify("Tarea creada");
  }

  async function changeTaskState(taskId: string, estado: string) {
    const { error } = await supabase.from("organization_tasks").update({ estado }).eq("id", taskId);
    if (error) {
      notify("Error: " + error.message);
      return;
    }
    await reloadActive();
  }

  async function addAnotacion(taskId: string) {
    const input = document.getElementById(`anot-${taskId}`) as HTMLInputElement;
    const texto = input?.value?.trim();
    if (!texto) return;
    const task = tasks.find((t) => t.id === taskId);
    const anotaciones = [...(task?.anotaciones ?? []), texto];
    const { error } = await supabase.from("organization_tasks").update({ anotaciones }).eq("id", taskId);
    if (error) {
      notify("Error: " + error.message);
      return;
    }
    input.value = "";
    await reloadActive();
  }

  /* ── Mensajería ── */
  async function loadMsgs(derivId: string) {
    const { data } = await supabase
      .from("organization_mensajes")
      .select("*")
      .eq("derivacion_id", derivId)
      .order("created_at");
    setMsgs(data ?? []);
  }

  async function openMensajes(emp: any) {
    setModal({ type: "mensajes", data: emp });
    const derivs = derivaciones.filter((d) => d.employee_id === emp.id);
    const first = derivs[0];
    setSelDerivId(first?.id ?? "");
    if (first) await loadMsgs(first.id);
    else setMsgs([]);
  }

  async function enviarMensaje() {
    const texto = msgInput.trim();
    if (!texto || !selDerivId) return;
    const { error } = await supabase.from("organization_mensajes").insert({
      derivacion_id: selDerivId,
      de: "espacio",
      texto,
    });
    if (error) {
      notify("Error al enviar: " + error.message);
      return;
    }
    setMsgInput("");
    await loadMsgs(selDerivId);
  }

  /* ── Informes ── */
  function reportEjecutivo(): string {
    const n = active?.nombre ?? org?.nombre ?? "—";
    const fase = active?.fase ?? 1;
    const servs = (active?.servicios ?? []).join(", ") || "Sin servicios asignados";
    return (
      `<h1>Informe Ejecutivo</h1><div class="meta">${org?.nombre ?? ""} · ${hoy()}</div>` +
      `<p>El cliente <strong>${n}</strong> transita la <strong>Fase ${fase} (${FASES[fase - 1]})</strong> del sistema de 6 fases.</p>` +
      `<p><strong>Servicios contratados:</strong> ${servs}.</p>` +
      `<p><strong>Empleados con ficha:</strong> ${employees.length} · <strong>Tareas de seguimiento:</strong> ${tasks.length} · <strong>Derivaciones a Newen:</strong> ${derivaciones.length}.</p>`
    );
  }

  function reportDiagnostico(): string {
    const n = active?.nombre ?? "—";
    return (
      `<h1>Informe de Diagnóstico Inicial</h1><div class="meta">${org?.nombre ?? ""} · ${hoy()}</div>` +
      `<p><strong>Organización:</strong> ${n}</p>` +
      `<p><strong>Rubro:</strong> ${active?.rubro ?? "—"} · <strong>Sede:</strong> ${active?.sede ?? "—"} · <strong>Empleados:</strong> ${active?.empleados ?? "—"}</p>` +
      `<p><strong>Referente:</strong> ${active?.contacto ?? "—"} · <strong>Contacto:</strong> ${active?.email ?? "—"} / ${active?.telefono ?? "—"}</p>` +
      `<p>El diagnóstico relevó el punto de partida y definió el mapa de clima y riesgos relacionales. A partir de aquí se traza el plan de intervención por fases.</p>`
    );
  }

  function reportAvance(): string {
    const avg = employees.length
      ? Math.round(employees.reduce((s, e) => s + (e.avance ?? 0), 0) / employees.length)
      : 0;
    const rows = employees
      .map((e) => `<tr><td>${e.nombre}</td><td>${e.area ?? "—"}</td><td>${e.rol ?? "—"}</td><td>${e.avance ?? 0}%</td></tr>`)
      .join("");
    return (
      `<h1>Reporte Trimestral de Avance</h1><div class="meta">${org?.nombre ?? ""} · ${hoy()}</div>` +
      `<p>Avance promedio del equipo: <strong>${avg}%</strong>. Fase actual: ${active?.fase ?? 1} (${FASES[(active?.fase ?? 1) - 1]}).</p>` +
      `<table><tr><th>Persona</th><th>Área</th><th>Rol</th><th>Avance</th></tr>${rows || "<tr><td colspan='4'>Sin empleados cargados</td></tr>"}</table>`
    );
  }

  function reportRiesgos(): string {
    const rows = derivaciones
      .map(
        (d) =>
          `<tr><td>${d.persona}</td><td>${(d.temas ?? []).join(", ")}</td><td>${d.counselor ?? "—"}</td><td>${d.quien_deriva}</td></tr>`
      )
      .join("");
    return (
      `<h1>Evaluación de Riesgos Psicosociales</h1><div class="meta">${org?.nombre ?? ""} · Confidencial · ${hoy()}</div>` +
      `<p>Documento confidencial de counseling. Resumen de derivaciones activas del cliente <strong>${active?.nombre ?? "—"}</strong>.</p>` +
      `<table><tr><th>Persona</th><th>Temas</th><th>Profesional sugerido</th><th>Derivado por</th></tr>${rows || "<tr><td colspan='4'>Sin derivaciones registradas</td></tr>"}</table>`
    );
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
  const derivsEmp = modal?.type === "mensajes" ? derivaciones.filter((d) => d.employee_id === modal.data?.id) : [];

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.brandRow}>
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.nombre} className={styles.orgLogo} />
          ) : (
            <div className={styles.brandMark}>{(org.nombre ?? "E").charAt(0)}</div>
          )}
          <div className={styles.badge}>🛡️ PANEL DE ADMINISTRACIÓN — {org.nombre.toUpperCase()}</div>
        </div>
        <div className={styles.selector}>
          <span className={styles.selectorLabel}>Cliente seleccionado</span>
          <select className={styles.select} value={active?.id ?? ""} onChange={(e) => setSelected(e.target.value)}>
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
          <button className={styles.btnOutline} onClick={openArchivados}>
            🗂 Archivados
          </button>
          <Link className={styles.btnOutline} href="/empresas/crear?edit=1">
            🖼 Editar mi espacio
          </Link>
          <Link className={styles.btnOutline} href="/empresa/campus">
            🎓 Campus
          </Link>
          <Link className={styles.btnOutline} href={`/e/${org.slug}`} target="_blank">
            🌐 Sitio público
          </Link>
          <button className={styles.btnPdf} onClick={() => downloadReport("Informe Ejecutivo", reportEjecutivo())}>
            📄 Informe PDF
          </button>
        </div>
      </div>

      {/* Cover */}
      {org.cover_url ? (
        <img src={org.cover_url} alt="" className={styles.coverStrip} />
      ) : (
        <div className={styles.coverFallback} />
      )}

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
          📊 Visión General & KPIs
        </button>
        <button className={`${styles.tab}${tab === "sistemas" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("sistemas")}>
          ⚙️ Sistemas en Ejecución (6 Fases)
        </button>
        <button className={`${styles.tab}${tab === "informes" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("informes")}>
          📑 Informes & Diagnósticos (PDFs)
        </button>
        <button className={`${styles.tab}${tab === "agenda" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("agenda")}>
          🗓️ Agenda de Talleres & Counseling
        </button>
        <button className={`${styles.tab}${tab === "seguimiento" ? ` ${styles.tabActive}` : ""}`} onClick={() => setTab("seguimiento")}>
          📋 Seguimiento & Tareas
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
                <div className={styles.panelHead}>
                  <h3>Resumen ejecutivo</h3>
                  <button className={styles.btnPdf} onClick={() => downloadReport("Informe Ejecutivo", reportEjecutivo())}>
                    📄 Descargar PDF
                  </button>
                </div>
                <p>
                  {active.nombre} se encuentra transitando la{" "}
                  <strong style={{ color: "var(--ec-ac)" }}>Fase {fase} ({FASES[fase - 1]})</strong>. Servicios
                  contratados: {(active.servicios ?? []).join(", ") || "Sin servicios asignados"}.
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
              {active && (
                <button className={styles.btn} onClick={avanzarFase} disabled={fase >= 6}>
                  ⚙️ Avanzar a Fase {Math.min(fase + 1, 6)}
                </button>
              )}
            </div>
            <div className={styles.phases}>
              {FASES.map((f, i) => {
                const n = i + 1;
                const cls = n < fase ? styles.phaseDone : n === fase ? styles.phaseActive : "";
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
            <p style={{ marginTop: 20 }}>
              Controles de admin: avanzá de fase cuando se complete la actual. Las notas y el detalle de cada etapa
              se registran en la pestaña 📋 Seguimiento & Tareas.
            </p>
          </div>
        )}

        {tab === "informes" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Entregables técnicos & reportes de diagnóstico</h3>
            </div>
            <div className={styles.reportRow}>
              <div>
                <div className={styles.reportTitle}>Informe de Diagnóstico Inicial y Mapeo de Clima</div>
                <div className={styles.reportMeta}>Fecha de emisión: {hoy()} — Autor: {org.nombre}</div>
              </div>
              <button className={styles.btnPdf} onClick={() => downloadReport("Informe de Diagnóstico Inicial", reportDiagnostico())}>
                📄 Descargar PDF
              </button>
            </div>
            <div className={styles.reportRow}>
              <div>
                <div className={styles.reportTitle}>Reporte Trimestral de Avance y Métricas de Impacto</div>
                <div className={styles.reportMeta}>Fecha de emisión: {hoy()} — Dirigido a: Gerencia de RRHH y Dirección</div>
              </div>
              <button className={styles.btnPdf} onClick={() => downloadReport("Reporte Trimestral de Avance", reportAvance())}>
                📄 Descargar PDF
              </button>
            </div>
            <div className={styles.reportRow}>
              <div>
                <div className={styles.reportTitle}>Evaluación de Riesgos Psicosociales</div>
                <div className={styles.reportMeta}>Fecha de emisión: {hoy()} — Informe confidencial de counseling</div>
              </div>
              <button className={styles.btnPdf} onClick={() => downloadReport("Evaluación de Riesgos Psicosociales", reportRiesgos())}>
                📄 Descargar PDF
              </button>
            </div>
          </div>
        )}

        {tab === "agenda" && (
          <div className={styles.grid2}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>🗓️ Próximos talleres agendados</h3>
                <button className={styles.btnOutline} onClick={() => notify("Agenda de talleres en desarrollo")}>
                  + Agendar nuevo taller
                </button>
              </div>
              <p style={{ marginBottom: 12 }}>Cronograma de intervenciones grupales de {active?.nombre ?? "—"}.</p>
              <p className={styles.empty}>No hay talleres agendados todavía.</p>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>💬 Bitácora & solicitudes de counseling</h3>
              </div>
              <p style={{ marginBottom: 12 }}>Sesiones individuales derivadas desde el equipo.</p>
              {derivaciones.length === 0 ? (
                <p className={styles.empty}>Todavía no hay solicitudes de counseling.</p>
              ) : (
                derivaciones.map((d) => (
                  <div key={d.id} className={styles.agendaItem}>
                    <strong>Sesión confidencial — {d.persona}</strong>
                    <div className={styles.agendaWhen}>
                      Temas: {(d.temas ?? []).join(", ")} · Profesional: {d.counselor ?? "a designar"} · Derivado por {d.quien_deriva}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "seguimiento" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h3>Seguimiento & anotaciones por tarea</h3>
                <p>Registrá avances, acuerdos y observaciones de la intervención.</p>
              </div>
              <button className={styles.btn} onClick={() => setModal({ type: "tarea" })}>
                + Nueva tarea
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className={styles.empty}>No hay tareas cargadas para este cliente.</p>
            ) : (
              tasks.map((t) => {
                const est = ESTADOS_TAREA[t.estado] ?? ESTADOS_TAREA.pendiente;
                const nextEstado = t.estado === "pendiente" ? "encurso" : t.estado === "encurso" ? "completada" : "pendiente";
                return (
                  <div key={t.id} className={styles.taskRow}>
                    <div className={styles.taskHead}>
                      <div className={styles.taskTitle}>{t.titulo}</div>
                      <span
                        className={`${styles.badge} ${styles[est.cls as "badgePend"]}`}
                        title="Click para cambiar estado"
                        onClick={() => changeTaskState(t.id, nextEstado)}
                      >
                        {est.label}
                      </span>
                    </div>
                    {(t.anotaciones ?? []).length > 0 && (
                      <div className={styles.anotList}>
                        {(t.anotaciones as string[]).map((a, i) => (
                          <div key={i} className={styles.anot}>
                            {a}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.anotForm}>
                      <input id={`anot-${t.id}`} className={styles.anotInput} placeholder="Agregar anotación de seguimiento…" />
                      <button className={styles.btnOutline} onClick={() => addAnotacion(t.id)}>
                        Agregar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "empleados" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Empleados con ficha personal</h3>
              <button className={styles.btn} onClick={() => setModal({ type: "empleado" })}>
                + Cargar Empleado
              </button>
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
                      <button className={styles.btnOutline} onClick={() => setModal({ type: "fichaEmpleado", data: e })}>
                        👤 Ficha
                      </button>
                      <button className={styles.btn} onClick={() => setModal({ type: "derivar", data: e })}>
                        ↗ Derivar a Newen
                      </button>
                      <button className={styles.btnOutline} onClick={() => openMensajes(e)}>
                        💬 Mensajes
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
                {modal.type === "archivados" && "Clientes archivados"}
                {modal.type === "empleado" && "+ Cargar Empleado"}
                {modal.type === "fichaEmpleado" && `Ficha personal · ${modal.data?.nombre}`}
                {modal.type === "derivar" && `Derivar a Newen · ${modal.data?.nombre}`}
                {modal.type === "mensajes" && `Mensajes · ${modal.data?.nombre}`}
                {modal.type === "tarea" && "+ Nueva tarea de seguimiento"}
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
                    ¿Archivar <strong style={{ color: "var(--ec-ac)" }}>{active.nombre}</strong>? Dejará de aparecer
                    en la lista activa pero quedará guardado.
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

              {modal.type === "archivados" && (
                <>
                  {archived.length === 0 ? (
                    <p className={styles.empty}>No hay clientes archivados.</p>
                  ) : (
                    archived.map((c) => (
                      <div key={c.id} className={styles.reportRow}>
                        <div className={styles.reportTitle}>{c.nombre}</div>
                        <button className={styles.btnOutline} onClick={() => restaurarCliente(c.id)}>
                          Restaurar
                        </button>
                      </div>
                    ))
                  )}
                  <div className={styles.modalFooter}>
                    <button className={styles.btn} onClick={() => setModal(null)}>
                      Cerrar
                    </button>
                  </div>
                </>
              )}

              {modal.type === "empleado" && (
                <>
                  <div className={styles.grid2form}>
                    <div className={styles.field}>
                      <label>Nombre y apellido</label>
                      <input id="ne-nombre" placeholder="Ej: Rodrigo Ferreyra" />
                    </div>
                    <div className={styles.field}>
                      <label>Área</label>
                      <input id="ne-area" placeholder="Ej: Operaciones" />
                    </div>
                    <div className={styles.field}>
                      <label>Rol</label>
                      <input id="ne-rol" placeholder="Ej: Líder de Operaciones" />
                    </div>
                    <div className={styles.field}>
                      <label>Avance (%)</label>
                      <input id="ne-avance" type="number" min={0} max={100} defaultValue={0} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Situación / contexto</label>
                    <textarea id="ne-situacion" placeholder="Descripción de la situación de la persona…" />
                  </div>
                  <div className={styles.field}>
                    <label>Notas</label>
                    <textarea id="ne-notas" placeholder="Notas internas de seguimiento…" />
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button className={styles.btn} onClick={saveEmpleado}>
                      Guardar
                    </button>
                  </div>
                </>
              )}

              {modal.type === "fichaEmpleado" && modal.data && (
                <>
                  <div className={styles.grid2form}>
                    <div className={styles.empFichaItem}>
                      <div className={styles.empFichaK}>Empleado</div>
                      <div className={styles.empFichaV}>{modal.data.nombre}</div>
                    </div>
                    <div className={styles.empFichaItem}>
                      <div className={styles.empFichaK}>Área</div>
                      <div className={styles.empFichaV}>{modal.data.area ?? "—"}</div>
                    </div>
                    <div className={styles.empFichaItem}>
                      <div className={styles.empFichaK}>Rol</div>
                      <div className={styles.empFichaV}>{modal.data.rol ?? "—"}</div>
                    </div>
                    <div className={styles.empFichaItem}>
                      <div className={styles.empFichaK}>Avance</div>
                      <div className={styles.empFichaV}>{modal.data.avance ?? 0}%</div>
                    </div>
                  </div>
                  <div className={styles.field} style={{ marginTop: 14 }}>
                    <label>Situación / contexto</label>
                    <div className={styles.empFichaV} style={{ fontSize: 12.5, color: "var(--ec-muted)" }}>
                      {modal.data.situacion ?? "—"}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Notas</label>
                    <div className={styles.empFichaV} style={{ fontSize: 12.5, color: "var(--ec-muted)" }}>
                      {modal.data.notas ?? "—"}
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btn} onClick={() => setModal(null)}>
                      Cerrar
                    </button>
                  </div>
                </>
              )}

              {modal.type === "derivar" && (
                <>
                  <p style={{ marginBottom: 14 }}>
                    Elegí los temas a tratar. Sugerimos un counselor específico y la persona recibe un acceso para
                    seleccionarlo en Newen.
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

              {modal.type === "mensajes" && (
                <>
                  {derivsEmp.length === 0 ? (
                    <p className={styles.empty}>
                      Esta persona todavía no tiene derivaciones. Primero usá «↗ Derivar a Newen».
                    </p>
                  ) : (
                    <>
                      <div className={styles.field}>
                        <label>Derivación</label>
                        <select
                          className={styles.select}
                          style={{ width: "100%", background: "#0d0b09", color: "var(--ec-text)", border: "1px solid var(--ec-panel-border)", padding: 9, borderRadius: 6 }}
                          value={selDerivId}
                          onChange={async (e) => {
                            setSelDerivId(e.target.value);
                            await loadMsgs(e.target.value);
                          }}
                        >
                          {derivsEmp.map((d) => (
                            <option key={d.id} value={d.id}>
                              {(d.temas ?? []).join(", ")} — {d.counselor ?? "a designar"}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(() => {
                        const d = derivsEmp.find((x) => x.id === selDerivId);
                        return d ? (
                          <div className={styles.derivBox}>
                            <strong>Caso:</strong> {d.caso ?? "Sin descripción"} · <strong>Derivado por:</strong> {d.quien_deriva}
                          </div>
                        ) : null;
                      })()}
                      <div className={styles.msgThread}>
                        {msgs.length === 0 ? (
                          <p className={styles.empty}>Sin mensajes todavía. Escribí el primero.</p>
                        ) : (
                          msgs.map((m) => (
                            <div key={m.id} className={`${styles.msgBubble} ${m.de === "espacio" ? styles.msgMe : styles.msgOther}`}>
                              {m.texto}
                              <div className={styles.msgMeta}>
                                {m.de === "espacio" ? "Vos" : "Profesional"} · {new Date(m.created_at).toLocaleString("es-AR")}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className={styles.msgForm}>
                        <input
                          className={styles.anotInput}
                          placeholder="Escribí un mensaje al profesional…"
                          value={msgInput}
                          onChange={(e) => setMsgInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
                        />
                        <button className={styles.btn} onClick={enviarMensaje}>
                          Enviar
                        </button>
                      </div>
                    </>
                  )}
                  <div className={styles.modalFooter}>
                    <button className={styles.btn} onClick={() => setModal(null)}>
                      Cerrar
                    </button>
                  </div>
                </>
              )}

              {modal.type === "tarea" && (
                <>
                  <div className={styles.field}>
                    <label>Título de la tarea</label>
                    <input id="nt-titulo" placeholder="Ej: Diagnóstico de clima — mandos medios" />
                  </div>
                  <div className={styles.field}>
                    <label>Estado inicial</label>
                    <select id="nt-estado" className={styles.select} style={{ width: "100%", background: "#0d0b09", color: "var(--ec-text)", border: "1px solid var(--ec-panel-border)", padding: 9, borderRadius: 6 }} defaultValue="pendiente">
                      <option value="pendiente">Pendiente</option>
                      <option value="encurso">En curso</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnOutline} onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button className={styles.btn} onClick={saveTarea}>
                      Crear tarea
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
