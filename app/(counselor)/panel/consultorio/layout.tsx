import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConsultorioNav, { ConsultorioChips } from "./nav";
import styles from "./consultorio.module.css";
import FontLoader from "@/components/consultorio/FontLoader";
import { getTema, getTipografia, getTamano, temaVars, fontVars } from "@/lib/consultorio-apariencia";

export default async function ConsultorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/magic-link");

  const { data: profile } = await supabase
    .from("users")
    .select("nombre, email, theme_id, font_id, font_size")
    .eq("id", user.id)
    .single();

  const nombre = profile?.nombre ?? "Counselor";
  const email = profile?.email ?? "";

  const tema = getTema(profile?.theme_id);
  const tipografia = getTipografia(profile?.font_id);
  const tamano = getTamano(profile?.font_size);

  const shellStyle = {
    ...temaVars(tema),
    ...fontVars(tipografia),
  } as React.CSSProperties;

  const iniciales = nombre
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fecha = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.shell} style={shellStyle}>
      <FontLoader gFont={tipografia.gFont} />
      <ConsultorioNav />

      <div className={styles.workspace} style={{ zoom: tamano.zoom } as React.CSSProperties}>
        <header className={styles.topbar}>
          <div className={styles.topbarMark}>n.</div>
          <div className={styles.topbarTxt}>
            <div className={styles.kicker}>Panel counselor</div>
            <div className={styles.topbarTitle}>Mi consultorio</div>
            <div className={styles.topbarDate}>{fecha}</div>
          </div>
          <div className={styles.topbarUser}>
            <div className={styles.hello}>
              <b>{nombre}</b>
              {email}
            </div>
            <div className={styles.avatar}>{iniciales}</div>
          </div>
        </header>

        <ConsultorioChips />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
