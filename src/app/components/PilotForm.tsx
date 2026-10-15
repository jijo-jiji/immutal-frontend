'use client';

import { startTransition, useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitPilotRequest } from '../actions/pilot';
import { PILOT_INTERESTS, type PilotFormState } from '@/lib/pilot';

const initialState: PilotFormState = { status: 'idle', message: '' };

const inputClass =
  'w-full min-h-12 rounded-[2px] border border-line-strong bg-surface px-3 py-2.5 type-body text-ink placeholder:text-muted ' +
  'focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-accent aria-invalid:border-tampered';

function Field({
  id, label, optional, error, children,
}: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-small font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="type-small text-tampered">{error}</p>}
    </div>
  );
}

export default function PilotForm() {
  const [state, formAction, pending] = useActionState(submitPilotRequest, initialState);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.status === 'success') {
    return (
      <div className="bg-surface text-ink rounded-[2px] p-6 sm:p-8 flex flex-col items-start gap-4" role="status">
        <CheckCircle2 className="size-10 text-verified" aria-hidden="true" />
        <h3 className="type-h3">Request received</h3>
        <p className="type-body text-ink-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      // Submit manually so React doesn't reset the fields when the server returns an error.
      onSubmit={e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="bg-surface text-ink rounded-[2px] p-6 sm:p-8 flex flex-col gap-5" noValidate>
      <h3 className="type-h3">Register for a pilot</h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pilot-name" label="Name" error={err.name}>
          <input id="pilot-name" name="name" defaultValue={v.name} autoComplete="name" required maxLength={120} className={inputClass}
            aria-invalid={!!err.name} aria-describedby={err.name ? 'pilot-name-error' : undefined} />
        </Field>
        <Field id="pilot-company" label="Company" error={err.company}>
          <input id="pilot-company" name="company" defaultValue={v.company} autoComplete="organization" required maxLength={160} className={inputClass}
            aria-invalid={!!err.company} aria-describedby={err.company ? 'pilot-company-error' : undefined} />
        </Field>
        <Field id="pilot-email" label="Work email" error={err.email}>
          <input id="pilot-email" name="email" defaultValue={v.email} type="email" autoComplete="email" required maxLength={200} className={inputClass}
            aria-invalid={!!err.email} aria-describedby={err.email ? 'pilot-email-error' : undefined} />
        </Field>
        <Field id="pilot-phone" label="Phone" optional>
          <input id="pilot-phone" name="phone" defaultValue={v.phone} type="tel" autoComplete="tel" maxLength={40} className={inputClass} />
        </Field>
        <Field id="pilot-role" label="Role" optional>
          <input id="pilot-role" name="role" defaultValue={v.role} autoComplete="organization-title" maxLength={120} placeholder="e.g. QA Manager" className={inputClass} />
        </Field>
        <Field id="pilot-interest" label="I'm interested in" error={err.interest}>
          <select id="pilot-interest" name="interest" required defaultValue={v.interest ?? ''} className={inputClass}
            aria-invalid={!!err.interest} aria-describedby={err.interest ? 'pilot-interest-error' : undefined}>
            <option value="" disabled>Choose one</option>
            {PILOT_INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
      </div>

      <Field id="pilot-message" label="What do you move, and where do your logs live today?" optional>
        <textarea id="pilot-message" name="message" defaultValue={v.message} rows={4} maxLength={2000} className={inputClass}
          placeholder="e.g. Vaccines, 12 reefer trucks, temperature logs in our WMS" />
      </Field>

      {/* Honeypot for bots: hidden from people and screen readers */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="pilot-website">Website</label>
        <input id="pilot-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' && (
        <p className="type-small text-tampered" role="alert">{state.message}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? 'Sending…' : 'Request a pilot'}
        </button>
        <p className="type-small text-muted">We only use these details to reply to you.</p>
      </div>
    </form>
  );
}
