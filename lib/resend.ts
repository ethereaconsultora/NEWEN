import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía email de confirmación de sesión al consultante.
 */
export async function enviarConfirmacionConsultante(input: {
  email: string;
  nombre: string;
  counselorNombre: string;
  fechaHora: string;
  sesionId: string;
}) {
  const { email, nombre, counselorNombre, fechaHora, sesionId } = input;

  const fecha = new Date(fechaHora).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sesion/${sesionId}`;

  await resend.emails.send({
    from: "Newen <sesiones@buscanos.com.ar>",
    to: email,
    subject: `✅ Tu sesión con ${counselorNombre} está confirmada`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; background: #0c1810; color: #e8e2d4; padding: 32px; max-width: 480px; margin: 0 auto;">
        <h1 style="font-family: 'DM Serif Display', serif; font-size: 24px; color: #7dba8f; margin-bottom: 8px;">Newen</h1>
        <p style="font-size: 14px; color: #6a7a65; margin-bottom: 24px;">Lo que sentís, puede ser acompañado.</p>

        <div style="background: #162019; border: 1px solid #243329; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #6a7a65; margin-bottom: 4px;">Sesión confirmada con</p>
          <p style="font-size: 18px; font-weight: 600; color: #e8e2d4; margin-bottom: 12px;">${counselorNombre}</p>
          <p style="font-size: 14px; color: #7dba8f; margin-bottom: 4px;">📅 ${fecha}</p>
          <p style="font-size: 12px; color: #6a7a65;">⏱ 50 minutos</p>
        </div>

        <a href="${accessUrl}" style="display: block; background: #7dba8f; color: #0c1810; text-align: center; padding: 14px 0; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 16px;">
          Acceder a la sesión
        </a>

        <p style="font-size: 11px; color: #4a5a45; text-align: center; margin-bottom: 24px;">
          El enlace se activa el día y hora de tu sesión.<br />
          ¿Imprevisto? Reprogramá hasta 24hs antes sin perder tu pago.
        </p>

        <hr style="border-color: #243329; margin-bottom: 16px;" />
        <p style="font-size: 10px; color: #4a5a45; text-align: center;">🌿 Newen · Etherea</p>
      </div>
    `,
  });
}

/**
 * Envía email de confirmación de sesión al counselor.
 */
export async function enviarConfirmacionCounselor(input: {
  email: string;
  nombre: string;
  consultanteNombre: string;
  fechaHora: string;
  sesionId: string;
}) {
  const { email, nombre, consultanteNombre, fechaHora, sesionId } = input;

  const fecha = new Date(fechaHora).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/panel/sesion/${sesionId}`;

  await resend.emails.send({
    from: "Newen <sesiones@buscanos.com.ar>",
    to: email,
    subject: `📅 Nueva sesión: ${consultanteNombre} — ${fecha}`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; background: #0c1810; color: #e8e2d4; padding: 32px; max-width: 480px; margin: 0 auto;">
        <h1 style="font-family: 'DM Serif Display', serif; font-size: 24px; color: #7dba8f; margin-bottom: 8px;">Newen</h1>
        <p style="font-size: 14px; color: #6a7a65; margin-bottom: 24px;">Tenés una nueva sesión confirmada.</p>

        <div style="background: #162019; border: 1px solid #243329; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #6a7a65; margin-bottom: 4px;">Consultante</p>
          <p style="font-size: 18px; font-weight: 600; color: #e8e2d4; margin-bottom: 12px;">${consultanteNombre}</p>
          <p style="font-size: 14px; color: #7dba8f; margin-bottom: 4px;">📅 ${fecha}</p>
          <p style="font-size: 12px; color: #6a7a65;">⏱ 50 minutos</p>
        </div>

        <a href="${accessUrl}" style="display: block; background: #7dba8f; color: #0c1810; text-align: center; padding: 14px 0; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 16px;">
          Acceder a la sesión
        </a>

        <hr style="border-color: #243329; margin-bottom: 16px;" />
        <p style="font-size: 10px; color: #4a5a45; text-align: center;">🌿 Newen · Etherea</p>
      </div>
    `,
  });
}
