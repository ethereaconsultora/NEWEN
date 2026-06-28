"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserState {
  user: SupabaseUser | null;
  rol: string | null;
  loading: boolean;
}

/**
 * Hook para obtener el usuario autenticado y su rol.
 */
export function useUser(): UserState {
  const supabase = createClient();
  const [state, setState] = useState<UserState>({
    user: null,
    rol: null,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("rol")
          .eq("id", user.id)
          .single();

        setState({
          user,
          rol: profile?.rol ?? null,
          loading: false,
        });
      } else {
        setState({ user: null, rol: null, loading: false });
      }
    }

    load();

    // Suscribirse a cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("rol")
            .eq("id", session.user.id)
            .single();

          setState({
            user: session.user,
            rol: profile?.rol ?? null,
            loading: false,
          });
        } else {
          setState({ user: null, rol: null, loading: false });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
