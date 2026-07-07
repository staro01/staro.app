import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return { transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }), user };
}

export async function sendAdminNotification(subject: string, text: string) {
  const setup = getTransporter();
  if (!setup) { console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — email non envoyé."); return; }
  try {
    await setup.transporter.sendMail({ from: `Staro.app <${setup.user}>`, to: setup.user, subject, text });
  } catch (err) {
    console.error("Échec envoi email notification admin:", err);
  }
}

export async function sendAdminBackup(filename: string, jsonContent: string) {
  const setup = getTransporter();
  if (!setup) { console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — sauvegarde non envoyée."); return; }
  try {
    await setup.transporter.sendMail({
      from: `Staro.app <${setup.user}>`,
      to: setup.user,
      subject: `Sauvegarde Staro.app — ${new Date().toLocaleDateString("fr-FR")}`,
      text: "Sauvegarde automatique de la base de données Staro.app en pièce jointe.",
      attachments: [{ filename, content: jsonContent, contentType: "application/json" }],
    });
  } catch (err) {
    console.error("Échec envoi email de sauvegarde:", err);
  }
}

export async function sendClientReport(to: string, subject: string, html: string) {
  const setup = getTransporter();
  if (!setup) { console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — rapport non envoyé."); return; }
  try {
    await setup.transporter.sendMail({ from: `Staro.app <${setup.user}>`, to, subject, html });
  } catch (err) {
    console.error("Échec envoi rapport client:", err);
  }
}
