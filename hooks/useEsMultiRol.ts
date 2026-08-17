"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RolEstado = {
  isAdmin: boolean;
  isCounselor: boolean;
  isEmpresa: boolean;
};

/**
 * Determina si la cuenta logueada tiene capacidades de admin y/o counselor.
 * Una cuenta es "dual" cuando puede actuar en ambos shells.
 */
export function useEsMultiRol() {
  const [estado, setEstado] = useState<RolEstado>({ isAdmin: false, isCounselor: false, isEmpresa: false });

  useEffect(() => {
    let activo = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: u } = await supabase.from("users").select("*").eq("id", user.id).single();

      // Miembro de alguna organización → puede acceder al área Empresa sin cambiar su rol.
      const { data: memb } = await supabase
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!activo) return;
      const isAdmin = u?.es_admin === true || u?.rol === "admin";
      const isCounselor = u?.rol === "counselor";
      const isEmpresa = u?.rol === "empresa" || (Array.isArray(memb) && memb.length > 0);
      setEstado({ isAdmin, isCounselor, isEmpresa });
    })();

    return () => {
      activo = false;
    };
  }, []);

  return estado;
}
