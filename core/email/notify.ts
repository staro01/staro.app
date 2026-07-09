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

export async function sendWelcomeEmail(to: string, businessName: string) {
  const setup = getTransporter();
  if (!setup) { console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — email de bienvenue non envoyé."); return; }
  const html = `
    <p>Bonjour,</p>
    <p>Votre compte Staro.app pour <strong>${businessName}</strong> est maintenant activé !</p>
    <p>Vous pouvez dès à présent vous connecter à votre espace pour suivre vos commandes, rendez-vous ou demandes clients :</p>
    <p><a href="https://www.staro.app/dashboard">Accéder à mon dashboard</a></p>
    <p>À très vite,<br/>L'équipe Staro</p>
  `;
  try {
    await setup.transporter.sendMail({
      from: `Staro.app <${setup.user}>`,
      to,
      subject: `Votre compte Staro.app est activé — ${businessName}`,
      html,
    });
  } catch (err) {
    console.error("Échec envoi email de bienvenue:", err);
  }
}

export async function sendTwilioNumberEmail(to: string, businessName: string, twilioNumber: string) {
  const setup = getTransporter();
  if (!setup) { console.error("GMAIL_USER ou GMAIL_APP_PASSWORD manquant — email numéro Twilio non envoyé."); return; }
  const html = `
    <p>Bonjour,</p>
    <p>Votre agent vocal Staro pour <strong>${businessName}</strong> est configuré et prêt à répondre !</p>
    <p>Votre numéro d'agent vocal est : <strong style="font-size: 18px;">${twilioNumber}</strong></p>
    <p>Pour que vos clients tombent directement sur votre agent Staro, il vous reste une dernière étape : rediriger votre numéro professionnel actuel vers ce numéro. C'est rapide (2 à 5 minutes) et se fait directement depuis votre téléphone.</p>
    <p><strong>Méthode rapide :</strong> composez ce code sur votre téléphone, comme un appel classique :</p>
    <p style="font-size: 16px; font-family: monospace; background: #f4f4f4; padding: 10px 14px; border-radius: 8px; display: inline-block;">**21*${twilioNumber}#</p>
    <p>Puis appuyez sur la touche d'appel. Vous devriez entendre un message confirmant l'activation.</p>
    <p>Pour désactiver ce renvoi à tout moment : composez <code>##21#</code>.</p>
    <p>Besoin d'aide ou d'une méthode alternative selon votre opérateur (Orange, SFR, Bouygues, Free) ? Répondez simplement à cet email, nous vous enverrons le guide détaillé.</p>
    <p><a href="https://www.staro.app/dashboard">Accéder à mon dashboard</a></p>
    <p>À très vite,<br/>L'équipe Staro</p>
  `;
  try {
    await setup.transporter.sendMail({
      from: `Staro.app <${setup.user}>`,
      to,
      subject: `Votre numéro d'agent vocal est prêt — ${businessName}`,
      html,
    });
  } catch (err) {
    console.error("Échec envoi email numéro Twilio:", err);
  }
}
