import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../pages.module.css";
import AgendaClient from "./AgendaClient";

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const hoy = new Date().toISOString().split("T")[0];

  const { data: u } = await supabase.from("users").select("jitsi_base").eq("id", user.id).single();

  const { data: turnos } = await supabase
    .from("turnos")
    .select("id,fecha,hora,duracion,modalidad,tipo,estado,notas,patient_name,patient_phone,pacientes(nombre,telefono)")
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Agenda</h1>
          <div className={styles.pageSub}>{turnos?.length ?? 0} turnos registrados</div>
        </div>
        <Link href="/panel/consultorio/agenda/nuevo" className="btn-primary">
          + Nuevo turno
        </Link>
      </div>

      <AgendaClient turnos={turnos ?? []} hoy={hoy} jitsiBase={u?.jitsi_base || ""} userId={user.id} />
    </div>
  );
}
