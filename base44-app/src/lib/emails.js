import { base44 } from '@/api/base44Client';

function wrap(heading, lines) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#F5F3EE;padding:36px 16px">
    <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:18px;padding:36px">
      <div style="font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:#B08D57;font-weight:600">CEO/$</div>
      <h1 style="font-size:23px;line-height:1.25;color:#0B0B0C;margin:18px 0 14px">${heading}</h1>
      ${lines
        .map((line) => `<p style="font-size:15px;line-height:1.65;color:#3A3A3C;margin:0 0 13px">${line}</p>`)
        .join('')}
    </div>
  </div>`;
}

export async function sendBrandEmail({ to, subject, heading, lines }) {
  if (!to) return;
  try {
    await base44.integrations.Core.SendEmail({ to, subject, html: wrap(heading, lines) });
  } catch (err) {
    console.warn('CEO/$ status email failed:', err);
  }
}