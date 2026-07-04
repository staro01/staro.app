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
