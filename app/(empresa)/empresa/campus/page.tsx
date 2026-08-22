"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const JITSI_BASE = process.env.NEXT_PUBLIC_JITSI_BASE || "https://meet.jit.si";

const C = {
  bg: "#f0efe8",
  ink: "#2e4a3d",
  sub: "#4a5d4f",
  dim: "#6b7a6e",
  green: "#3e5c4d",
  greenSoft: "#e8efe7",
  line: "#dde3d6",
  card: "#ffffff",
  inner: "#f7f6f2",
  accent: "#c87d55",
  serif: "'Merriweather', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
};

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
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: C.sans }}>
        <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 28, maxWidth: 420, textAlign: "center" }}>
          <h2 style={{ fontFamily: C.serif, marginBottom: 8 }}>Sin organización vinculada</h2>
          <p style={{ color: C.sub, marginBottom: 16 }}>El campus necesita un espacio comercial activo. Creá el tuyo:</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/empresas/crear" style={btnPrimary}>+ Crear mi espacio</Link>
            <Link href="/empresa" style={btnSecondary}>← Volver al workspace</Link>
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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: C.sans }}>
      {/* Topbar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          padding: "20px 28px",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: C.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: C.greenSoft,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 15,
              color: C.green,
              overflow: "hidden",
            }}
          >
            CV
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Campus Virtual</div>
            <div style={{ fontSize: 13, color: C.sub }}>Plataforma de formación de {org.nombre}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: C.inner, borderRadius: 999, padding: "9px 14px", border: `1px solid ${C.line}` }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar curso, ruta o módulo"
              style={{ border: "none", background: "transparent", color: C.ink, outline: "none", width: 200, fontSize: 13, fontFamily: C.sans }}
            />
          </div>
          <Link href="/empresa" style={{ fontSize: 13, color: C.green, fontWeight: 600, textDecoration: "none" }}>
            ← Panel
          </Link>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 28, width: "min(1320px, 100% - 36px)", margin: "20px auto 40px" }}>
        {/* Sidebar */}
        <aside
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 20,
            border: `1px solid ${C.line}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            position: "sticky",
            top: 96,
            alignSelf: "start",
            height: "fit-content",
          }}
        >
          <nav style={{ display: "grid", gap: 6 }}>
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSection(s.id);
                }}
                style={{
                  display: "block",
                  padding: "11px 14px",
                  borderRadius: 12,
                  color: C.ink,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 13.5,
                  background: section === s.id ? C.bg : "transparent",
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid #e8e4dc`, fontSize: 12, color: C.sub }}>
            <strong style={{ display: "block", marginBottom: 6, color: C.ink }}>Contacto</strong>
            {org.email || "—"}
          </div>
        </aside>

        {/* Main */}
        <main style={{ display: "grid", gap: 24, alignContent: "start" }}>
          {/* INICIO */}
          {section === "inicio" && (
            <>
              <section style={{ display: "grid", gap: 24, padding: 30, background: "#eef1e8", borderRadius: 22, border: `1px solid ${C.line}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <div>
                  <span style={{ display: "inline-flex", background: "#dde8e0", color: C.green, fontSize: 11.5, fontWeight: 800, borderRadius: 999, padding: "6px 12px", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Bienvenido
                  </span>
                  <h1 style={{ margin: 0, fontSize: "clamp(26px,3vw,38px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.1 }}>
                    Campus virtual para formación continua
                  </h1>
                  <p style={{ maxWidth: 680, color: C.sub, margin: "14px 0 0", fontSize: 14 }}>
                    Gestiona cursos, sesiones en vivo, seguimiento de progreso y certificaciones desde un único
                    campus digital. Cada espacio de video (Jitsi) se accede de forma independiente con su propio link.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                    <button style={btnPrimary} onClick={() => setSection("recorrido")}>Ver mi recorrido</button>
                    <button style={btnSecondary} onClick={() => setSection("biblioteca")}>Explorar biblioteca</button>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
                  {[
                    { n: courses.length, l: "Cursos activos" },
                    { n: horas, l: "Horas de formación" },
                    { n: certificados, l: "Certificaciones" },
                  ].map((s) => (
                    <article key={s.l} style={{ padding: 20, borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                      <span style={{ display: "block", fontSize: 30, fontWeight: 800, color: C.accent }}>{s.n}</span>
                      <p style={{ margin: "8px 0 0", color: C.sub, fontSize: 13 }}>{s.l}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* RECORRIDO */}
          {section === "recorrido" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Mi recorrido</h2>
                  <p style={panelSub}>Tu camino de aprendizaje, paso a paso.</p>
                </div>
                <button style={btnNeutral}>Ver resumen</button>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
                <article style={{ ...card, minHeight: 200 }}>
                  <h3 style={cardTitle}>Actividad reciente</h3>
                  <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: C.sub, fontSize: 13 }}>
                    {proximos.length ? (
                      proximos.slice(0, 3).map((e) => (
                        <li key={e.id}>
                          {e.titulo} — {cortarFecha(e.fecha)}
                        </li>
                      ))
                    ) : (
                      <li>Sin encuentros programados todavía.</li>
                    )}
                  </ul>
                </article>
                <article style={{ ...card, display: "grid", gap: 14 }}>
                  <h3 style={cardTitle}>Progreso</h3>
                  <div>
                    <strong style={{ fontSize: 34, color: C.green }}>{progresoGlobal}%</strong>
                    <span style={{ display: "block", color: C.sub, fontSize: 12.5, marginTop: 4 }}>de avance en tu plan</span>
                  </div>
                  <div style={{ height: 10, background: "#e4eae1", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progresoGlobal}%`, background: C.green, borderRadius: 999 }} />
                  </div>
                </article>
                <article style={{ ...card, background: "#f7f5ef", borderColor: "#e6d9c7" }}>
                  <h3 style={cardTitle}>Recordatorio</h3>
                  <p style={{ color: C.sub, fontSize: 13 }}>Completá el material de los cursos para recibir tu certificación.</p>
                </article>
              </div>
            </section>
          )}

          {/* EXPERIENCIA */}
          {section === "experiencia" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Mi experiencia</h2>
                  <p style={panelSub}>Rutas de aprendizaje para tu organización.</p>
                </div>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
                {courses.length ? (
                  courses.slice(0, 6).map((c) => (
                    <article key={c.id} style={{ ...card, display: "grid", gap: 12, alignContent: "start" }}>
                      <h3 style={{ ...cardTitle, margin: 0 }}>{c.titulo}</h3>
                      <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{modulosDe(c.id).length} módulos · {c.duracion_hs || 0} horas</p>
                      <span style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, fontSize: 12, color: C.green, background: C.greenSoft, width: "fit-content" }}>
                        {c.icono || "Con constancia"}
                      </span>
                    </article>
                  ))
                ) : (
                  <p style={{ color: C.sub }}>Aún no hay cursos publicados.</p>
                )}
              </div>
            </section>
          )}

          {/* COMUNIDAD */}
          {section === "comunidad" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Comunidad</h2>
                  <p style={panelSub}>Intercambio entre equipos y profesionales del campus.</p>
                </div>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
                <article style={card}><h3 style={cardTitle}>Encuentros abiertos</h3><p style={{ color: C.sub, fontSize: 13 }}>{proximos.length} encuentros programados para la comunidad.</p></article>
                <article style={card}><h3 style={cardTitle}>Grupos de trabajo</h3><p style={{ color: C.sub, fontSize: 13 }}>Espacios por temática para profundizar la práctica.</p></article>
                <article style={card}><h3 style={cardTitle}>Mentorías</h3><p style={{ color: C.sub, fontSize: 13 }}>Profesionales disponibles para acompañar procesos.</p></article>
              </div>
            </section>
          )}

          {/* BIBLIOTECA */}
          {section === "biblioteca" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Biblioteca</h2>
                  <p style={panelSub}>Cursos y material de estudio del campus.</p>
                </div>
              </header>
              {cursosFiltrados.length === 0 ? (
                <p style={{ color: C.sub }}>{q ? "Sin resultados para la búsqueda." : "No hay cursos todavía."}</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
                  {cursosFiltrados.map((c) => (
                    <article key={c.id} style={card}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenSoft, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, color: C.green, marginBottom: 12 }}>
                        {c.icono || (c.titulo ? c.titulo[0].toUpperCase() : "C")}
                      </div>
                      <h3 style={cardTitle}>{c.titulo}</h3>
                      <p style={{ color: C.sub, fontSize: 13, margin: "8px 0 12px" }}>{c.descripcion || "Sin descripción."}</p>
                      <div style={{ fontSize: 12, color: C.dim }}>{modulosDe(c.id).length} módulos · {c.duracion_hs || 0} hs</div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SUPERVISIÓN */}
          {section === "supervision" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Supervisión</h2>
                  <p style={panelSub}>Acompañamiento y revisión de la práctica.</p>
                </div>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <article style={card}>
                  <h3 style={cardTitle}>Próxima supervisión</h3>
                  <p style={{ color: C.sub, fontSize: 13 }}>Las sesiones 1-1 se realizan por Jitsi desde el panel del profesional.</p>
                  <button style={{ ...btnPrimary, marginTop: 14 }} onClick={() => setSection("encuentros")}>Agendar sesión</button>
                </article>
                <article style={card}>
                  <h3 style={cardTitle}>Historial</h3>
                  <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: C.sub, fontSize: 13 }}>
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
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Prácticas</h2>
                  <p style={panelSub}>Ejercicios y actividades para integrar lo aprendido.</p>
                </div>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
                {[
                  { t: "Práctica guiada", d: "Ejercicios con devolución personalizada.", b: "Disponible" },
                  { t: "Simulaciones", d: "Escenarios reales para entrenar habilidades.", b: "Próximamente" },
                  { t: "Bitácora", d: "Registro personal de tu práctica profesional.", b: "Activa" },
                ].map((x) => (
                  <article key={x.t} style={{ ...card, display: "grid", gap: 12, alignContent: "start" }}>
                    <h3 style={{ ...cardTitle, margin: 0 }}>{x.t}</h3>
                    <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{x.d}</p>
                    <span style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, fontSize: 12, color: C.green, background: C.greenSoft, width: "fit-content" }}>{x.b}</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* INVESTIGACIÓN */}
          {section === "investigacion" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Investigación</h2>
                  <p style={panelSub}>Producción de conocimiento y proyectos en curso.</p>
                </div>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
                {[
                  { n: courses.length, l: "Cursos activos" },
                  { n: modules.length, l: "Módulos publicados" },
                  { n: encounters.length, l: "Encuentros" },
                ].map((x) => (
                  <article key={x.l} style={{ ...card, textAlign: "center" }}>
                    <strong style={{ display: "block", fontSize: 30, color: C.accent }}>{x.n}</strong>
                    <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 13 }}>{x.l}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ENCUENTROS */}
          {section === "encuentros" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>Encuentros</h2>
                  <p style={panelSub}>Agenda de sesiones en vivo, talleres y eventos.</p>
                </div>
                <button style={btnPrimary} onClick={() => setShowAgendar(true)}>+ Agendar encuentro</button>
              </header>
              {encounters.length === 0 ? (
                <p style={{ color: C.sub }}>No hay encuentros agendados. Programá el primero.</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {encounters.map((e) => (
                    <article key={e.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div>
                        <h3 style={{ ...cardTitle, marginBottom: 6 }}>{e.titulo}</h3>
                        <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
                          {TIPO_LABEL[e.tipo] ?? e.tipo} · {cortarFecha(e.fecha)} {e.hora ? `· ${e.hora}` : ""} · {e.duracion_min || 60} min · {ESTADO_LABEL[e.estado] ?? e.estado} · Video (Jitsi)
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button style={btnNeutral} onClick={() => copiarLink(e.room_slug)}>Link del espacio</button>
                        <button style={btnPrimary} onClick={() => abrirSala(e)}>Unirse al encuentro</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* LENGUAJE */}
          {section === "lenguaje" && (
            <section style={panel}>
              <header style={panelHead}>
                <div>
                  <h2 style={panelTitle}>El lenguaje también educa</h2>
                  <p style={panelSub}>Glosario y reflexiones sobre el cuidado de las palabras.</p>
                </div>
              </header>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <article style={card}><h3 style={cardTitle}>Glosario colaborativo</h3><p style={{ color: C.sub, fontSize: 13 }}>Términos y conceptos clave construidos por la comunidad.</p></article>
                <article style={card}><h3 style={cardTitle}>Reflexiones</h3><ul style={{ margin: "14px 0 0", paddingLeft: 18, color: C.sub, fontSize: 13 }}><li>Nombrar es crear realidad</li><li>Lenguaje y vínculo profesional</li></ul></article>
              </div>
            </section>
          )}
        </main>
      </div>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "22px 28px", fontSize: 12.5, color: C.sub, textAlign: "center" }}>
        Campus de <strong style={{ color: C.green }}>{org.nombre}</strong> gestionado en Newen
      </footer>

      {/* Modal de sala */}
      {room && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,22,18,0.6)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => e.target === e.currentTarget && setRoom(null)}
        >
          <div style={{ width: "100%", maxWidth: 1000, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.line}` }}>
              <strong style={{ color: C.ink, fontSize: 14 }}>{room.titulo}</strong>
              <button onClick={() => setRoom(null)} style={{ background: "none", border: "none", fontSize: 18, color: C.dim, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 12.5, color: C.sub }}>El primero en ingresar es el <strong style={{ color: C.green }}>anfitrión/moderador</strong>.</span>
                <button style={btnNeutral} onClick={() => copiarLink(room.room)}>Copiar link del espacio</button>
              </div>
              <iframe src={`${JITSI_BASE}/${room.room}`} allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write" style={{ width: "100%", height: "68vh", border: "none", borderRadius: 14 }} allowFullScreen />
            </div>
          </div>
        </div>
      )}

      {/* Modal agendar */}
      {showAgendar && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,22,18,0.6)", zIndex: 120, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}
          onClick={(e) => e.target === e.currentTarget && setShowAgendar(false)}
        >
          <div style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.line}` }}>
              <strong style={{ color: C.ink }}>+ Agendar encuentro</strong>
              <button onClick={() => setShowAgendar(false)} style={{ background: "none", border: "none", fontSize: 18, color: C.dim, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "grid", gap: 12 }}>
              <div style={field}>
                <label style={fieldLabel}>Título *</label>
                <input id="ce-titulo" placeholder="Ej: Taller de liderazgo sostenible" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={field}><label style={fieldLabel}>Fecha</label><input id="ce-fecha" type="date" style={inputStyle} /></div>
                <div style={field}><label style={fieldLabel}>Hora</label><input id="ce-hora" type="time" style={inputStyle} /></div>
              </div>
              <div style={field}>
                <label style={fieldLabel}>Tipo</label>
                <select id="ce-tipo" defaultValue="encuentro" style={inputStyle}>
                  <option value="taller">Taller</option>
                  <option value="encuentro">Encuentro</option>
                  <option value="sesion">Sesión 1-1</option>
                  <option value="practica">Práctica</option>
                </select>
              </div>
              <div style={field}>
                <label style={fieldLabel}>Duración (min)</label>
                <input id="ce-duracion" type="number" min={15} step={15} defaultValue={60} style={inputStyle} />
              </div>
              <div style={field}>
                <label style={fieldLabel}>Descripción</label>
                <textarea id="ce-desc" placeholder="Temario, participantes, material…" style={{ ...inputStyle, minHeight: 70 }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button style={btnNeutral} onClick={() => setShowAgendar(false)}>Cancelar</button>
                <button style={btnPrimary} onClick={guardarEncuentro}>Programar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#fff", fontWeight: 700, fontSize: 13, padding: "12px 22px", borderRadius: 10, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// Helper styles (fuera del componente para reuso)
const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 20px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 13.5,
  fontFamily: "'Inter', system-ui, sans-serif",
  background: C.green,
  color: "#fff",
  boxShadow: "0 8px 22px rgba(62,92,77,0.14)",
};
const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 20px",
  borderRadius: 14,
  cursor: "pointer",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 13.5,
  fontFamily: "'Inter', system-ui, sans-serif",
  background: "#fff",
  color: C.green,
  border: `1px solid ${C.line}`,
};
const btnNeutral: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 12.5,
  fontFamily: "'Inter', system-ui, sans-serif",
  background: C.inner,
  color: C.ink,
  border: `1px solid ${C.line}`,
};
const panel: React.CSSProperties = { background: "#fff", borderRadius: 24, padding: 28, border: "1px solid #dde3d6", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" };
const panelHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 22, flexWrap: "wrap" };
const panelTitle: React.CSSProperties = { margin: 0, fontSize: 24, color: "#2e4a3d", fontFamily: "'Merriweather', Georgia, serif", fontWeight: 400 };
const panelSub: React.CSSProperties = { margin: "8px 0 0", color: "#4a5d4f", fontSize: 13.5 };
const card: React.CSSProperties = { background: "#f7f6f2", borderRadius: 20, padding: 22, border: "1px solid #dde3d6" };
const cardTitle: React.CSSProperties = { marginTop: 0, color: "#2e4a3d", fontSize: 15, fontWeight: 700 };
const field: React.CSSProperties = { display: "grid", gap: 6 };
const fieldLabel: React.CSSProperties = { fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#6b7a6e", fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", background: "#f7f6f2", border: "1px solid #dde3d6", borderRadius: 12, padding: "10px 12px", color: "#2e4a3d", fontSize: 13.5, outline: "none", fontFamily: "'Inter', system-ui, sans-serif" };
