"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./campus.module.css";

const JITSI_BASE = process.env.NEXT_PUBLIC_JITSI_BASE || "https://meet.jit.si";

const SERIF = "'Merriweather', Georgia, serif";

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cortarFecha(f: string) {
  if (!f) return "Fecha a definir";
  const d = new Date(f + "T00:00:00");
  if (isNaN(d.getTime())) return f;
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

type Section =
  | "inicio"
  | "recorrido"
  | "experiencia"
  | "comunidad"
  | "biblioteca"
  | "supervision"
  | "practicas"
  | "investigacion"
  | "encuentros"
  | "lenguaje";

const SECCIONES: { id: Section; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "recorrido", label: "Mi recorrido" },
  { id: "experiencia", label: "Mi experiencia" },
  { id: "comunidad", label: "Comunidad" },
  { id: "biblioteca", label: "Biblioteca" },
  { id: "supervision", label: "Supervisión" },
  { id: "practicas", label: "Prácticas" },
  { id: "investigacion", label: "Investigación" },
  { id: "encuentros", label: "Encuentros" },
  { id: "lenguaje", label: "El lenguaje también educa" },
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

const CATEGORIAS_FALLBACK = ["Material teórico", "Casos prácticos", "Investigaciones", "Multimedia"];

export default function CampusPage() {
  const supabase = createClient();
  const [org, setOrg] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [section, setSection] = useState<Section>("inicio");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<{ titulo: string; room: string } | null>(null);
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
        supabase.from("campus_enrollments").select("*").eq("organization_id", o.id).order("created_at", { ascending: false }),
        supabase.from("campus_encuentros").select("*").eq("organization_id", o.id).order("fecha", { ascending: false }),
      ]);
      const coursesData = c.data ?? [];
      const enData = en.data ?? [];
      setCourses(coursesData);
      setEnrollments(enData);
      setEncounters(enc.data ?? []);
      if (coursesData.length) {
        const { data: mods } = await supabase.from("campus_modules").select("*").in("course_id", coursesData.map((x) => x.id)).order("orden");
        setModules(mods ?? []);
      } else {
        setModules([]);
      }
      if (enData.length) {
        const { data: prog } = await supabase.from("campus_progress").select("*").in("enrollment_id", enData.map((x) => x.id));
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

  function abrirSala(enc: any) {
    setRoom({ titulo: enc.titulo, room: enc.room_slug });
  }

  function copiarLink(room: string) {
    const url = `${window.location.origin}/sala/${room}`;
    navigator.clipboard?.writeText(url);
    notify("Link del espacio copiado: " + url);
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
    const duracion = parseInt((document.getElementById("ce-duracion") as HTMLInputElement)?.value || "60", 10) || 60;
    const descripcion = (document.getElementById("ce-desc") as HTMLTextAreaElement)?.value?.trim() || null;
    const room_slug = slugify(`${org.slug}-${titulo}`).slice(0, 60);

    const { error } = await supabase.from("campus_encuentros").insert({
      organization_id: org.id,
      titulo,
      tipo,
      room_type: "jitsi",
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
      <div className={styles.spinnerWrap}>
        <span className="spinner" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className={styles.spinnerWrap} style={{ padding: 24 }}>
        <div className={`${styles.modal} ${styles.modalNarrow}`} style={{ textAlign: "center" }}>
          <div className={styles.modalBody}>
            <h2 style={{ fontFamily: SERIF, marginBottom: 8, color: "#2e4a3d", fontWeight: 400 }}>Sin organización vinculada</h2>
            <p style={{ color: "#4a5d4f", marginBottom: 16 }}>El campus necesita un espacio comercial activo. Creá el tuyo:</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/empresas/crear" className={`${styles.button} ${styles.primary}`}>+ Crear mi espacio</Link>
              <Link href="/empresa" className={`${styles.button} ${styles.secondary}`}>← Volver al workspace</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cursoDe = (id: string) => courses.find((c) => c.id === id);
  const modulosDe = (id: string) => modules.filter((m) => m.course_id === id);
  const horas = courses.reduce((s, c) => s + (c.duracion_hs || 0), 0);
  const certificados = enrollments.filter((x) => x.estado === "completada").length;
  const progresoGlobal = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + avanceDe(e), 0) / enrollments.length) : 0;
  const proximos = encounters.filter((x) => x.estado === "programado" || x.estado === "en_vivo");
  const cursosFiltrados = courses.filter((c) => (c.titulo + " " + (c.descripcion || "")).toLowerCase().includes(q.toLowerCase()));
  const categorias = courses.length
    ? Array.from(new Set(courses.map((c) => c.icono || c.categoria || "Sin categoría").filter(Boolean)))
    : CATEGORIAS_FALLBACK;
  const destacado = courses[0];
  const lecturasDestacadas = destacado ? modulosDe(destacado.id) : [];
  const lecturaActual = lecturasDestacadas[0];

  return (
    <div className={styles.campus}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <div className={styles.brandLogo}>CV</div>
          <div>
            <div className={styles.brandTitle}>Campus Virtual</div>
            <div className={styles.brandSubtitle}>Plataforma de formación de {org.nombre}</div>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <Link href="/empresa" className={styles.backLink}>← Panel</Link>
          <div className={styles.searchBox}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar curso, ruta o módulo"
            />
          </div>
          <div className={styles.profileChip}>
            <span className={styles.chipName}>{org.nombre}</span>
            <strong>Campus</strong>
          </div>
        </div>
      </header>

      <div className={styles.pageGrid}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSection(s.id);
                }}
                className={`${styles.navLink} ${section === s.id ? styles.active : ""}`}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <strong>Contacto</strong>
            {org.email || "—"}
          </div>
        </aside>

        {/* Main */}
        <main className={styles.content}>
          {/* INICIO */}
          {section === "inicio" && (
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>Bienvenido</span>
                <h1 className={styles.heroTitle}>Campus virtual para formación continua</h1>
                <p>
                  Gestiona cursos, sesiones en vivo, seguimiento de progreso y certificaciones desde un único
                  campus digital. Cada espacio de video (Jitsi) se accede de forma independiente con su propio link.
                </p>
                <div className={styles.heroButtons}>
                  <button className={`${styles.button} ${styles.primary}`} onClick={() => setSection("recorrido")}>Ver mi recorrido</button>
                  <button className={`${styles.button} ${styles.secondary}`} onClick={() => setSection("biblioteca")}>Explorar biblioteca</button>
                </div>
              </div>
              <div className={styles.heroStats}>
                {[
                  { n: courses.length, l: "Cursos activos" },
                  { n: horas, l: "Horas de formación" },
                  { n: certificados, l: "Certificaciones" },
                ].map((s) => (
                  <article key={s.l} className={styles.heroStat}>
                    <span>{s.n}</span>
                    <p>{s.l}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* RECORRIDO */}
          {section === "recorrido" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Mi recorrido</h2>
                  <p>Tu camino de aprendizaje, paso a paso.</p>
                </div>
                <button className={`${styles.button} ${styles.neutral}`}>Ver resumen</button>
              </header>
              <div className={styles.grid3}>
                <article className={`${styles.card} ${styles.cardTall}`}>
                  <h3>Actividad reciente</h3>
                  <ul>
                    {proximos.length ? (
                      proximos.slice(0, 3).map((e) => (
                        <li key={e.id}>{e.titulo} — {cortarFecha(e.fecha)}</li>
                      ))
                    ) : (
                      <li>Sin encuentros programados todavía.</li>
                    )}
                  </ul>
                </article>
                <article className={`${styles.card} ${styles.cardProgress}`}>
                  <h3>Progreso</h3>
                  <div className={styles.progressChart}>
                    <strong>{progresoGlobal}%</strong>
                    <span>de avance en tu plan</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div style={{ width: `${progresoGlobal}%` }} />
                  </div>
                </article>
                <article className={`${styles.card} ${styles.cardAlert}`}>
                  <h3>Recordatorio</h3>
                  <p>Completá el material de los cursos para recibir tu certificación.</p>
                </article>
              </div>
            </section>
          )}

          {/* EXPERIENCIA */}
          {section === "experiencia" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Mi experiencia</h2>
                  <p>Rutas de aprendizaje que se adaptan a tu momento profesional.</p>
                </div>
              </header>
              <div className={styles.grid3}>
                {courses.length ? (
                  courses.slice(0, 6).map((c) => (
                    <article key={c.id} className={`${styles.card} ${styles.routeCard}`}>
                      <h3>{c.titulo}</h3>
                      <p>{modulosDe(c.id).length} módulos · {c.duracion_hs || 0} horas</p>
                      <span>{c.icono || "Con constancia"}</span>
                    </article>
                  ))
                ) : (
                  <p style={{ color: "#4a5d4f" }}>Aún no hay cursos publicados.</p>
                )}
              </div>
            </section>
          )}

          {/* COMUNIDAD */}
          {section === "comunidad" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Comunidad</h2>
                  <p>Conectá con colegas, compartí experiencias y crecé en red.</p>
                </div>
              </header>
              <div className={styles.grid3}>
                <article className={styles.card}><h3>Encuentros abiertos</h3><p>{proximos.length} encuentros programados para la comunidad.</p></article>
                <article className={styles.card}><h3>Grupos de estudio</h3><p>Espacios por temática para profundizar la práctica.</p></article>
                <article className={styles.card}><h3>Mentorías</h3><p>Profesionales disponibles para acompañar procesos.</p></article>
              </div>
            </section>
          )}

          {/* BIBLIOTECA */}
          {section === "biblioteca" && (
            <section className={styles.section}>
              <div className={styles.split}>
                <div>
                  <header className={styles.sectionHeader}>
                    <div>
                      <h2>Biblioteca</h2>
                      <p>Material de estudio, lecturas y recursos para tu formación.</p>
                    </div>
                  </header>
                  <article className={styles.courseCard}>
                    <div className={styles.courseCardTop}>
                      <div>
                        <h3>Material destacado</h3>
                        <p>Guías, videos y lecturas organizadas por temática.</p>
                      </div>
                      <span className={styles.badge}>Nuevo</span>
                    </div>
                    <ol>
                      {lecturasDestacadas.length ? (
                        lecturasDestacadas.slice(0, 4).map((m) => <li key={m.id}>{m.titulo}</li>)
                      ) : (
                        <>
                          <li>Fundamentos y marco teórico</li>
                          <li>Casos de estudio</li>
                          <li>Lecturas complementarias</li>
                          <li>Recursos audiovisuales</li>
                        </>
                      )}
                    </ol>
                    <div className={styles.courseActions}>
                      <button className={`${styles.button} ${styles.primary}`} onClick={() => setSection("experiencia")}>Explorar biblioteca</button>
                      <button className={`${styles.button} ${styles.secondary}`}>Mis descargas</button>
                    </div>
                  </article>
                </div>
                <aside className={styles.courseSidebar}>
                  <div className={styles.sidebarBox}>
                    <h3>Categorías</h3>
                    <ul>
                      {categorias.slice(0, 5).map((cat) => <li key={cat}>{cat}</li>)}
                    </ul>
                  </div>
                  <div className={styles.sidebarBox}>
                    <h3>Lectura actual</h3>
                    <p>{lecturaActual ? `Capítulo: ${lecturaActual.titulo}` : "Capítulo 3: Metodología de trabajo"}</p>
                    <div className={`${styles.progressBar} ${styles.progressSmall}`}>
                      <div style={{ width: `${destacado ? avanceDe(enrollments.find((e) => e.course_id === destacado.id) || {}) || 45 : 45}%` }} />
                    </div>
                  </div>
                </aside>
              </div>

              {courses.length > 0 && (
                <div className={styles.courseGrid}>
                  {cursosFiltrados.map((c) => (
                    <article key={c.id} className={`${styles.card} ${styles.courseTile}`}>
                      <div className={styles.tileMark}>
                        {c.icono || (c.titulo ? c.titulo[0].toUpperCase() : "C")}
                      </div>
                      <h3>{c.titulo}</h3>
                      <p>{c.descripcion || "Sin descripción."}</p>
                      <span className={styles.meta}>{modulosDe(c.id).length} módulos · {c.duracion_hs || 0} hs</span>
                    </article>
                  ))}
                </div>
              )}
              {cursosFiltrados.length === 0 && (
                <p style={{ color: "#4a5d4f", marginTop: 16 }}>{q ? "Sin resultados para la búsqueda." : "No hay cursos todavía."}</p>
              )}
            </section>
          )}

          {/* SUPERVISIÓN */}
          {section === "supervision" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Supervisión</h2>
                  <p>Espacio de acompañamiento y revisión de tu práctica.</p>
                </div>
              </header>
              <div className={styles.grid2}>
                <article className={`${styles.card} ${styles.sessionCard}`}>
                  <h3>Próxima supervisión</h3>
                  <p className={styles.meta}>Las sesiones 1-1 se realizan por Jitsi desde el panel del profesional.</p>
                  <p><strong>Modo:</strong> Videollamada 1-1</p>
                  <button className={`${styles.button} ${styles.primary}`} onClick={() => setSection("encuentros")}>Agendar sesión</button>
                </article>
                <article className={`${styles.card} ${styles.sessionCard}`}>
                  <h3>Historial</h3>
                  <ul>
                    <li>Derivaciones a Newen registradas</li>
                    <li>Seguimiento por tarea en la bitácora</li>
                    <li>Plan de desarrollo activo</li>
                  </ul>
                </article>
              </div>
            </section>
          )}

          {/* PRÁCTICAS */}
          {section === "practicas" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Prácticas</h2>
                  <p>Ejercicios, simulaciones y actividades para integrar lo aprendido.</p>
                </div>
              </header>
              <div className={styles.grid3}>
                {[
                  { t: "Práctica guiada", d: "Ejercicios con devolución personalizada.", b: "Disponible" },
                  { t: "Simulaciones", d: "Escenarios reales para entrenar habilidades.", b: "Próximamente" },
                  { t: "Bitácora", d: "Registro personal de tu práctica profesional.", b: "Activa" },
                ].map((x) => (
                  <article key={x.t} className={`${styles.card} ${styles.routeCard}`}>
                    <h3>{x.t}</h3>
                    <p>{x.d}</p>
                    <span>{x.b}</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* INVESTIGACIÓN */}
          {section === "investigacion" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Investigación</h2>
                  <p>Producción de conocimiento, artículos y proyectos en curso.</p>
                </div>
              </header>
              <div className={styles.grid3}>
                {[
                  { n: courses.length, l: "Cursos activos" },
                  { n: modules.length, l: "Módulos publicados" },
                  { n: encounters.length, l: "Encuentros" },
                ].map((x) => (
                  <article key={x.l} className={`${styles.card} ${styles.reportCard}`}>
                    <strong>{x.n}</strong>
                    <p>{x.l}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ENCUENTROS */}
          {section === "encuentros" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>Encuentros</h2>
                  <p>Agenda de sesiones en vivo, talleres y eventos.</p>
                </div>
                <button className={`${styles.button} ${styles.primary}`} onClick={() => setShowAgendar(true)}>+ Agendar encuentro</button>
              </header>
              {encounters.length === 0 ? (
                <p style={{ color: "#4a5d4f" }}>No hay encuentros agendados. Programá el primero.</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {encounters.map((e) => (
                    <article key={e.id} className={`${styles.card} ${styles.encRow}`}>
                      <div>
                        <h3 style={{ marginBottom: 6 }}>{e.titulo}</h3>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>
                          {TIPO_LABEL[e.tipo] ?? e.tipo} · {cortarFecha(e.fecha)} {e.hora ? `· ${e.hora}` : ""} · {e.duracion_min || 60} min · {ESTADO_LABEL[e.estado] ?? e.estado} · Video (Jitsi)
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className={`${styles.button} ${styles.neutral}`} onClick={() => copiarLink(e.room_slug)}>Link del espacio</button>
                        <button className={`${styles.button} ${styles.primary}`} onClick={() => abrirSala(e)}>Unirse al encuentro</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* LENGUAJE */}
          {section === "lenguaje" && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div>
                  <h2>El lenguaje también educa</h2>
                  <p>Glosario, reflexiones y cuidado de las palabras en la práctica profesional.</p>
                </div>
              </header>
              <div className={styles.grid2}>
                <article className={styles.card}><h3>Glosario colaborativo</h3><p>Términos y conceptos clave construidos por la comunidad.</p></article>
                <article className={styles.card}><h3>Reflexiones</h3><ul><li>Nombrar es crear realidad</li><li>Lenguaje y vínculo profesional</li></ul></article>
              </div>
            </section>
          )}
        </main>
      </div>

      <footer className={styles.footer}>
        Campus de <strong style={{ color: "#3e5c4d" }}>{org.nombre}</strong> gestionado en Newen
      </footer>

      {/* Modal de sala */}
      {room && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setRoom(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <strong>{room.titulo}</strong>
              <button onClick={() => setRoom(null)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 12.5, color: "#4a5d4f" }}>El primero en ingresar es el <strong style={{ color: "#3e5c4d" }}>anfitrión/moderador</strong>.</span>
                <button className={`${styles.button} ${styles.neutral}`} onClick={() => copiarLink(room.room)}>Copiar link del espacio</button>
              </div>
              <iframe src={`${JITSI_BASE}/${room.room}`} allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write" style={{ width: "100%", height: "68vh", border: "none", borderRadius: 14 }} allowFullScreen />
            </div>
          </div>
        </div>
      )}

      {/* Modal agendar */}
      {showAgendar && (
        <div className={`${styles.overlay} ${styles.overlayScroll}`} onClick={(e) => e.target === e.currentTarget && setShowAgendar(false)}>
          <div className={`${styles.modal} ${styles.modalNarrow}`}>
            <div className={styles.modalHead}>
              <strong>+ Agendar encuentro</strong>
              <button onClick={() => setShowAgendar(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody} style={{ display: "grid", gap: 12 }}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Título *</label>
                <input id="ce-titulo" placeholder="Ej: Taller de liderazgo sostenible" className={styles.input} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.field}><label className={styles.fieldLabel}>Fecha</label><input id="ce-fecha" type="date" className={styles.input} /></div>
                <div className={styles.field}><label className={styles.fieldLabel}>Hora</label><input id="ce-hora" type="time" className={styles.input} /></div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tipo</label>
                <select id="ce-tipo" defaultValue="encuentro" className={styles.input}>
                  <option value="taller">Taller</option>
                  <option value="encuentro">Encuentro</option>
                  <option value="sesion">Sesión 1-1</option>
                  <option value="practica">Práctica</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Duración (min)</label>
                <input id="ce-duracion" type="number" min={15} step={15} defaultValue={60} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Descripción</label>
                <textarea id="ce-desc" placeholder="Temario, participantes, material…" className={styles.input} style={{ minHeight: 70 }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button className={`${styles.button} ${styles.neutral}`} onClick={() => setShowAgendar(false)}>Cancelar</button>
                <button className={`${styles.button} ${styles.primary}`} onClick={guardarEncuentro}>Programar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}
    </div>
  );
}
