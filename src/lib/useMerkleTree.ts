"use client";

import { useEffect, useState } from 'react';
import { buildTree, READINGS, type Reading } from './coldchain';

/** Hashes readings into a Merkle tree in the browser; null until the first hash resolves. */
export function useMerkleTree(readings: Reading[]): string[][] | null {
  const [levels, setLevels] = useState<string[][] | null>(null);
  const key = JSON.stringify(readings);

  useEffect(() => {
    let cancelled = false;
    buildTree(JSON.parse(key)).then(result => {
      if (!cancelled) setLevels(result);
    });
    return () => { cancelled = true; };
  }, [key]);

  return levels;
}

/** The tree of the original, untouched log: what was anchored on-chain. */
export const useAnchoredTree = () => useMerkleTree(READINGS);
