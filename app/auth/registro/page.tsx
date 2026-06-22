"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre },
        },
      });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--nv-bg-card)",
          borderRadius: "var(--nv-radius-xl)",
          padding: 32,
          width: "100%",
          maxWidth: 380,
          boxShadow: "var(--nv-shadow)",
          border: "1px solid var(--nv-border)",
        }}
      >
        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 400,
              fontFamily: "var(--nv-font-display)",
              color: "var(--nv-text-primary)",
              letterSpacing: -1,
            }}
          >
            Newen
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: "var(--nv-accent)",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            Buscanos
          </div>
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 400,
            fontFamily: "var(--nv-font-display)",
            color: "var(--nv-text-primary)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Crear cuenta
        </h2>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              className="input"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: 4 }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" /> Creando cuenta…
              </span>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "var(--nv-text-secondary)" }}>
            ¿Ya tenés cuenta?{" "}
            <Link href="/auth/login" className="link">
              Ingresar
            </Link>
          </p>
          <p style={{ fontSize: 11, color: "var(--nv-text-muted)", marginTop: 12, lineHeight: 1.5 }}>
            Al crear una cuenta, aceptás nuestros{" "}
            <Link href="/terminos" className="link">
              Términos
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="link">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
