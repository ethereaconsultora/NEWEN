"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../../empresa.module.css";

const JITSI_BASE = process.env.NEXT_PUBLIC_JITSI_BASE || "https://meet.jit.si";

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Section =
  | "inicio"
  | "recorrido"
  | "biblioteca"
  | "comunidad"
  | "supervision"
  | "practicas"
  | "encuentros";

const SECCIONES: { id: Section; label: string; icon: string }[] = [
  { id: "inicio", label: "Inicio", icon: "🏠" },
  { id: "recorrido", label: "Mi recorrido", icon: "🧭" },
  { id: "biblioteca", label: "Biblioteca", icon: "📚" },
  { id: "comunidad", label: "Comunidad", icon: "👥" },
  { id: "supervision", label: "Supervisión", icon: "🩺" },
  { id: "practicas", label: "Prácticas", icon: "🧩" },
  { id: "encuentros", label: "Encuentros", icon: "📅" },
];

const TIPO_LABEL: Record<string, string> = {
  taller: "Taller",
  encuentro: "Encuentro",
  sesion: "Sesión 1-1",
  practica: "Práctica",
};

const ESTADO_LABEL: Record<string, string> = {
  programado: "Programado",
  en_vivo: "En vivo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export default function CampusPage() {
  const supabase = createClient();
  const [org, setOrg] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [section, setSection] = useState<Section>("inicio");
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<{ titulo: string; room: string; kind: "jitsi" | "daily" } | null>(null);
  const [dailyUrl, setDailyUrl] = useState("");
  const [creatingDaily, setCreatingDaily] = useState(false);
  const [showAgendar, setShowAgendar] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function notify(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/organizations/mine");
    const data = await res.json().catch(() => ({ org: null }));
    const o = data.org;
    setOrg(o ?? null);
    if (o) {
      const [c, en, enc] = await Promise.all([
        supabase.from("campus_courses").select("*").eq("organization_id", o.id).order("titulo"),
        supabase
          .from("campus_enrollments")
          .select("*")
          .eq("organization_id", o.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("campus_encuentros")
          .select("*")
          .eq("organization_id", o.id)
          .order("fecha", { ascending: false }),
      ]);
      const coursesData = c.data ?? [];
      const enData = en.data ?? [];
      setCourses(coursesData);
      setEnrollments(enData);
      setEncounters(enc.data ?? []);
      if (coursesData.length) {
        const { data: mods } = await supabase
          .from("campus_modules")
          .select("*")
          .in("course_id", coursesData.map((x) => x.id))
          .order("orden");
        setModules(mods ?? []);
      } else {
        setModules([]);
      }
      if (enData.length) {
        const { data: prog } = await supabase
          .from("campus_progress")
          .select("*")
          .in("enrollment_id", enData.map((x) => x.id));
        setProgress(prog ?? []);
      } else {
        setProgress([]);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function avanceDe(enroll: any): number {
    const mods = modules.filter((m) => m.course_id === enroll.course_id);
    const total = mods.length;
    if (!total) return 0;
    const done = progress.filter((p) => p.enrollment_id === enroll.id && p.completado).length;
    return Math.round((done / total) * 100);
  }

  async function abrirSala(enc: any) {
    if (enc.room_type === "jitsi") {
      setRoom({ titulo: enc.titulo, room: enc.room_slug, kind: "jitsi" });
      return;
    }
    // Daily.co (1-1): creamos la sala vía API y la abrimos cuando está lista.
    setCreatingDaily(true);
    setDailyUrl("");
    setRoom({ titulo: enc.titulo, room: enc.room_slug, kind: "daily" });
    const res = await fetch("/api/daily/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: enc.room_slug }),
    });
    const data = await res.json();
    setCreatingDaily(false);
    if (!res.ok) {
      setRoom(null);
      notify(data.error || "No se pudo abrir la sala 1-1.");
      return;
    }
    setDailyUrl(data.url);
  }

  async function guardarEncuentro() {
    const titulo = (document.getElementById("ce-titulo") as HTMLInputElement)?.value?.trim();
    if (!titulo) {
      notify("Ingresá el título del encuentro");
      return;
    }
    const fecha = (document.getElementById("ce-fecha") as HTMLInputElement)?.value || null;
    const hora = (document.getElementById("ce-hora") as HTMLInputElement)?.value || null;
    const tipo = (document.getElementById("ce-tipo") as HTMLSelectElement)?.value || "encuentro";
    const room_type = (document.getElementById("ce-room") as HTMLSelectElement)?.value || "jitsi";
    const duracion = parseInt((document.getElementById("ce-duracion") as HTMLInputElement)?.value || "60", 10) || 60;
    const descripcion = (document.getElementById("ce-desc") as HTMLTextAreaElement)?.value?.trim() || null;
    const room_slug = slugify(`${org.slug}-${titulo}`).slice(0, 60);

    const { error } = await supabase.from("campus_encuentros").insert({
      organization_id: org.id,
      titulo,
      tipo,
      room_type,
      room_slug,
      fecha,
      hora,
      duracion_min: duracion,
      descripcion,
    });
    if (error) {
      notify("Error al programar: " + error.message);
      return;
    }
    setShowAgendar(false);
    await load();
    notify("Encuentro programado");
  }

  if (loading) {
    return (
      <div style={{ background: "#f5f4ef", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className={styles.root}>
        <div className={styles.content}>
          <div className={styles.panel}>
            <h3>Sin organización vinculada</h3>
            <p style={{ marginTop: 8 }}>El campus necesita un espacio comercial activo. Creá el tuyo:</p>
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link className={styles.btn} href="/empresas/crear">
                + Crear mi espacio
              </Link>
              <Link className={styles.btnOutline} href="/empresa">
                ← Volver al workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cursoDe = (id: string) => courses.find((c) => c.id === id);
  const modulosDe = (id: string) => modules.filter((m) => m.course_id === id);
  const activos = enrollments.filter((x) => x.estado === "activa").length;
  const horas = courses.reduce((s, c) => s + (c.duracion_hs || 0), 0);
  const certificados = enrollments.filter((x) => x.estado === "completada").length;
  const progresoGlobal = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + avanceDe(e), 0) / enrollments.length)
    : 0;
  const proximos = encounters.filter((x) => x.estado === "programado" || x.estado === "en_vivo").slice(0, 4);

  return (
    <div className={styles.cvWrap}>
      {/* Topbar */}
      <div className={styles.cvTop}>
        <div className={styles.cvBrand}>
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.nombre} className={styles.cvLogo} />
          ) : (
            <div className={styles.cvLogo}>{(org.nombre ?? "E").charAt(0)}</div>
          )}
          <div>
            <div className={styles.cvBrandTitle}>Campus {org.nombre}</div>
            <div className={styles.cvBrandSub}>Formación organizacional · vinculado a newen</div>
          </div>
        </div>
        <div className={styles.cvChip}>
          ← <Link href={`/e/${org.slug}`}>Volver al espacio</Link> · <Link href="/empresa">Panel</Link>
        </div>
      </div>

      <div className={styles.cvGrid}>
        {/* Sidebar */}
        <aside className={styles.cvSide}>
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={`${styles.cvSideItem}${section === s.id ? ` ${styles.cvSideItemActive}` : ""}`}
              onClick={() => setSection(s.id)}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
          <div className={styles.cvSideFoot}>
            <strong>Contacto</strong>
            <br />
            {org.email || "—"}
          </div>
        </aside>

        {/* Main */}
        <main className={styles.cvMain}>
          {section === "inicio" && (
            <>
              <div className={styles.cvBanner}>
                <div className={styles.cvBannerIcon}>🎓</div>
                <div>
                  <h2>Tu campus digital está activo</h2>
                  <p>
                    Cursos, rutas de aprendizaje, encuentros con video y certificaciones para los equipos de tu
                    organización. Las salas grupales usan Jitsi; las sesiones 1-1 usan Daily.co.
                  </p>
                </div>
              </div>

              <div className={styles.cvHero}>
                <div>
                  <div className={styles.cvEyebrow}>Bienvenido · {org.nombre}</div>
                  <h1>Campus para formación continua de equipos</h1>
                  <p>
                    Gestioná rutas de aprendizaje, sesiones en vivo, seguimiento de progreso y certificaciones
                    desde un único campus digital.
                  </p>
                </div>
                <div className={styles.cvStats}>
                  <div className={styles.cvStat}>
                    <span className={styles.cvStatNum}>{activos}</span>
                    <span className={styles.cvStatLabel}>Inscriptos</span>
                  </div>
                  <div className={styles.cvStat}>
                    <span className={styles.cvStatNum}>{horas}</span>
                    <span className={styles.cvStatLabel}>Horas</span>
                  </div>
                  <div className={styles.cvStat}>
                    <span className={styles.cvStatNum}>{certificados}</span>
                    <span className={styles.cvStatLabel}>Certificados</span>
                  </div>
                </div>
              </div>

              <div className={styles.cvCards}>
                <div className={styles.cvCard}>
                  <h3>Próximos encuentros</h3>
                  <ul>
                    {proximos.length ? (
                      proximos.map((e) => (
                        <li key={e.id}>
                          {e.titulo} — {e.fecha || "fecha a definir"} {e.hora ? `· ${e.hora}` : ""}
                        </li>
                      ))
                    ) : (
                      <li>Sin encuentros programados todavía.</li>
                    )}
                  </ul>
                </div>
                <div className={styles.cvCard}>
                  <h3>Progreso del plan</h3>
                  <div className={styles.cvProgress}>
                    <strong>{progresoGlobal}%</strong>
                    <div className={styles.cvProgressBar}>
                      <i style={{ width: `${progresoGlobal}%` }} />
                    </div>
                  </div>
                  <ul style={{ marginTop: 14 }}>
                    <li>Inscriptos en {enrollments.length} curso(s)</li>
                    <li>{courses.length} curso(s) en biblioteca</li>
                    <li>{encounters.length} encuentro(s) agendados</li>
                  </ul>
                </div>
                <div className={styles.cvCard}>
                  <h3>Actividad reciente</h3>
                  <ul>
                    <li>{courses.length ? `Curso «${courses[0].titulo}» publicado` : "Aún no hay cursos publicados"}</li>
                    <li>Módulos totales: {modules.length}</li>
                    <li>
                      <button
                        className={styles.cvBtnGhost}
                        onClick={() => setSection("encuentros")}
                        style={{ border: "none", padding: 0, fontSize: 12.5 }}
                      >
                        Ir a encuentros →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {section === "recorrido" && (
            <div className={styles.cvCard}>
              <h3>🧭 Mi recorrido</h3>
              {enrollments.length === 0 ? (
                <p className={styles.cvEmpty}>
                  Todavía no hay inscriptos en cursos. Los equipos se anotan desde la Biblioteca.
                </p>
              ) : (
                enrollments.map((en) => {
                  const curso = cursoDe(en.course_id);
                  const av = avanceDe(en);
                  return (
                    <div key={en.id} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px dashed #e3e7e0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <strong style={{ color: "#1f2a24", fontSize: 14 }}>
                          {curso?.titulo ?? "Curso"} · {en.persona}
                        </strong>
                        <span
                          style={{
                            fontSize: 10.5,
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: en.estado === "activa" ? "#e8efe7" : en.estado === "completada" ? "#dce8dc" : "#f1efe9",
                            color: "#2f5c3d",
                          }}
                        >
                          {en.estado}
                        </span>
                      </div>
                      <div className={styles.cvProgress} style={{ marginTop: 10 }}>
                        <strong style={{ fontSize: 18 }}>{av}%</strong>
                        <div className={styles.cvProgressBar}>
                          <i style={{ width: `${av}%` }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#7d8a80", marginTop: 6 }}>
                        {modulosDe(en.course_id).length} módulos ·{" "}
                        {modulosDe(en.course_id).filter((m) =>
                          progress.find((p) => p.enrollment_id === en.id && p.module_id === m.id && p.completado)
                        ).length}{" "}
                        completados
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {section === "biblioteca" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: "#1f2a24", fontSize: 16 }}>📚 Biblioteca de cursos</h3>
                <span style={{ fontSize: 12, color: "#7d8a80" }}>{courses.length} curso(s)</span>
              </div>
              {courses.length === 0 ? (
                <p className={styles.cvEmpty}>
                  No hay cursos todavía. La biblioteca se carga desde la configuración del campus.
                </p>
              ) : (
                <div className={styles.cvCourseGrid}>
                  {courses.map((c) => (
                    <div key={c.id} className={styles.cvCourse}>
                      <div className={styles.cvCourseIcon}>{c.icono || "🎓"}</div>
                      <div className={styles.cvCourseTitle}>{c.titulo}</div>
                      <div className={styles.cvCourseDesc}>{c.descripcion || "Sin descripción."}</div>
                      <div className={styles.cvCourseMeta}>
                        {modulosDe(c.id).length} módulos · {c.duracion_hs || 0} hs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {section === "comunidad" && (
            <div className={styles.cvCard}>
              <h3>👥 Comunidad</h3>
              <p className={styles.cvEmpty} style={{ marginBottom: 16 }}>
                Espacio de intercambio entre equipos y profesionales del campus. Acá se listarán los próximos
                encuentros abiertos.
              </p>
              {proximos.map((e) => (
                <div key={e.id} className={styles.cvRoomCard}>
                  <div>
                    <div className={styles.cvRoomTitle}>{e.titulo}</div>
                    <div className={styles.cvRoomMeta}>
                      {TIPO_LABEL[e.tipo] ?? e.tipo} · {e.fecha || "fecha a definir"} {e.hora ? `· ${e.hora}` : ""} ·{" "}
                      {ESTADO_LABEL[e.estado] ?? e.estado}
                    </div>
                  </div>
                  <div className={styles.cvRoomActions}>
                    <button className={styles.cvBtn} onClick={() => abrirSala(e)}>
                      Ingresar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "supervision" && (
            <div className={styles.cvCard}>
              <h3>🩺 Supervisión</h3>
              <p className={styles.cvEmpty}>
                Supervisión profesional de casos y prácticas de counseling. Las sesiones 1-1 se realizan por
                videollamada (Daily.co) desde el panel del profesional.
              </p>
            </div>
          )}

          {section === "practicas" && (
            <div className={styles.cvCard}>
              <h3>🧩 Prácticas</h3>
              <p className={styles.cvEmpty}>
                Espacio para prácticas y materiales de aplicación. Los encuentros de práctica usan salas Jitsi
                del campus.
              </p>
            </div>
          )}

          {section === "encuentros" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h3 style={{ color: "#1f2a24", fontSize: 16 }}>📅 Encuentros y sesiones</h3>
                <button className={styles.cvBtn} onClick={() => setShowAgendar(true)}>
                  + Agendar encuentro
                </button>
              </div>
              {encounters.length === 0 ? (
                <p className={styles.cvEmpty}>No hay encuentros agendados. Programá el primero.</p>
              ) : (
                encounters.map((e) => (
                  <div key={e.id} className={styles.cvRoomCard}>
                    <div>
                      <div className={styles.cvRoomTitle}>
                        {e.titulo}{" "}
                        <span style={{ fontSize: 10.5, color: e.room_type === "daily" ? "#b0773a" : "#3f6b4e", fontWeight: 600 }}>
                          {e.room_type === "daily" ? "· 1-1 (Daily)" : "· Grupal (Jitsi)"}
                        </span>
                      </div>
                      <div className={styles.cvRoomMeta}>
                        {TIPO_LABEL[e.tipo] ?? e.tipo} · {e.fecha || "fecha a definir"} {e.hora ? `· ${e.hora}` : ""} ·{" "}
                        {e.duracion_min || 60} min · {ESTADO_LABEL[e.estado] ?? e.estado}
                      </div>
                      {e.descripcion && <div className={styles.cvRoomMeta}>{e.descripcion}</div>}
                    </div>
                    <div className={styles.cvRoomActions}>
                      <button className={styles.cvBtn} onClick={() => abrirSala(e)}>
                        ▶ Ingresar a sala
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal de sala */}
      {room && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,22,18,0.9)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setRoom(null)}
        >
          <div style={{ width: "100%", maxWidth: 1000, background: "#fff", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #e3e7e0" }}>
              <strong style={{ color: "#1f2a24", fontSize: 14 }}>
                {room.kind === "daily" ? "📞 " : "🎥 "}
                {room.titulo}
              </strong>
              <button
                onClick={() => setRoom(null)}
                style={{ background: "none", border: "none", fontSize: 18, color: "#7d8a80", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {room.kind === "jitsi" ? (
                <>
                  <div className={styles.cvRoomMetaBox}>
                    Sala grupal (Jitsi). Compartí la sala con los participantes del encuentro.
                  </div>
                  <iframe
                    src={`${JITSI_BASE}/${room.room}`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                    className={styles.cvRoomFrame}
                    allowFullScreen
                  />
                </>
              ) : creatingDaily ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#4a5d4f" }}>
                  <span className="spinner" />
                  <p style={{ marginTop: 12, fontSize: 13 }}>Creando sala 1-1 en Daily.co…</p>
                </div>
              ) : dailyUrl ? (
                <>
                  <div className={styles.cvRoomMetaBox}>
                    Sesión 1-1 (Daily.co). Compartí esta sala con la persona indicada.
                  </div>
                  <iframe
                    src={dailyUrl}
                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                    className={styles.cvRoomFrame}
                    allowFullScreen
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal agendar */}
      {showAgendar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,22,18,0.9)",
            zIndex: 120,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 16px",
            overflowY: "auto",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAgendar(false)}
        >
          <div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #e3e7e0" }}>
              <strong style={{ color: "#1f2a24", fontSize: 14 }}>+ Agendar encuentro</strong>
              <button onClick={() => setShowAgendar(false)} style={{ background: "none", border: "none", fontSize: 18, color: "#7d8a80", cursor: "pointer" }}>
                ✕
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div className={styles.cvField}>
                <label>Título *</label>
                <input id="ce-titulo" placeholder="Ej: Taller de liderazgo sostenible" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.cvField}>
                  <label>Fecha</label>
                  <input id="ce-fecha" type="date" />
                </div>
                <div className={styles.cvField}>
                  <label>Hora</label>
                  <input id="ce-hora" type="time" />
                </div>
                <div className={styles.cvField}>
                  <label>Tipo</label>
                  <select id="ce-tipo" defaultValue="encuentro">
                    <option value="taller">Taller</option>
                    <option value="encuentro">Encuentro</option>
                    <option value="sesion">Sesión 1-1</option>
                    <option value="practica">Práctica</option>
                  </select>
                </div>
                <div className={styles.cvField}>
                  <label>Sala de video</label>
                  <select id="ce-room" defaultValue="jitsi">
                    <option value="jitsi">Grupal (Jitsi)</option>
                    <option value="daily">1-1 (Daily.co)</option>
                  </select>
                </div>
              </div>
              <div className={styles.cvField}>
                <label>Duración (min)</label>
                <input id="ce-duracion" type="number" min={15} step={15} defaultValue={60} />
              </div>
              <div className={styles.cvField}>
                <label>Descripción</label>
                <textarea id="ce-desc" placeholder="Temario, participantes, material…" />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button className={styles.cvBtnGhost} onClick={() => setShowAgendar(false)}>
                  Cancelar
                </button>
                <button className={styles.cvBtn} onClick={guardarEncuentro}>
                  Programar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#3f6b4e",
            color: "#fff",
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
    </div>
  );
}
