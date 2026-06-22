import Link from "next/link";

export default function TerminosPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--nv-bg-base)",
        padding: "32px 24px 80px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/auth/login"
          style={{
            fontSize: 13,
            color: "var(--nv-accent)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← Volver
        </Link>
      </div>

      <h1
        style={{
          fontSize: 32,
          fontWeight: 400,
          fontFamily: "var(--nv-font-display)",
          color: "var(--nv-text-primary)",
          marginBottom: 8,
        }}
      >
        Términos y Condiciones
      </h1>
      <p style={{ fontSize: 13, color: "var(--nv-text-muted)", marginBottom: 32 }}>
        Última actualización: Junio 2026
      </p>

      {/* Contenido */}
      <div
        style={{
          fontSize: 14,
          color: "var(--nv-text-secondary)",
          lineHeight: 1.8,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            1. Aceptación
          </h2>
          <p>
            Al crear una cuenta o usar Newen, aceptás estos Términos y Condiciones en su totalidad.
            Si no estás de acuerdo, no uses la plataforma.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            2. Descripción del servicio
          </h2>
          <p>
            Newen es una plataforma de conexión entre personas que buscan acompañamiento emocional y psicológico
            (&ldquo;Consultantes&rdquo;) y profesionales del counseling verificados (&ldquo;Counselors&rdquo;).
          </p>
          <p style={{ marginTop: 8 }}>
            Newen <strong>no</strong> es un servicio de emergencias médicas ni una línea de prevención del suicidio.
            Si estás atravesando una crisis aguda, contactá a los servicios de emergencia de tu país
            (Argentina: 135; Uruguay: 098 123 123).
          </p>
          <p style={{ marginTop: 8 }}>
            Newen facilita la conexión, el pago y la videollamada. No intermedia en el contenido
            de las sesiones ni en la relación profesional entre counselor y consultante.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            3. Registro y cuentas
          </h2>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Debés tener al menos 18 años para crear una cuenta.</li>
            <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>No podés crear más de una cuenta por persona.</li>
            <li>Newen se reserva el derecho de suspender o cancelar cuentas que violen estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            4. Counselors — Requisitos y verificación
          </h2>
          <p>
            Para ejercer como counselor en Newen, debés:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Haber completado tu formación como counselor y contar con la verificación de la Asociación Argentina de Counseling (AAC) o entidad equivalente.</li>
            <li>Completar el proceso de postulación, entrevista personal con el fundador y pago del fee único de ingreso.</li>
            <li>Adherir al Código de Ética de la AAC y ejercer dentro del marco del counseling humanista.</li>
            <li>Mantener un promedio de estrellas por encima del umbral mínimo establecido por la plataforma.</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            Newen se reserva el derecho de rechazar o suspender counselors sin expresión de causa,
            especialmente ante violaciones éticas, evaluaciones consistentemente bajas o conductas
            que dañen el espíritu de la comunidad.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            5. Sesiones y pagos
          </h2>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><strong>Precio:</strong> cada sesión individual tiene un valor fijo de $22 USD (o su equivalente en moneda local según la cotización del día).</li>
            <li><strong>Pago:</strong> se realiza a través de Mercado Pago. Newen no almacena datos de tarjetas.</li>
            <li><strong>Cancelación:</strong> podés cancelar sin costo hasta 24 horas antes de la sesión. Cancelaciones tardías no tienen reembolso.</li>
            <li><strong>Duración:</strong> cada sesión estándar tiene una duración de 50 minutos.</li>
            <li><strong>Evaluación:</strong> al finalizar cada sesión, el consultante debe evaluar al counselor. Sin evaluación no se puede reservar la siguiente sesión.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            6. Conducta esperada
          </h2>
          <p>
            Newen es una comunidad basada en el respeto, la ética y el acompañamiento genuino.
            No se tolera:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Acoso, discriminación o discurso de odio de cualquier tipo.</li>
            <li>Contenido sexual inapropiado en un espacio de acompañamiento.</li>
            <li>Suplantación de identidad o falsificación de credenciales profesionales.</li>
            <li>Uso de la plataforma para fines ajenos al acompañamiento (venta de productos, proselitismo religioso o político).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            7. Propiedad intelectual
          </h2>
          <p>
            Newen, su nombre, logotipo, diseño, código fuente y documentación son propiedad de Etherea.
            Los contenidos publicados por counselors (bio, talleres, recursos) son de su autoría y
            otorgan a Newen una licencia no exclusiva para mostrarlos en la plataforma.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            8. Limitación de responsabilidad
          </h2>
          <p>
            Newen es una plataforma de conexión. No es un prestador de servicios de salud, no realiza
            diagnósticos ni tratamientos, y no se hace responsable por el contenido o resultado de las sesiones.
          </p>
          <p style={{ marginTop: 8 }}>
            Los counselors son profesionales independientes. Newen verifica credenciales pero no garantiza
            resultados terapéuticos ni se responsabiliza por la relación profesional counselor-consultante.
          </p>
          <p style={{ marginTop: 8 }}>
            Newen no será responsable por daños indirectos, lucro cesante o pérdida de datos derivados
            del uso de la plataforma, dentro de los límites permitidos por la ley aplicable.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            9. Modificaciones
          </h2>
          <p>
            Estos términos pueden ser actualizados. Te notificaremos cambios significativos por email
            con al menos 15 días de anticipación. El uso continuado de Newen después de la entrada en
            vigencia de los cambios implica tu aceptación.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            10. Ley aplicable y jurisdicción
          </h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia
            será sometida a los tribunales ordinarios de la Ciudad de Buenos Aires, con renuncia a
            cualquier otro fuero o jurisdicción.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            11. Contacto
          </h2>
          <p>
            Para cualquier consulta sobre estos términos:<br />
            <strong>Email:</strong> ari@etherea.com.ar<br />
            <strong>Responsable:</strong> Clr. Ari Mangini — Etherea
          </p>
        </section>
      </div>

      {/* Footer */}
      <hr className="separator" style={{ margin: "40px 0 24px" }} />
      <p style={{ fontSize: 12, color: "var(--nv-text-muted)", textAlign: "center" }}>
        🌿 Newen — Etherea · Argentina · {new Date().getFullYear()}
      </p>
    </div>
  );
}
