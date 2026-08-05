import nodemailer from "nodemailer";

export type Branding = {
  brand_name: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  primary_color: string;
  accent_color: string;
};

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string | null;
  from_email: string;
  enabled: boolean;
};

const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export function renderEmail(
  brand: Branding,
  title: string,
  intro: string,
  rows: [string, string][],
  footnote?: string,
) {
  const navy = brand.primary_color || "#0b2a4a";
  const accent = brand.accent_color || "#d98324";
  const logo = brand.logo_url
    ? `<img src="${esc(brand.logo_url)}" alt="${esc(brand.brand_name)}" height="36" style="height:36px;border:0;display:block" />`
    : `<div style="font:600 22px Georgia,serif;color:#ffffff">${esc(brand.brand_name)}</div>`;

  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e8eaee;color:#5b6472;font:400 14px Arial,sans-serif">${esc(k)}</td>` +
        `<td style="padding:10px 0;border-bottom:1px solid #e8eaee;text-align:right;color:#12181f;font:600 14px Arial,sans-serif">${esc(v)}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f4f5f7">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e8eaee">
    <tr><td style="background:${esc(navy)};padding:20px 28px">${logo}</td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 8px;font:600 22px Georgia,serif;color:${esc(navy)}">${esc(title)}</h1>
      <p style="margin:0 0 20px;font:400 14px/1.6 Arial,sans-serif;color:#5b6472">${esc(intro)}</p>
      <table width="100%" cellpadding="0" cellspacing="0">${body}</table>
      ${footnote ? `<p style="margin:20px 0 0;font:400 12px/1.6 Arial,sans-serif;color:#7a8290">${esc(footnote)}</p>` : ""}
      <div style="height:3px;background:${esc(accent)};margin:24px 0 0"></div>
    </td></tr>
    <tr><td style="padding:18px 28px;background:#fafbfc;font:400 12px/1.6 Arial,sans-serif;color:#7a8290">
      <strong style="color:${esc(navy)}">${esc(brand.brand_name)}</strong><br/>
      ${esc(brand.address)}<br/>${esc(brand.contact_email)} · ${esc(brand.contact_phone)}
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

export async function sendMail(
  smtp: SmtpConfig,
  brand: Branding,
  to: string,
  subject: string,
  html: string,
) {
  if (!smtp.enabled) throw new Error("Email sending is disabled in admin settings");
  if (!smtp.host || !smtp.from_email) throw new Error("SMTP is not configured");

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.username ? { user: smtp.username, pass: smtp.password } : undefined,
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"${smtp.from_name || brand.brand_name}" <${smtp.from_email}>`,
    to,
    subject: `${subject} · ${brand.brand_name}`,
    html,
  });
}
