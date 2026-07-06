import nodemailer from "nodemailer";

export async function sendAdminNotification(subject: string, text: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — email non envoyé.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `Staro.app <${user}>`,
      to: user,
      subject,
      text,
    });
  } catch (err) {
    console.error("Échec envoi email notification admin:", err);
  }
}

export async function sendAdminBackup(filename: string, jsonContent: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — sauvegarde non envoyée.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `Staro.app <${user}>`,
      to: user,
      subject: `Sauvegarde Staro.app — ${new Date().toLocaleDateString("fr-FR")}`,
      text: "Sauvegarde automatique de la base de données Staro.app en pièce jointe.",
      attachments: [
        {
          filename,
          content: jsonContent,
          contentType: "application/json",
        },
      ],
    });
  } catch (err) {
    console.error("Échec envoi email de sauvegarde:", err);
  }
}
