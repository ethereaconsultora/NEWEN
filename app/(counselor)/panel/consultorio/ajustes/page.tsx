import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "../pages.module.css";

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const { data: profile } = await supabase
    .from("users")
    .select("nombre, email, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Ajustes</h1>
          <div className={styles.pageSub}>Tu consultorio dentro de newen</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className={styles.fieldLabel} style={{ marginBottom: 14 }}>
            Perfil
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
              Profesional
            </div>
            <div style={{ fontWeight: 600 }}>{profile?.nombre ?? "—"}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
              Email
            </div>
            <div>{profile?.email ?? "—"}</div>
          </div>

          {profile?.created_at && (
            <div>
              <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
                En newen desde
              </div>
              <div style={{ fontSize: 13, color: "var(--nv-text-secondary)" }}>
                {new Date(profile.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className={styles.fieldLabel} style={{ marginBottom: 14 }}>
            Apariencia
          </div>
          <p style={{ fontSize: 13.5, color: "var(--nv-text-secondary)", lineHeight: 1.7 }}>
            El consultorio hereda la identidad visual de <b style={{ color: "var(--nv-accent)" }}>newen</b>:
            paleta cálida, tipografía DM Serif Display + DM Sans y acento verde bosque.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#1B4332", display: "inline-block", border: "2px solid #fff", boxShadow: "var(--nv-shadow-card)" }} />
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#c4a882", display: "inline-block", border: "2px solid #fff", boxShadow: "var(--nv-shadow-card)" }} />
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#F0EBE0", display: "inline-block", border: "2px solid #fff", boxShadow: "var(--nv-shadow-card)" }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--nv-text-muted)", marginTop: 14 }}>
            La personalización de temas y tipografías de Anima quedará disponible en una próxima versión.
          </p>
        </div>
      </div>
    </div>
  );
}
