"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Cierra sesión automáticamente después de 10 minutos de inactividad.
 * Cualquier click, tecla o scroll resetea el timer.
 */
export function useAutoLogout() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
      }, 10 * 60 * 1000); // 10 minutos
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));

    reset(); // iniciar timer

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [supabase, router]);
}
