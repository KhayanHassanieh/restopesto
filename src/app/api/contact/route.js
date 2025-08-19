export const runtime = 'nodejs'; // Nodemailer needs Node, not Edge
import nodemailer from 'nodemailer';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const esc = (s = '') =>
  s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

export async function POST(req) {
  const isProd = process.env.NODE_ENV === 'production';
  try {
    const { name, email, mobile, subject, message, hp } = await req.json();

    // Honeypot for bots
    if (hp) return json({ ok: true });

    if (!name || !email || !subject || !message) {
      return json({ error: 'Missing fields' }, 400);
    }

    // 1) ENV validation (don’t log secrets)
    const { SMTP_USER, SMTP_PASS } = process.env;
    const TO_EMAIL = process.env.TO_EMAIL || 'khayanhassanieh@gmail.com';
    if (!SMTP_USER || !SMTP_PASS) {
      return json(
        {
          error: 'SMTP env missing',
          hint: 'Set SMTP_USER, SMTP_PASS (Gmail app password), and optionally TO_EMAIL in .env.local',
        },
        500
      );
    }

    // 2) Transport (Gmail)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // 465 = SSL
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // 3) Verify connection (great for spotting EAUTH / ECONNECTION quickly)
    await transporter.verify();

    // 4) Send
    const info = await transporter.sendMail({
      from: `"Krave Menus" <${SMTP_USER}>`, // must be your Gmail
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Krave Contact] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <h3>New message from Krave Menus</h3>
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Mobile:</b> ${esc(mobile)}</p>
        <p><b>Subject:</b> ${esc(subject)}</p>
        <hr/>
        <p>${esc(message).replace(/\n/g, '<br/>')}</p>
      `,
    });

    return json({ ok: true, id: info.messageId });
  } catch (err) {
    // Nodemailer usually sets err.code: 'EAUTH' | 'ECONNECTION' | 'EENVELOPE' | etc.
    console.error('MAIL_ERROR', { code: err?.code, message: err?.message });
    return json(
      {
        error: 'Server error',
        // Expose minimal debug info to the client to help you fix it (safe to remove later)
        debug: {
          code: err?.code || null,
          msg: err?.message || null,
          tip:
            err?.code === 'EAUTH'
              ? 'EAUTH: Wrong Gmail or app password. Enable 2-Step Verification → App passwords and use the 16-char password.'
              : err?.code === 'ECONNECTION'
              ? 'ECONNECTION: Unable to reach smtp.gmail.com:465 (network/firewall).'
              : undefined,
        },
      },
      500
    );
  }
}
