import Link from "next/link";

export default function PrivacidadPage() {
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
        Política de Privacidad
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
            1. Quiénes somos
          </h2>
          <p>
            Newen es una plataforma operada por <strong>Etherea</strong>, proyecto de tecnología con propósito
            fundado por el Clr. Ari Mangini en Argentina. Nuestra misión es conectar personas que atraviesan
            momentos difíciles con counselors humanistas verificados.
          </p>
          <p style={{ marginTop: 8 }}>
            Para cualquier consulta sobre esta política o sobre tus datos personales, escribinos a{" "}
            <strong>ari@etherea.com.ar</strong>.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            2. Qué datos recolectamos
          </h2>
          <p>Para que Newen funcione, necesitamos ciertos datos mínimos:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><strong>Datos de cuenta:</strong> nombre y email. Los usamos para identificarte y comunicarnos.</li>
            <li><strong>Datos de perfil (counselors):</strong> bio, especialidades, enfoque, provincia, verificación AAC. Son públicos en tu perfil profesional.</li>
            <li><strong>Datos de sesión:</strong> fecha, hora, counselor, modalidad. Solo visibles para vos y tu counselor.</li>
            <li><strong>Evaluaciones:</strong> estrellas (1-5) y comentario opcional. Las estrellas se muestran en el perfil del counselor de forma anónima. El counselor NUNCA sabe quién evaluó qué.</li>
            <li><strong>Datos de pago:</strong> procesados exclusivamente por Mercado Pago. Newen no almacena números de tarjeta ni datos financieros.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            3. Qué NO recolectamos
          </h2>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>❌ Diagnósticos clínicos ni historial médico.</li>
            <li>❌ Notas de sesión del counselor.</li>
            <li>❌ Grabaciones de videollamada (Daily.co no graba).</li>
            <li>❌ Datos de menores de edad (Newen no es un servicio para menores).</li>
            <li>❌ Datos de navegación con fines publicitarios. No usamos cookies de rastreo ni analytics invasivo.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            4. Cómo usamos tus datos
          </h2>
          <p>Usamos tus datos exclusivamente para:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Identificarte en la plataforma y mostrarte tu historial de sesiones.</li>
            <li>Conectarte con counselors según tus preferencias de búsqueda.</li>
            <li>Procesar reservas y pagos.</li>
            <li>Mostrar el promedio de estrellas en perfiles de counselors (de forma anónima).</li>
            <li>Enviar notificaciones relacionadas con tus sesiones (confirmaciones, recordatorios).</li>
            <li>Mejorar la plataforma con datos agregados y anónimos.</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            <strong>No vendemos, alquilamos ni compartimos tus datos con terceros</strong> con fines comerciales.
            No mostramos publicidad basada en tus datos. No compartimos información con sponsors sin tu consentimiento explícito.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            5. Base legal
          </h2>
          <p>
            El tratamiento de tus datos se fundamenta en:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><strong>Consentimiento:</strong> al crear tu cuenta, aceptás esta política.</li>
            <li><strong>Ejecución contractual:</strong> procesamos tus datos para brindarte el servicio (reservas, sesiones, pagos).</li>
            <li><strong>Interés legítimo:</strong> mejorar la plataforma y prevenir fraudes.</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            Cumplimos con la <strong>Ley 25.326 de Protección de Datos Personales</strong> (Argentina) y seguimos
            los principios del <strong>Reglamento General de Protección de Datos (GDPR)</strong> de la Unión Europea.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            6. Seguridad
          </h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Encriptación en tránsito (HTTPS) en todas las comunicaciones.</li>
            <li>Base de datos con acceso restringido por rol (RLS en Supabase).</li>
            <li>API keys nunca expuestas en el frontend.</li>
            <li>Videollamadas sin grabación (Daily.co).</li>
            <li>Evaluaciones anonimizadas (el counselor ve el promedio, no quién evaluó).</li>
            <li>Protocolo de seguridad PSAI v1.3 auditado.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            7. Retención de datos
          </h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Si solicitás la baja, eliminamos
            todos tus datos personales en un plazo máximo de 30 días. Las evaluaciones anónimas (estrellas)
            se conservan como parte del promedio del counselor, sin vinculación a tu identidad.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            8. Tus derechos
          </h2>
          <p>Tenés derecho a:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><strong>Acceder</strong> a todos tus datos desde Mi Cuenta.</li>
            <li><strong>Rectificar</strong> tus datos personales en cualquier momento.</li>
            <li><strong>Suprimir</strong> tu cuenta y todos tus datos (escribinos a ari@etherea.com.ar).</li>
            <li><strong>Exportar</strong> tu historial de sesiones en formato JSON.</li>
            <li><strong>Oponerte</strong> al tratamiento de tus datos para fines que no sean estrictamente necesarios para el servicio.</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            Para ejercer cualquiera de estos derechos, contactanos en{" "}
            <strong>ari@etherea.com.ar</strong>. Respondemos en un máximo de 10 días hábiles.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            9. Cambios a esta política
          </h2>
          <p>
            Si modificamos esta política, te notificaremos por email y/o mediante un aviso en la plataforma
            con al menos 15 días de anticipación. El uso continuado de Newen después de la entrada en vigencia
            de los cambios implica tu aceptación.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontFamily: "var(--nv-font-display)", color: "var(--nv-text-primary)", marginBottom: 8 }}>
            10. Contacto
          </h2>
          <p>
            <strong>Oficial de Privacidad:</strong> Clr. Ari Mangini<br />
            <strong>Email:</strong> ari@etherea.com.ar<br />
            <strong>Organismo de control (Argentina):</strong> Agencia de Acceso a la Información Pública (AAIP)
          </p>
          <p style={{ marginTop: 8 }}>
            Si considerás que tus derechos han sido vulnerados, podés presentar un reclamo ante la AAIP.
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
