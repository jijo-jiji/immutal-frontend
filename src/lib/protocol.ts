// The Immutal sealing protocol, as the FYP1 reference implementation defines it:
//
//   entry      RFC 8785 canonical JSON (integers and strings only)
//   leaf       SHA-256(0x00 || salt || entry)                   RFC 9162 leaf, 16-byte random salt
//   node       SHA-256(0x01 || left || right)                   RFC 9162 section 2.1.1
//   root       RFC 9162 MTH, split at the largest power of two below n (no duplicated last leaf)
//   commitment SHA-256("IMMUTAL-ANCHOR-V1" || uint64 period || uint64 size || root || batch salt)
//
// Only the commitment goes on-chain. Binding the tree size inside it is what stops a valid
// proof being passed off for a tree one leaf larger. Pure functions on Web Crypto, so the
// same file runs in the browser, in server components and under `node --test`.

export type Entry = Readonly<Record<string, string | number>>;

export const DOMAIN = 'IMMUTAL-ANCHOR-V1';
export const SALT_SIZE = 16;
export const HASH_SIZE = 32;

const encoder = new TextEncoder();

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) throw new Error('not a hex string');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
};

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  // Copy into a fresh ArrayBuffer so the call also type-checks for views on shared buffers.
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(data)));
}

/**
 * RFC 8785 canonical JSON for a flat entry. Entries hold strings and safe integers only,
 * so the rules reduce to: no whitespace, member names in UTF-16 code-unit order, minimal
 * string escaping and plain decimal integers. JSON.stringify already escapes strings the
 * way RFC 8785 section 3.2.2.2 requires, and the default sort compares UTF-16 code units.
 */
export function canonicalise(entry: Entry): string {
  const members = Object.keys(entry).sort().map(name => {
    const value = entry[name];
    if (typeof value === 'number' && !Number.isSafeInteger(value)) {
      throw new Error(`${name}: entries carry safe integers only`);
    }
    return `${JSON.stringify(name)}:${JSON.stringify(value)}`;
  });
  return `{${members.join(',')}}`;
}

export const leafHash = (salt: Uint8Array, entry: string | Uint8Array): Promise<Uint8Array> =>
  sha256(concat(Uint8Array.of(0x00), salt, typeof entry === 'string' ? encoder.encode(entry) : entry));

export const nodeHash = (left: Uint8Array, right: Uint8Array): Promise<Uint8Array> =>
  sha256(concat(Uint8Array.of(0x01), left, right));

/** Largest power of two strictly below n, for n >= 2. */
const split = (n: number): number => 2 ** Math.floor(Math.log2(n - 1));

async function subtreeRoot(leaves: readonly Uint8Array[], low: number, high: number): Promise<Uint8Array> {
  if (high - low === 1) return leaves[low];
  const k = split(high - low);
  return nodeHash(await subtreeRoot(leaves, low, low + k), await subtreeRoot(leaves, low + k, high));
}

/** MTH(D[n]) over leaf hashes. The empty tree hashes the empty string. */
export async function treeRoot(leaves: readonly Uint8Array[]): Promise<Uint8Array> {
  return leaves.length === 0 ? sha256(new Uint8Array()) : subtreeRoot(leaves, 0, leaves.length);
}

/** Every level of a tree whose size is a power of two: levels[0] = leaves, last = [root]. */
export async function perfectLevels(leaves: readonly Uint8Array[]): Promise<Uint8Array[][]> {
  if (leaves.length === 0 || (leaves.length & (leaves.length - 1)) !== 0) {
    throw new Error('perfectLevels needs a power-of-two number of leaves');
  }
  const levels: Uint8Array[][] = [[...leaves]];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    const next: Uint8Array[] = [];
    for (let i = 0; i < prev.length; i += 2) next.push(await nodeHash(prev[i], prev[i + 1]));
    levels.push(next);
  }
  return levels;
}

/** PATH(m, D[n]) from RFC 9162 section 2.1.3.1, ordered from leaf to root. */
export async function inclusionPath(leaves: readonly Uint8Array[], index: number): Promise<Uint8Array[]> {
  if (!Number.isInteger(index) || index < 0 || index >= leaves.length) throw new Error('leaf index is outside the tree');
  const path: Uint8Array[] = [];
  let low = 0;
  let high = leaves.length;
  while (high - low > 1) {
    const k = split(high - low);
    if (index < low + k) {
      path.push(await subtreeRoot(leaves, low + k, high));
      high = low + k;
    } else {
      path.push(await subtreeRoot(leaves, low, low + k));
      low += k;
    }
  }
  return path.reverse();
}

/** Recompute the root from a leaf and its path, following RFC 9162 section 2.1.3.2. */
export async function rootFromPath(index: number, size: number, leaf: Uint8Array, path: readonly Uint8Array[]): Promise<Uint8Array> {
  if (!Number.isInteger(index) || !Number.isInteger(size) || index < 0 || index >= size) throw new Error('leaf index is outside the tree');
  let fn = index;
  let sn = size - 1;
  let r = leaf;
  for (const p of path) {
    if (sn === 0) throw new Error('proof is longer than the tree allows');
    if (fn % 2 === 1 || fn === sn) {
      r = await nodeHash(p, r);
      // A rightmost node without a sibling rises through levels unchanged.
      while (fn !== 0 && fn % 2 === 0) { fn = Math.floor(fn / 2); sn = Math.floor(sn / 2); }
    } else {
      r = await nodeHash(r, p);
    }
    fn = Math.floor(fn / 2);
    sn = Math.floor(sn / 2);
  }
  if (sn !== 0) throw new Error('proof is shorter than the tree requires');
  return r;
}

const u64be = (value: number): Uint8Array => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('period and size must be non-negative safe integers');
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, BigInt(value));
  return out;
};

/** The 32 bytes an anchor writes on-chain for one period. */
export function anchorCommitment(period: number, size: number, root: Uint8Array, batchSalt: Uint8Array): Promise<Uint8Array> {
  if (root.length !== HASH_SIZE) throw new Error('roots are 32 bytes');
  if (batchSalt.length !== SALT_SIZE) throw new Error(`batch salts are ${SALT_SIZE} bytes`);
  return sha256(concat(encoder.encode(DOMAIN), u64be(period), u64be(size), root, batchSalt));
}
