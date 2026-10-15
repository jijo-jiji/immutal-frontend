'use server';

import { PILOT_INTERESTS, type PilotFormState } from '@/lib/pilot';

const TO_EMAIL = 'azizi.sahari@unipact.com.my';
// Resend's shared sender only delivers to the Resend account owner's address.
// After verifying immutal.xyz in Resend, set PILOT_FROM_EMAIL to e.g. "Immutal <pilot@immutal.xyz>".
const FROM_EMAIL = process.env.PILOT_FROM_EMAIL || 'Immutal Pilot Form <onboarding@resend.dev>';

const LIMITS = { name: 120, company: 160, email: 200, phone: 40, role: 120, message: 2000 };

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export async function submitPilotRequest(_prev: PilotFormState, formData: FormData): Promise<PilotFormState> {
  // Honeypot: real visitors never see or fill this field.
  if (field(formData, 'website')) {
    return { status: 'success', message: "Thanks! Your pilot request is in. We'll be in touch soon." };
  }

  const data = {
    name: field(formData, 'name'),
    company: field(formData, 'company'),
    email: field(formData, 'email'),
    phone: field(formData, 'phone'),
    role: field(formData, 'role'),
    interest: field(formData, 'interest'),
    message: field(formData, 'message'),
  };

  const fieldErrors: PilotFormState['fieldErrors'] = {};
  if (!data.name) fieldErrors.name = 'Please enter your name.';
  if (!data.company) fieldErrors.company = 'Please enter your company.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fieldErrors.email = 'Please enter a valid email.';
  if (!(PILOT_INTERESTS as readonly string[]).includes(data.interest)) fieldErrors.interest = 'Please choose one.';
  for (const [key, max] of Object.entries(LIMITS)) {
    if (data[key as keyof typeof LIMITS].length > max) {
      return { status: 'error', message: `The ${key} field is too long (max ${max} characters).`, values: data };
    }
  }
  if (Object.keys(fieldErrors).length) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors, values: data };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Pilot form: RESEND_API_KEY is not set');
    return { status: 'error', message: `The form is not available right now. Please email ${TO_EMAIL}.`, values: data };
  }

  const rows: [string, string][] = [
    ['Name', data.name],
    ['Company', data.company],
    ['Email', data.email],
    ['Phone', data.phone || '-'],
    ['Role', data.role || '-'],
    ['Interest', data.interest],
    ['Message', data.message || '-'],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html =
    '<h2>New Immutal pilot request</h2><table cellpadding="6" style="border-collapse:collapse">' +
    rows
      .map(([k, v]) => `<tr><td style="vertical-align:top;color:#676c74">${k}</td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
      .join('') +
    '</table>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: data.email,
        subject: `Pilot request: ${data.company} (${data.interest})`.replace(/[\r\n]+/g, ' '),
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Pilot form: Resend error', res.status, await res.text());
      return { status: 'error', message: `Something went wrong sending your request. Please email ${TO_EMAIL}.`, values: data };
    }
  } catch (err) {
    console.error('Pilot form: network error', err);
    return { status: 'error', message: `Something went wrong sending your request. Please email ${TO_EMAIL}.`, values: data };
  }

  return { status: 'success', message: "Thanks! Your pilot request is in. We'll be in touch soon." };
}
