import Link from "next/link";
import styles from "../../empresa.module.css";

export default function CampusStubPage() {
  return (
    <div className={styles.content}>
      <div className={styles.panel}>
        <h3>🎓 Campus digital</h3>
        <p style={{ marginTop: 8 }}>
          El campus de formación continua ya está maquetado, pero su desarrollo funcional
          (cursos, rutas, certificaciones) se conectará en una próxima iteración. En esta
          entrega queda el acceso listo.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Link className={styles.btn} href="/empresa">
            ← Volver al workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
