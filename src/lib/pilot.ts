export const PILOT_INTERESTS = [
  'Pilot: pharma cold chain',
  'Pilot: Halal export',
  'Pilot: both',
  'White-label partnership (WMS / ERP vendor)',
  'Other',
] as const;

export type PilotFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<'name' | 'company' | 'email' | 'interest', string>>;
  /** Submitted values, echoed back so the form keeps them after an error. */
  values?: Partial<Record<PilotField, string>>;
};

export type PilotField = 'name' | 'company' | 'email' | 'phone' | 'role' | 'interest' | 'message';
