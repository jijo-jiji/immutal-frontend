// Demo shipment shared by the hero chart, the Merkle tree and the certificate. Every hash on
// the page comes from protocol.ts (RFC 8785 entries, salted RFC 9162 leaves, anchor commitment),
// so the demo seals records exactly the way the real service does. Only the salts differ:
// they are fixed here so the page renders the same everywhere, and random 128-bit values in
// the real service. Uses Web Crypto, which exists in browsers and in Node (server components).

import {
  anchorCommitment, canonicalise, fromHex, inclusionPath, leafHash, perfectLevels, sha256, toHex, treeRoot,
  type Entry,
} from './protocol';

export type Reading = { time: string; temp_c: number };

export const SHIPMENT = {
  id: 'SHP-KUL-PEN-0419',
  sensor: 'REEFER-07',
  site: 'KUL-WH1',
  route: 'Kuala Lumpur → Penang',
  cargo: 'Vaccine vials',
  date: '2026-08-02',
  batchId: 'BATCH-20260802-KUL-PEN',
};

export const SAFE_MIN_C = 2;
export const SAFE_MAX_C = 8;

// Local (Kuala Lumpur, UTC+8) times of the day's readings.
export const READINGS: Reading[] = [
  { time: '09:30', temp_c: 4.2 },
  { time: '09:45', temp_c: 4.5 },
  { time: '10:00', temp_c: 5.1 },
  { time: '10:15', temp_c: 6.8 },
  { time: '10:30', temp_c: 9.8 },
  { time: '10:45', temp_c: 7.4 },
  { time: '11:00', temp_c: 5.2 },
  { time: '11:15', temp_c: 4.6 },
];

export const EXCURSION_INDEX = READINGS.findIndex(r => r.temp_c > SAFE_MAX_C);

// Periods count days from 2026-01-01T00:00:00+08:00, so each period is one Kuala Lumpur day.
export const PERIOD = Math.round((Date.UTC(2026, 7, 2) - Date.UTC(2026, 0, 1)) / 86_400_000);

// A real anchor from the v0 prototype on Sepolia (one hash per record, superseded by the
// batch design). It anchors a different record and is shown as a checkable reference.
export const REFERENCE_TX = '0xf5e4e4ca7ff05df7e9a51082e2efa1b3252936406542c6df448e51f97974fb37';

export const isExcursion = (r: Reading) => r.temp_c > SAFE_MAX_C || r.temp_c < SAFE_MIN_C;

// The "fix" someone would make: pull an excursion back into range, or nudge a normal value
export const tamperedValue = (r: Reading): number =>
  isExcursion(r) ? 5.9 : Math.round((r.temp_c + 0.4) * 10) / 10;

export const applyEdits = (edited: ReadonlySet<number>): Reading[] =>
  READINGS.map((r, i) => (edited.has(i) ? { ...r, temp_c: tamperedValue(r) } : r));

const isoUtc = (time: string, plusSeconds = 0): string => {
  const [h, m] = time.split(':').map(Number);
  const ms = Date.UTC(2026, 7, 2, h - 8, m, plusSeconds); // Kuala Lumpur is UTC+8
  return new Date(ms).toISOString().replace('.000Z', 'Z');
};

/** One reading in its single normal form: integer centi-degrees, UTC times, server fields. */
export const entryFor = (r: Reading, seq: number): Entry => ({
  v: 1,
  kind: 'reading',
  site: SHIPMENT.site,
  device: SHIPMENT.sensor,
  seq,
  captured_at: isoUtc(r.time),
  temp_cC: Math.round(r.temp_c * 100),
  period: PERIOD,
  received_at: isoUtc(r.time, 30),
});

const demoSalt = async (label: string) =>
  (await sha256(new TextEncoder().encode(`immutal-demo-${label}`))).slice(0, 16);

export type Sealed = {
  /** levels[0] = salted leaves, last level = [root]; hex without 0x. */
  levels: string[][];
  root: string;
  /** The 32 bytes an anchor writes on-chain for the period. */
  commitment: string;
  entries: string[];
};

/** Seal a day of readings: canonical entries, salted leaves, RFC 9162 tree, commitment. */
export async function sealReadings(readings: Reading[]): Promise<Sealed> {
  const entries = readings.map((r, i) => canonicalise(entryFor(r, i)));
  const leaves = await Promise.all(entries.map(async (text, i) => leafHash(await demoSalt(`record-${i}`), text)));
  const levels = await perfectLevels(leaves);
  const root = await treeRoot(leaves);
  const commitment = await anchorCommitment(PERIOD, leaves.length, root, await demoSalt(`batch-${PERIOD}`));
  return { levels: levels.map(level => level.map(toHex)), root: toHex(root), commitment: toHex(commitment), entries };
}

/** The inclusion path an auditor receives for one record, leaf to root, as hex. */
export async function proofFor(sealed: Sealed, index: number): Promise<string[]> {
  return (await inclusionPath(sealed.levels[0].map(fromHex), index)).map(toHex);
}

export const shortHash = (hex: string, head = 6, tail = 4) => {
  const h = hex.startsWith('0x') ? hex : '0x' + hex;
  return `${h.slice(0, head + 2)}…${h.slice(-tail)}`;
};
