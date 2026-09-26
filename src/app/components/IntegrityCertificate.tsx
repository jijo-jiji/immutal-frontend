import { buildTree, isExcursion, READINGS, rootOf, SAFE_MAX_C, SAFE_MIN_C, SHIPMENT } from '@/lib/coldchain';

// A design preview of the audit report a pilot customer would receive.
// The Merkle root is real: computed from the same readings as the demos above.
export default async function IntegrityCertificate() {
  const root = rootOf(await buildTree(READINGS));
  const excursions = READINGS.filter(isExcursion);

  const fields = [
    ['Shipment', SHIPMENT.id],
    ['Cargo', SHIPMENT.cargo],
    ['Route', SHIPMENT.route],
    ['Date', SHIPMENT.date],
    ['Sensor', SHIPMENT.sensor],
    ['Required range', `${SAFE_MIN_C.toFixed(1)}–${SAFE_MAX_C.toFixed(1)} °C`],
  ];

  return (
    <article className="relative bg-surface border border-ink shadow-[10px_10px_0_0_var(--color-line-strong)]" aria-label="Sample certificate of data integrity">
      {/* Title block */}
      <header className="flex items-start justify-between gap-4 border-b-2 border-ink px-5 sm:px-8 py-5">
        <div>
          <div className="font-mono text-xs font-bold tracking-[0.12em]">IMMUTAL</div>
          <h3 className="type-h3 mt-2">Certificate of data integrity</h3>
          <div className="type-data text-muted mt-1">No. IMM-CERT-{SHIPMENT.date.replaceAll('-', '')}-0419</div>
        </div>
        <span className="type-eyebrow text-muted border border-line-strong px-2 py-1 shrink-0">Sample</span>
      </header>

      {/* Shipment fields */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-line border-b border-line">
        {fields.map(([label, value]) => (
          <div key={label} className="bg-surface px-5 sm:px-8 py-3">
            <dt className="type-eyebrow text-muted">{label}</dt>
            <dd className="type-small font-semibold mt-1">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Readings table */}
      <div className="px-5 sm:px-8 py-5">
        <table className="w-full type-data">
          <caption className="type-eyebrow text-muted text-left mb-2">Temperature record · {READINGS.length} readings</caption>
          <thead>
            <tr className="border-b border-ink text-left">
              <th scope="col" className="py-1.5 font-semibold">Time</th>
              <th scope="col" className="py-1.5 font-semibold text-right">°C</th>
              <th scope="col" className="py-1.5 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {READINGS.map(r => {
              const out = isExcursion(r);
              return (
                <tr key={r.time} className={`border-b border-line ${out ? 'bg-excursion/10' : ''}`}>
                  <td className="py-1.5">{r.time}</td>
                  <td className={`py-1.5 text-right ${out ? 'text-excursion font-semibold' : ''}`}>{r.temp_c.toFixed(1)}</td>
                  <td className={`py-1.5 text-right ${out ? 'text-excursion font-semibold' : 'text-muted'}`}>{out ? 'EXCURSION' : 'in range'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {excursions.length > 0 && (
          <p className="type-small text-ink-2 mt-3">
            {excursions.length} excursion recorded and preserved as logged. Nothing in this record has been edited since anchoring.
          </p>
        )}
      </div>

      {/* Proof */}
      <div className="border-t-2 border-ink px-5 sm:px-8 py-5 grid sm:grid-cols-[1fr_auto] gap-5 items-end">
        <dl className="type-data space-y-2 min-w-0">
          <div>
            <dt className="text-muted">Merkle root (SHA-256)</dt>
            <dd className="font-semibold break-all">{root}</dd>
          </div>
          <div>
            <dt className="text-muted">Anchored on</dt>
            <dd className="font-semibold">Ethereum · Sepolia testnet</dd>
          </div>
          <div>
            <dt className="text-muted">Verify independently</dt>
            <dd>Re-hash the records and compare the root on any block explorer.</dd>
          </div>
        </dl>
        {/* Stamp */}
        <div className="justify-self-start sm:justify-self-end -rotate-6 border-[3px] border-verified text-verified px-4 py-2 text-center select-none" aria-label="Verified">
          <div className="font-mono text-lg font-bold tracking-[0.15em] leading-none">VERIFIED</div>
          <div className="font-mono text-[11px] tracking-[0.1em] mt-1">ROOT MATCH</div>
        </div>
      </div>
    </article>
  );
}
