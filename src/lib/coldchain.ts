// Shared demo shipment + Merkle hashing used by the hero chart, the Merkle tree
// and the certificate, so every part of the page shows the same, real root.
// Uses Web Crypto, which exists in browsers and in Node (server components).

export type Reading = { time: string; temp_c: number };

export const SHIPMENT = {
  id: 'SHP-KUL-PEN-0419',
  sensor: 'REEFER-07',
  route: 'Kuala Lumpur → Penang',
  cargo: 'Vaccine vials',
  date: '2026-08-02',
  batchId: 'BATCH-20260802-KUL-PEN',
};

export const SAFE_MIN_C = 2;
export const SAFE_MAX_C = 8;

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

// A real Immutal anchor on Sepolia, shown as a live reference (it anchors a different record)
export const REFERENCE_TX = '0xf5e4e4ca7ff05df7e9a51082e2efa1b3252936406542c6df448e51f97974fb37';

export const isExcursion = (r: Reading) => r.temp_c > SAFE_MAX_C || r.temp_c < SAFE_MIN_C;

// The "fix" someone would make: pull an excursion back into range, or nudge a normal value
export const tamperedValue = (r: Reading): number =>
  isExcursion(r) ? 5.9 : Math.round((r.temp_c + 0.4) * 10) / 10;

export const applyEdits = (edited: ReadonlySet<number>): Reading[] =>
  READINGS.map((r, i) => (edited.has(i) ? { ...r, temp_c: tamperedValue(r) } : r));

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

/** Returns every level of the tree: levels[0] = leaves, levels[levels.length - 1] = [root]. */
export async function buildTree(readings: Reading[]): Promise<string[][]> {
  const levels = [await Promise.all(readings.map(r => sha256Hex(JSON.stringify(r))))];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    const next: string[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      // Odd node out is paired with itself
      next.push(await sha256Hex(prev[i] + (prev[i + 1] ?? prev[i])));
    }
    levels.push(next);
  }
  return levels;
}

export const rootOf = (levels: string[][]) => '0x' + levels[levels.length - 1][0];

export const shortHash = (hex: string, head = 6, tail = 4) => {
  const h = hex.startsWith('0x') ? hex : '0x' + hex;
  return `${h.slice(0, head + 2)}…${h.slice(-tail)}`;
};
