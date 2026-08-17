import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "../pages.module.css";
import ResumenClient from "./ResumenClient";

export default async function ResumenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const [
    { data: pacientes },
    { data: turnos },
    { data: pagos },
  ] = await Promise.all([
    supabase.from("pacientes").select("id,modalidad,created_at").is("deleted_at", null),
    supabase.from("turnos").select("id,fecha,estado,modalidad"),
    supabase.from("pagos").select("id,monto,estado,fecha").order("fecha", { ascending: false }).limit(200),
  ]);

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Resumen</h1>
          <div className={styles.pageSub}>Estadísticas de tu consultorio</div>
        </div>
      </div>

      <ResumenClient
        pacientes={pacientes ?? []}
        turnos={turnos ?? []}
        pagos={pagos ?? []}
      />
    </div>
  );
}
