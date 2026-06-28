"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [modoMagic, setModoMagic] = useState(true); // Magic Link por defecto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── MAGIC LINK ──
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSuccessMsg(
        "Te enviamos un enlace mágico a tu email. Revisá tu bandeja de entrada (y spam). Un solo clic y ya estás adentro."
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al enviar el enlace.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // ── INGRESAR con contraseña ──
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        // ── CREAR CUENTA con contraseña ──
        if (!nombre.trim()) {
          setError("El nombre es obligatorio.");
          setLoading(false);
          return;
        }
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
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
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

        {/* ── Magic Link (default) ── */}
        {modoMagic ? (
          <>
            <p
              style={{
                fontSize: 13,
                color: "var(--nv-text-secondary)",
                textAlign: "center",
                marginBottom: 8,
                lineHeight: 1.6,
              }}
            >
              Sin contraseña. Ingresá tu email y te enviamos un enlace mágico.
              Un clic y ya estás adentro.
            </p>

            <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label" htmlFor="email-magic">Email</label>
                <input
                  id="email-magic"
                  className="input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {successMsg && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--nv-accent)",
                    background: "var(--nv-accent-soft)",
                    padding: "12px 16px",
                    borderRadius: "var(--nv-radius-md)",
                    lineHeight: 1.6,
                  }}
                >
                  {successMsg}
                </p>
              )}

              {error && <p className="error-text">{error}</p>}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: "100%", marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="spinner" /> Enviando…
                  </span>
                ) : (
                  "Enviar enlace mágico"
                )}
              </button>
            </form>

            {/* Toggle a contraseña */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                type="button"
                onClick={() => { setModoMagic(false); setIsLogin(true); setError(""); setSuccessMsg(""); }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 12,
                  color: "var(--nv-text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--nv-font-body)",
                }}
              >
                Prefiero usar contraseña
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ── Toggle Ingresar / Crear cuenta ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "var(--nv-bg-input)",
                borderRadius: "var(--nv-radius-md)",
                padding: 3,
                marginBottom: 24,
                gap: 3,
              }}
            >
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); }}
                style={{
                  padding: "10px 0",
                  borderRadius: "var(--nv-radius-sm)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--nv-font-body)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ...(isLogin
                    ? { background: "var(--nv-accent)", color: "var(--nv-text-inverse)" }
                    : { background: "transparent", color: "var(--nv-text-muted)" }),
                }}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); }}
                style={{
                  padding: "10px 0",
                  borderRadius: "var(--nv-radius-sm)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--nv-font-body)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ...(!isLogin
                    ? { background: "var(--nv-accent)", color: "var(--nv-text-inverse)" }
                    : { background: "transparent", color: "var(--nv-text-muted)" }),
                }}
              >
                Crear cuenta
              </button>
            </div>

            {/* ── Formulario con contraseña ── */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!isLogin && (
                <div>
                  <label className="label" htmlFor="nombre">Nombre</label>
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
              )}

              <div>
                <label className="label" htmlFor="email">Email</label>
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
                <label className="label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
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
                    <span className="spinner" /> Cargando…
                  </span>
                ) : isLogin ? (
                  "Ingresar"
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>

            {/* Toggle a Magic Link */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                type="button"
                onClick={() => { setModoMagic(true); setError(""); }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 12,
                  color: "var(--nv-accent)",
                  cursor: "pointer",
                  fontFamily: "var(--nv-font-body)",
                  fontWeight: 500,
                }}
              >
                ← Volver a enlace mágico
              </button>
            </div>
          </>
        )}

        {/* ── Separador ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0",
          }}
        >
          <hr className="separator" style={{ flex: 1, margin: 0 }} />
          <span style={{ fontSize: 11, color: "var(--nv-text-muted)", textTransform: "uppercase" }}>
            o
          </span>
          <hr className="separator" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* ── Google ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-ghost"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </button>

        {/* ── Footer ── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <p style={{ fontSize: 11, color: "var(--nv-text-muted)", lineHeight: 1.5 }}>
            Al {isLogin ? "ingresar" : "crear una cuenta"}, aceptás nuestros{" "}
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
