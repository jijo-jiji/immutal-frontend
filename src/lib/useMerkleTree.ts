"use client";

import { useEffect, useState } from 'react';
import { READINGS, sealReadings, type Reading, type Sealed } from './coldchain';

/** Seals readings in the browser; null until the first hash resolves. */
export function useSealed(readings: Reading[]): Sealed | null {
  const [sealed, setSealed] = useState<Sealed | null>(null);
  const key = JSON.stringify(readings);

  useEffect(() => {
    let cancelled = false;
    sealReadings(JSON.parse(key)).then(result => {
      if (!cancelled) setSealed(result);
    });
    return () => { cancelled = true; };
  }, [key]);

  return sealed;
}

/** The original, untouched log: what the anchor committed to. */
export const useAnchored = () => useSealed(READINGS);
