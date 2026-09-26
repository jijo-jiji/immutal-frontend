"use client";

import { useEffect, useState } from 'react';

const HEALTH_URL = 'https://immutal.onrender.com/api/health/';
// Render free tier can take ~50s to cold-start; give up after this long
const HEALTH_TIMEOUT_MS = 75_000;
// Show "WAKING" instead of "CHECKING" once the request is clearly a cold start
const HEALTH_WAKING_AFTER_MS = 3_000;

type Status = 'checking' | 'waking' | 'online' | 'offline';

const LABEL: Record<Status, { text: string; className: string }> = {
  checking: { text: 'CHECKING', className: 'text-muted animate-pulse' },
  waking: { text: 'WAKING NODE', className: 'text-muted animate-pulse' },
  online: { text: 'ONLINE', className: 'text-verified' },
  offline: { text: 'OFFLINE', className: 'text-tampered' },
};

// Pings the key-less, zero-cost health endpoint: wakes Render and reports real status
export default function SysStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const wakingTimer = setTimeout(() => setStatus('waking'), HEALTH_WAKING_AFTER_MS);
    const abortTimer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    fetch(HEALTH_URL, { signal: controller.signal, cache: 'no-store' })
      .then(res => { if (!disposed) setStatus(res.ok ? 'online' : 'offline'); })
      .catch(() => { if (!disposed) setStatus('offline'); })
      .finally(() => {
        clearTimeout(wakingTimer);
        clearTimeout(abortTimer);
      });

    return () => {
      disposed = true;
      clearTimeout(wakingTimer);
      clearTimeout(abortTimer);
      controller.abort();
    };
  }, []);

  return (
    <div className={`type-eyebrow whitespace-nowrap shrink-0 flex items-center gap-2 ${LABEL[status].className}`} aria-live="polite">
      <span className="inline-block size-2 bg-current" aria-hidden="true" />
      <span><span className="sr-only">Engine status: </span>{LABEL[status].text}</span>
    </div>
  );
}
