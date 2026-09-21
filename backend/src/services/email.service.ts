import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: MailOptions): Promise<void> => {
  const host = env.MAIL_HOST;
  const port = env.MAIL_PORT;
  const user = env.MAIL_USER;
  const pass = env.MAIL_PASS;

  // Fallback: If no SMTP credentials are set, log to console for local testing
  if (!host || !user || !pass) {
    console.warn('DEVELOPMENT WARNING: SMTP credentials are not configured. Outputting email payload to console:');
    console.warn('-----------------------------------------');
    console.warn(`To:      ${options.to}`);
    console.warn(`Subject: ${options.subject}`);
    console.warn(`Text:    ${options.text}`);
    console.warn('-----------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Mentor.AI Admin" <no-reply@mentor-ai.com>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const clientUrl = env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const subject = 'Mentor.AI — Password Reset Link';
  const text = `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n
Please click the following link, or copy and paste it into your browser, to complete the process within 1 hour:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d0724; color: #f8f6fc; border-radius: 8px;">
      <h2 style="color: #9d4edd;">Password Reset Request</h2>
      <p style="color: #b6afdb;">You requested a password reset for your account at Mentor.AI.</p>
      <p style="color: #b6afdb;">Please click the button below to complete the reset process (valid for 1 hour):</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #7b2cbf 0%, #3a86c8 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #6f688e;">If button does not work, copy and paste this link: ${resetUrl}</p>
      <hr style="border: 0; border-top: 1px solid rgba(157, 78, 221, 0.15); margin-top: 30px;" />
      <p style="font-size: 11px; color: #6f688e;">If you did not make this request, please ignore this message.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};
