import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConsultorioNav, { ConsultorioChips } from "./nav";
import styles from "./consultorio.module.css";
import ThemeProvider from "@/components/consultorio/ThemeProvider";

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
    <ThemeProvider
      initial={{
        themeId: profile?.theme_id ?? "newen",
        fontId: profile?.font_id ?? "newen",
        sizeId: profile?.font_size ?? "mediana",
      }}
    >
      <div className={styles.shell}>
        <ConsultorioNav />

        <div className={styles.workspace}>
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
    </ThemeProvider>
  );
}
