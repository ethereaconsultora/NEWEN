"use client";

import { useRouter } from "next/navigation";
import PacienteForm from "../PacienteForm";
import styles from "../../pages.module.css";

export default function NuevoPacientePage() {
  const router = useRouter();

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Nuevo paciente</h1>
        </div>
        <button className="btn-ghost" onClick={() => router.push("/panel/consultorio/pacientes")}>
          Cancelar
        </button>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <PacienteForm
          onSuccess={(id) => router.push(`/panel/consultorio/pacientes/${id}`)}
          onCancel={() => router.push("/panel/consultorio/pacientes")}
        />
      </div>
    </div>
  );
}
