import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../pages.module.css";
import SearchInput from "./SearchInput";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const { q } = await searchParams;

  let query = supabase
    .from("pacientes")
    .select("id,nombre,estado_animo,modalidad,telefono,fecha_nacimiento,updated_at")
    .is("deleted_at", null)
    .order("nombre");
  if (q) query = query.ilike("nombre", `%${q}%`);

  const { data: pacientes } = await query;

  const iniciales = (nombre: string) =>
    nombre
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Pacientes</h1>
          <div className={styles.pageSub}>{pacientes?.length ?? 0} en total</div>
        </div>
        <Link href="/panel/consultorio/pacientes/nuevo" className="btn-primary">
          + Nuevo paciente
        </Link>
      </div>

      <div style={{ marginBottom: 16 }}>
        <SearchInput defaultValue={q} />
      </div>

      {(pacientes ?? []).length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
          <p style={{ fontWeight: 600 }}>{q ? "Sin resultados" : "Sin pacientes"}</p>
          <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginTop: 4 }}>
            {q ? `No encontramos “${q}”` : "Agregá tu primer paciente para comenzar."}
          </p>
          {!q && (
            <Link href="/panel/consultorio/pacientes/nuevo" className="btn-primary" style={{ display: "inline-flex", marginTop: 14 }}>
              + Nuevo paciente
            </Link>
          )}
        </div>
      ) : (
        <div className="card">
          {(pacientes ?? []).map((p: any) => (
            <Link key={p.id} href={`/panel/consultorio/pacientes/${p.id}`} className={styles.pRow} style={{ textDecoration: "none" }}>
              <div className={styles.pAvatar}>{iniciales(p.nombre)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className={styles.pName}>{p.nombre}</span>
                <span className={styles.pMeta}>
                  {p.telefono ? `${p.telefono}` : ""}
                  {p.modalidad ? `${p.telefono ? " · " : ""}${cap(p.modalidad)}` : ""}
                </span>
              </div>
              <span className={styles.badgeOk}>{p.estado_animo ?? "Estable"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
