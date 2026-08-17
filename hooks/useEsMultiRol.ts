"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RolEstado = {
  isAdmin: boolean;
  isCounselor: boolean;
};

/**
 * Determina si la cuenta logueada tiene capacidades de admin y/o counselor.
 * Una cuenta es "dual" cuando puede actuar en ambos shells.
 */
export function useEsMultiRol() {
  const [estado, setEstado] = useState<RolEstado>({ isAdmin: false, isCounselor: false });

  useEffect(() => {
    let activo = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: u }, { data: c }] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).single(),
        supabase.from("counselors").select("id").eq("id", user.id).maybeSingle(),
      ]);

      if (!activo) return;
      const isAdmin = u?.es_admin === true || u?.rol === "admin";
      const isCounselor = u?.rol === "counselor" || !!c;
      setEstado({ isAdmin, isCounselor });
    })();

    return () => {
      activo = false;
    };
  }, []);

  return estado;
}
