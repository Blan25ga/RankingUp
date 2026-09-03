import { Resend } from "resend";
import { siteConfig } from "@/config/site";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resend = resendApiKey && resendApiKey !== "re_mock" ? new Resend(resendApiKey) : null;

export async function sendOutbidEmail(
  email: string,
  title: string,
  nextBidAmount: number,
  editToken: string,
  cardId: string
) {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || `https://${siteConfig.domain}`;
  const bumpUrl = `${domain}/crear?cardId=${cardId}&token=${editToken}`;

  // Loguear el email en consola para desarrollo local
  console.log(
    `\n=== [EMAIL ENVIADO A: ${email}] ===\nAsunto: ¡Te han quitado el Puesto #1 en ${siteConfig.name}!\nCuerpo: Tu anuncio "${title}" fue superado. Puja $${nextBidAmount} para recuperarlo: ${bumpUrl}\n====================================\n`
  );

  if (!resend) {
    return;
  }

  try {
    await resend.emails.send({
      from: `${siteConfig.name} <no-reply@${siteConfig.domain}>`,
      to: email,
      subject: `¡Te han quitado el Puesto #1 en ${siteConfig.name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #d97706; margin-bottom: 16px;">¡Tu puesto #1 ha sido superado!</h2>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">
            Hola. Queremos avisarte que otro anunciante ha realizado una puja mayor y ha tomado el <strong>Puesto #1</strong> en la grilla principal de ${siteConfig.name}.
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">
            Tu anuncio <strong>"${title}"</strong> se ha desplazado hacia abajo en las posiciones.
          </p>
          <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0; border-radius: 6px;">
            <p style="margin: 0; font-weight: bold; font-size: 16px; color: #92400e;">
              Recupera el Puesto #1 ahora mismo por ${siteConfig.currencySymbol}${nextBidAmount.toLocaleString('es-AR')} ${siteConfig.currency}
            </p>
          </div>
          <div style="text-align: center;">
            <a href="${bumpUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; text-align: center; margin-top: 8px;">
              Recuperar Puesto #1
            </a>
          </div>
          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #71717a; text-align: center;">
            ${siteConfig.name} &copy; ${new Date().getFullYear()} - El puesto publicitario en tiempo real.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email via Resend:", err);
  }
}

export async function sendWelcomeEmail(
  email: string,
  title: string,
  editToken: string,
  cardId: string
) {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || `https://${siteConfig.domain}`;
  const manageUrl = `${domain}/crear?cardId=${cardId}&token=${editToken}`;

  console.log(
    `\n=== [EMAIL ENVIADO A: ${email}] ===\nAsunto: ¡Tu anuncio está activo en ${siteConfig.name}!\nCuerpo: Felicitaciones por tu anuncio "${title}". Puedes gestionarlo y editarlo aquí: ${manageUrl}\n====================================\n`
  );

  if (!resend) {
    return;
  }

  try {
    await resend.emails.send({
      from: `${siteConfig.name} <no-reply@${siteConfig.domain}>`,
      to: email,
      subject: `¡Tu anuncio está activo en ${siteConfig.name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #10b981; margin-bottom: 16px;">¡Bienvenido a ${siteConfig.name}!</h2>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">
            Tu anuncio <strong>"${title}"</strong> ha sido publicado exitosamente tras verificar tu pago.
          </p>
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              Guarda este correo. Contiene el enlace directo y secreto para modificar los detalles de tu anuncio o realizar nuevas pujas sin necesidad de crear una contraseña.
            </p>
          </div>
          <div style="text-align: center;">
            <a href="${manageUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; text-align: center;">
              Gestionar mi Anuncio
            </a>
          </div>
          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #71717a; text-align: center;">
            ${siteConfig.name} &copy; ${new Date().getFullYear()} - El puesto publicitario en tiempo real.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email de bienvenida via Resend:", err);
  }
}
