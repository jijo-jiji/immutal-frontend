"use client";

import { useState } from 'react';
import { EyeOff, RotateCcw } from 'lucide-react';
import {
  applyEdits, EXCURSION_INDEX, isExcursion, READINGS, rootOf, SAFE_MAX_C, SAFE_MIN_C, SHIPMENT, shortHash,
} from '@/lib/coldchain';
import { useAnchoredTree, useMerkleTree } from '@/lib/useMerkleTree';

// Chart geometry (SVG user units; the SVG scales to its container)
const W = 440;
const H = 230;
const PAD = { top: 18, right: 18, bottom: 30, left: 34 };
const Y_MAX = 12;
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;
const x = (i: number) => PAD.left + (i * plotW) / (READINGS.length - 1);
const y = (t: number) => PAD.top + ((Y_MAX - t) / Y_MAX) * plotH;

const NO_EDITS = new Set<number>();
const EXCURSION_EDIT = new Set([EXCURSION_INDEX]);

export default function ExcursionChart() {
  const [tampered, setTampered] = useState(false);
  const readings = applyEdits(tampered ? EXCURSION_EDIT : NO_EDITS);
  const anchored = useAnchoredTree();
  const current = useMerkleTree(readings);
  const ready = anchored && current;
  const verified = ready && rootOf(anchored) === rootOf(current);

  const original = READINGS[EXCURSION_INDEX];
  const edited = readings[EXCURSION_INDEX];

  return (
    <figure className="bg-surface border border-ink shadow-[8px_8px_0_0_var(--color-line-strong)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 sm:px-5 py-3">
        <div className="min-w-0">
          <div className="type-data font-semibold truncate">{SHIPMENT.id} · {SHIPMENT.sensor}</div>
          <div className="type-small text-muted truncate">{SHIPMENT.cargo}, {SHIPMENT.route}</div>
        </div>
        <span className="type-eyebrow text-muted border border-line px-1.5 py-0.5 shrink-0">Live demo</span>
      </div>

      {/* Chart */}
      <div className="px-2 sm:px-3 pt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
          aria-label={`Temperature log for ${SHIPMENT.id}. ${readings.map(r => `${r.time} ${r.temp_c} degrees`).join(', ')}.`}>
          {/* Safe band */}
          <rect x={PAD.left} y={y(SAFE_MAX_C)} width={plotW} height={y(SAFE_MIN_C) - y(SAFE_MAX_C)} className="fill-accent-soft" />
          <line x1={PAD.left} x2={W - PAD.right} y1={y(SAFE_MAX_C)} y2={y(SAFE_MAX_C)} className="stroke-excursion" strokeDasharray="4 4" />
          <line x1={PAD.left} x2={W - PAD.right} y1={y(SAFE_MIN_C)} y2={y(SAFE_MIN_C)} className="stroke-line-strong" strokeDasharray="4 4" />
          <text x={W - PAD.right} y={y(SAFE_MAX_C) - 6} textAnchor="end" className="fill-excursion font-mono text-[11px]">MAX 8 °C</text>
          <text x={W - PAD.right} y={y(SAFE_MIN_C) - 6} textAnchor="end" className="fill-muted font-mono text-[11px]">MIN 2 °C</text>

          {/* Y axis */}
          {[0, 4, 8, 12].map(t => (
            <text key={t} x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">{t}°</text>
          ))}
          <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} className="stroke-line-strong" />

          {/* X axis: every other time, so labels stay legible on phones */}
          {READINGS.map((r, i) => i % 2 === 0 && (
            <text key={r.time} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">{r.time}</text>
          ))}

          {/* Ghost of the original reading once it has been edited */}
          {tampered && (
            <g>
              <line x1={x(EXCURSION_INDEX)} x2={x(EXCURSION_INDEX)} y1={y(original.temp_c) + 5} y2={y(edited.temp_c) - 5}
                className="stroke-tampered" strokeDasharray="3 3" />
              <rect x={x(EXCURSION_INDEX) - 5} y={y(original.temp_c) - 5} width={10} height={10}
                className="fill-surface stroke-tampered" strokeDasharray="2 2" />
            </g>
          )}

          {/* Readings line */}
          <polyline points={readings.map((r, i) => `${x(i)},${y(r.temp_c)}`).join(' ')}
            fill="none" className="stroke-ink" strokeWidth={2} strokeLinejoin="miter" />
          {readings.map((r, i) => {
            const isEdit = tampered && i === EXCURSION_INDEX;
            const cls = isEdit ? 'fill-tampered' : isExcursion(r) ? 'fill-excursion' : 'fill-ink';
            const size = isEdit || isExcursion(r) ? 10 : 6;
            return <rect key={r.time} x={x(i) - size / 2} y={y(r.temp_c) - size / 2} width={size} height={size} className={cls} />;
          })}

          {/* Callout */}
          {tampered ? (
            <text x={x(EXCURSION_INDEX)} y={y(original.temp_c) - 12} textAnchor="middle" className="fill-tampered font-mono text-[11px] font-semibold">
              WAS {original.temp_c.toFixed(1)} °C → EDITED TO {edited.temp_c.toFixed(1)}
            </text>
          ) : (
            <text x={x(EXCURSION_INDEX)} y={y(original.temp_c) - 12} textAnchor="middle" className="fill-excursion font-mono text-[11px] font-semibold">
              EXCURSION {original.temp_c.toFixed(1)} °C · {original.time}
            </text>
          )}
        </svg>
      </div>

      {/* Proof status */}
      <div className="border-t border-line px-4 sm:px-5 py-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div aria-live="polite" className="min-w-0">
          <div className={`type-eyebrow flex items-center gap-2 ${!ready ? 'text-muted' : verified ? 'text-verified' : 'text-tampered'}`}>
            <span className="inline-block size-2 bg-current" aria-hidden="true" />
            {!ready ? 'Hashing…' : verified ? 'Verified: matches anchored root' : 'Tampering detected: root mismatch'}
          </div>
          <dl className="type-data mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-ink-2">
            <dt className="text-muted">anchored</dt>
            <dd className="truncate">{anchored ? shortHash(rootOf(anchored), 10, 8) : '…'}</dd>
            <dt className="text-muted">current</dt>
            <dd className={`truncate ${ready && !verified ? 'text-tampered font-semibold' : ''}`}>{current ? shortHash(rootOf(current), 10, 8) : '…'}</dd>
          </dl>
        </div>
        <button
          onClick={() => setTampered(t => !t)}
          className={`btn min-h-11 text-sm ${tampered ? 'btn-secondary' : 'border border-tampered text-tampered hover:bg-tampered hover:text-white'}`}
        >
          {tampered
            ? <><RotateCcw className="size-4" strokeLinecap="square" aria-hidden="true" />Restore original</>
            : <><EyeOff className="size-4" strokeLinecap="square" aria-hidden="true" />Hide the excursion</>}
        </button>
      </div>
      <figcaption className="sr-only">Try editing the out-of-range reading and watch the cryptographic proof fail.</figcaption>
    </figure>
  );
}
