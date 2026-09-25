"use client";

import { useState } from 'react';
import { MousePointerClick, RotateCcw } from 'lucide-react';
import { applyEdits, isExcursion, READINGS, rootOf, shortHash, tamperedValue } from '@/lib/coldchain';
import { useAnchoredTree, useMerkleTree } from '@/lib/useMerkleTree';

// SVG layout (user units). The container scrolls sideways on narrow phones.
const W = 800;
const H = 330;
const SIDE = 16;
const SLOT = (W - SIDE * 2) / READINGS.length;
const LEAF = { w: 84, h: 66, y: 252 };
// Internal levels, from just above the leaves up to the root
const LEVELS = [
  { w: 120, h: 34, y: 176 },
  { w: 150, h: 34, y: 104 },
  { w: 230, h: 42, y: 22 },
];

const leafCx = (i: number) => SIDE + SLOT * i + SLOT / 2;

/** Centre x of node j at tree level (0 = leaves). */
function nodeCx(level: number, j: number): number {
  if (level === 0) return leafCx(j);
  return (nodeCx(level - 1, j * 2) + nodeCx(level - 1, j * 2 + 1)) / 2;
}

const boxOf = (level: number) => (level === 0 ? LEAF : LEVELS[level - 1]);

export default function MerkleTree() {
  const [edited, setEdited] = useState<Set<number>>(new Set());
  const [focused, setFocused] = useState<number | null>(null);
  const readings = applyEdits(edited);
  const anchored = useAnchoredTree();
  const current = useMerkleTree(readings);
  const ready = anchored && current;
  const verified = ready && rootOf(anchored) === rootOf(current);

  const toggle = (i: number) =>
    setEdited(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  const onPath = (level: number, j: number) => focused !== null && j === focused >> level;
  const broken = (level: number, j: number) => !!ready && current[level][j] !== anchored[level][j];

  const nodeClass = (level: number, j: number) =>
    broken(level, j)
      ? 'fill-tampered/10 stroke-tampered'
      : onPath(level, j) ? 'fill-accent-soft stroke-accent' : 'fill-surface stroke-line-strong';
  const lineClass = (level: number, j: number) =>
    broken(level, j) ? 'stroke-tampered' : onPath(level, j) ? 'stroke-accent' : 'stroke-line-strong';

  // Elbow connectors from each node up to its parent
  const connectors = [];
  for (let level = 0; level < LEVELS.length; level++) {
    const count = READINGS.length >> level;
    for (let j = 0; j < count; j++) {
      const child = boxOf(level);
      const parent = boxOf(level + 1);
      const cx = nodeCx(level, j);
      const px = nodeCx(level + 1, j >> 1);
      const top = child.y;
      const bottom = parent.y + parent.h;
      const mid = (top + bottom) / 2;
      const highlighted = broken(level, j) || onPath(level, j);
      connectors.push(
        <polyline key={`${level}-${j}`} points={`${cx},${top} ${cx},${mid} ${px},${mid} ${px},${bottom}`}
          fill="none" className={lineClass(level, j)} strokeWidth={highlighted ? 2 : 1} />,
      );
    }
  }

  return (
    <div className="bg-surface border border-ink">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line px-4 sm:px-6 py-3">
        <div className="type-small font-semibold flex items-center gap-2">
          <MousePointerClick className="size-4 text-accent" strokeLinecap="square" aria-hidden="true" />
          Hover a reading to trace its proof. Click it to edit the value.
        </div>
        <div className="type-data text-muted">{READINGS.length} readings → 1 root</div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[680px] h-auto" role="group" aria-label="Merkle tree of 8 temperature readings">
          {connectors}

          {/* Internal nodes and root */}
          {LEVELS.map((box, idx) => {
            const level = idx + 1;
            const count = READINGS.length >> level;
            const isRoot = level === LEVELS.length;
            return Array.from({ length: count }, (_, j) => {
              const cx = nodeCx(level, j);
              const hash = current?.[level][j];
              return (
                <g key={`${level}-${j}`}>
                  <rect x={cx - box.w / 2} y={box.y} width={box.w} height={box.h} className={nodeClass(level, j)}
                    strokeWidth={broken(level, j) || onPath(level, j) || isRoot ? 2 : 1} />
                  <text x={cx} y={box.y + box.h / 2 + 4} textAnchor="middle"
                    className={`font-mono text-[12px] ${broken(level, j) ? 'fill-tampered font-semibold' : 'fill-ink'}`}>
                    {isRoot ? 'ROOT ' : ''}{hash ? shortHash(hash, isRoot ? 8 : 5, isRoot ? 6 : 3) : '…'}
                  </text>
                </g>
              );
            });
          })}

          {/* Leaves: the readings themselves */}
          {readings.map((r, i) => {
            const cx = leafCx(i);
            const isEdited = edited.has(i);
            const tempClass = isEdited ? 'fill-tampered' : isExcursion(r) ? 'fill-excursion' : 'fill-ink';
            return (
              <g
                key={r.time}
                role="button"
                tabIndex={0}
                aria-pressed={isEdited}
                aria-label={`${r.time}, ${r.temp_c} degrees. ${isEdited ? 'Edited. Press to restore.' : 'Press to edit.'}`}
                className="cursor-pointer outline-none"
                onClick={() => toggle(i)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}
                onMouseEnter={() => setFocused(i)}
                onMouseLeave={() => setFocused(null)}
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused(null)}
              >
                <rect x={cx - LEAF.w / 2} y={LEAF.y} width={LEAF.w} height={LEAF.h} className={nodeClass(0, i)}
                  strokeWidth={broken(0, i) || onPath(0, i) ? 2 : 1} />
                <text x={cx} y={LEAF.y + 17} textAnchor="middle" className="fill-muted font-mono text-[11px]">{r.time}</text>
                <text x={cx} y={LEAF.y + 38} textAnchor="middle" className={`${tempClass} text-[17px] font-bold`}>
                  {r.temp_c.toFixed(1)}°
                </text>
                <text x={cx} y={LEAF.y + 56} textAnchor="middle" className={`font-mono text-[11px] ${broken(0, i) ? 'fill-tampered' : 'fill-muted'}`}>
                  {current ? current[0][i].slice(0, 6) : '…'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-line px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div aria-live="polite">
          <div className={`type-eyebrow flex items-center gap-2 ${!ready ? 'text-muted' : verified ? 'text-verified' : 'text-tampered'}`}>
            <span className="inline-block size-2 bg-current" aria-hidden="true" />
            {!ready ? 'Hashing…' : verified ? 'Root matches the anchor' : 'Root mismatch: tampering detected'}
          </div>
          <p className="type-small text-ink-2 mt-1.5">
            {edited.size === 0
              ? 'Every reading hashes up into one root. Only that root goes on-chain.'
              : `Edited: ${[...edited].sort((a, b) => a - b).map(i => `${READINGS[i].time} (${READINGS[i].temp_c.toFixed(1)}° → ${tamperedValue(READINGS[i]).toFixed(1)}°)`).join(', ')}. The red path shows exactly which hashes broke.`}
          </p>
        </div>
        {edited.size > 0 && (
          <button onClick={() => setEdited(new Set())} className="btn btn-secondary min-h-10 text-sm shrink-0">
            <RotateCcw className="size-4" strokeLinecap="square" aria-hidden="true" />Reset
          </button>
        )}
      </div>
    </div>
  );
}
