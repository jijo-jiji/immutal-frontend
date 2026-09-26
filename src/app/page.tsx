import {
  Blocks, EyeOff, FilePen, FileCheck2, Fingerprint, Link2, Lock, MapPin, MonitorCheck, Radio, ShieldCheck,
  Syringe, Thermometer, Trash2, Truck, Wallet, WifiOff, type LucideIcon,
} from 'lucide-react';
import { REFERENCE_TX } from '@/lib/coldchain';
import ExcursionChart from './components/ExcursionChart';
import IntegrityCertificate from './components/IntegrityCertificate';
import MerkleTree from './components/MerkleTree';

const EMAIL = 'azizi.sahari@unipact.com.my';
const PILOT_MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Immutal pilot request')}`;
const PARTNER_MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Immutal white-label partnership')}`;
const REFERENCE_TX_URL = `https://sepolia.etherscan.io/tx/${REFERENCE_TX}`;

const NAV = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#certificate', label: 'Certificate' },
  { href: '#compliance', label: 'Compliance' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#status', label: 'Status' },
];

const FAILURES = [
  { icon: Thermometer, code: 'EXCURSION_ERASED', title: 'Excursions erased', text: 'A 40-minute spike above 8 °C is overwritten with in-range values before the client audit.' },
  { icon: WifiOff, code: 'GAP_BACKFILLED', title: 'Gaps backfilled', text: 'A sensor drops offline mid-route. The missing hours are filled in with plausible readings afterwards.' },
  { icon: FilePen, code: 'HANDLING_REWRITTEN', title: 'Handling records rewritten', text: 'Halal segregation or cleaning records are edited after a cross-contamination incident.' },
  { icon: Trash2, code: 'TRAIL_DELETED', title: 'Audit trail deleted', text: 'Anyone with database admin rights can alter the log itself. Nothing outside the system notices.' },
];

const STEPS = [
  { icon: Radio, n: '01', title: 'Capture', text: 'Temperature readings and handling logs flow in from your sensors, WMS or spreadsheets through a background API.', data: 'sensor / wms → immutal' },
  { icon: Fingerprint, n: '02', title: 'Hash', text: 'Each record gets a SHA-256 fingerprint on your own server. The raw data never leaves it.', data: 'sha256(record) → 0x9c1f…' },
  { icon: Blocks, n: '03', title: 'Batch and anchor', text: 'A day of fingerprints folds into one Merkle root. One transaction anchors the whole batch to a public ledger.', data: '8,640 records → 1 tx' },
  { icon: ShieldCheck, n: '04', title: 'Verify', text: 'Anyone re-hashes a record and checks it against the chain. One altered digit and the proof fails.', data: 'root == anchored ?' },
];

const COMPLIANCE = [
  { icon: Syringe, tag: 'GDP / GDPMD', title: 'Pharma and medical-device cold chain', text: 'Distributors must keep continuous, unaltered temperature records for every shipment. Immutal makes those records provably original.' },
  { icon: Truck, tag: 'MS 2400 · Halal', title: 'Halal transport and warehousing', text: 'Segregation, cleaning and handling logs stay tamper-evident from warehouse to port, ready for certification audits.' },
  { icon: Lock, tag: 'PDPA 2010', title: 'Personal data protection', text: 'Only one-way hashes are published. Customer data, routes and trade secrets stay on your servers.' },
];

const COMPARISON = [
  { before: 'Anyone with admin rights can edit a record without a trace.', after: 'Any edit, even one digit, breaks the cryptographic proof.' },
  { before: 'Evidence lives inside the system being audited.', after: 'Fingerprints are anchored on a public ledger nobody controls.' },
  { before: 'Auditors have to trust your IT team.', after: 'Auditors verify records on-chain themselves.' },
  { before: 'Proving integrity means opening your database.', after: 'Proving integrity reveals nothing but a hash.' },
];

const NO_ASKS = [
  { icon: EyeOff, title: 'No data on-chain', text: 'Only a 32-byte fingerprint is published. It cannot be reversed into the record.' },
  { icon: Wallet, title: 'No crypto for your team', text: 'No wallets, tokens or gas fees. Immutal handles every on-chain write.' },
  { icon: MonitorCheck, title: 'No new software for staff', text: 'A background API beside your WMS or ERP. Warehouse workflows stay the same.' },
];

const STATS = [
  { value: '32', unit: 'bytes', text: 'published on-chain per batch. The records never leave your servers.' },
  { value: '1', unit: 'transaction', text: 'per daily batch by design, however many readings it holds.' },
  { value: '0', unit: 'personal data fields', text: 'ever written to the blockchain.' },
  { value: '1', unit: 'edited digit', text: 'is enough to break the proof. Try it above.' },
];

const CERTIFICATE_POINTS = [
  { icon: Thermometer, title: 'Every reading, excursions included', text: 'The record shows what happened, not what someone wished had happened.' },
  { icon: Fingerprint, title: 'A Merkle root and on-chain reference', text: 'The cryptographic link between this document and the public ledger.' },
  { icon: FileCheck2, title: 'Verifiable without Immutal', text: 'Auditors re-hash the records themselves. No login, no database access.' },
];

// Lucide defaults to round caps; square caps match the hard-edged style
const ICON = { strokeWidth: 1.75, strokeLinecap: 'square', strokeLinejoin: 'miter', 'aria-hidden': true } as const;

function Icon({ icon: Glyph, className = 'size-5' }: { icon: LucideIcon; className?: string }) {
  return <Glyph className={className} {...ICON} />;
}

const AVAILABLE_NOW = ['REST API', 'Google Sheets sync', 'Excel / CSV import'];

const ROADMAP = [
  { phase: 'Phase 1', items: 'Temperature logger gateways (HTTP / MQTT), Odoo Inventory' },
  { phase: 'Phase 2', items: 'SAP Business One, Microsoft Dynamics 365 Business Central, AutoCount, SQL Account' },
  { phase: 'Phase 3', items: 'SAP S/4HANA and EWM, enterprise WMS through partners' },
];

const STATUS = [
  { state: 'LIVE', title: 'Sepolia testnet', text: 'Anchoring runs on Ethereum Sepolia today.', done: true },
  { state: 'BUILT', title: 'Batch smart contract', text: 'Merkle batch anchoring with OpenZeppelin role-based access.', done: true },
  { state: 'IN DEVELOPMENT', title: 'API batching', text: 'Merkle batching inside the middleware API.', done: false },
  { state: 'OPEN', title: 'Pilot programme', text: 'Accepting the first Malaysian pilot partners.', done: true },
];

function Eyebrow({ n, children, onDark = false }: { n?: string; children: React.ReactNode; onDark?: boolean }) {
  return (
    <div className={`type-eyebrow mb-4 ${onDark ? 'text-accent-on-dark' : 'text-accent'}`}>
      {n && <>{n} · </>}{children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-paper border-b border-line">
        <div className="container-page h-16 flex items-center justify-between gap-6">
          <a href="#top" className="font-mono text-sm font-bold tracking-[0.12em]">IMMUTAL</a>
          <nav className="hidden lg:flex gap-8 type-small text-ink-2" aria-label="Sections">
            {NAV.map(item => (
              <a key={item.href} href={item.href} className="hover:text-ink transition-colors">{item.label}</a>
            ))}
          </nav>
          <a href={PILOT_MAILTO} className="btn btn-primary min-h-10 px-4 text-sm">Request a pilot</a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="section-pad border-b border-line">
        <div className="container-page grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow>Cold chain and Halal logistics compliance</Eyebrow>
            <h1 className="type-display">Prove the cold chain never broke.</h1>
            <p className="type-lead text-ink-2 mt-6 max-w-[34rem]">
              Tamper-proof temperature and handling records for pharma and Halal logistics.
              Immutal anchors a fingerprint of every log to a public blockchain, so no one,
              not even a database admin, can quietly rewrite it.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={PILOT_MAILTO} className="btn btn-primary">Request a pilot</a>
              <a href="#how-it-works" className="btn btn-secondary">See how it works</a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 type-small text-ink-2">
              <li className="flex items-center gap-2"><Icon icon={Lock} className="size-4 text-accent" />Zero personal data on-chain</li>
              <li className="flex items-center gap-2"><Icon icon={Link2} className="size-4 text-accent" />Verifiable on Ethereum</li>
              <li className="flex items-center gap-2"><Icon icon={MapPin} className="size-4 text-accent" />Built for Malaysia</li>
            </ul>
          </div>
          <div id="demo" className="min-w-0 scroll-mt-24">
            <ExcursionChart />
          </div>
        </div>
      </section>

      {/* Numbers band */}
      <section aria-label="Immutal in numbers" className="bg-surface border-b border-line">
        <div className="container-page">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {STATS.map(stat => (
              <div key={stat.unit} className="bg-surface py-8 lg:py-10 sm:px-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">{stat.value}</span>
                  <span className="type-eyebrow text-accent">{stat.unit}</span>
                </div>
                <p className="type-small text-ink-2 mt-3 max-w-[16rem]">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 01 Problem */}
      <section id="problem" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16">
          <div>
            <Eyebrow n="01">The problem</Eyebrow>
            <h2 className="type-h2">A temperature log is only as honest as whoever can edit it.</h2>
            <p className="type-lead text-ink-2 mt-5">
              When a shipment leaves its safe range, the pressure to fix the record is immediate.
              Today that record sits in a database someone on your team can change, and a regulator has no way to tell.
            </p>
          </div>
          <ol className="border-t border-line">
            {FAILURES.map(f => (
              <li key={f.code} className="grid grid-cols-[4px_1fr] gap-5 py-6 border-b border-line">
                <span className="bg-tampered" aria-hidden="true" />
                <div>
                  <h3 className="type-h3 flex items-center gap-2.5"><Icon icon={f.icon} className="size-5 text-tampered shrink-0" />{f.title}</h3>
                  <p className="type-body text-ink-2 mt-1.5">{f.text}</p>
                  <div className="type-data text-tampered mt-2">{f.code}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 02 How it works */}
      <section id="how-it-works" className="section-pad border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="02">How it works</Eyebrow>
            <h2 className="type-h2">Your logs stay private. Their fingerprints go public.</h2>
            <p className="type-lead text-ink-2 mt-5">Four steps, all running in the background of the systems you already use.</p>
          </div>
          <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Connecting line behind the step numbers */}
            <span className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-line-strong" aria-hidden="true" />
            {STEPS.map(s => (
              <li key={s.n} className="relative">
                <div className="size-12 flex items-center justify-center bg-accent text-white"><Icon icon={s.icon} className="size-6" /></div>
                <div className="type-data text-accent font-semibold mt-5">{s.n}</div>
                <h3 className="type-h3 mt-1">{s.title}</h3>
                <p className="type-body text-ink-2 mt-2">{s.text}</p>
                <code className="type-data inline-block mt-4 px-2.5 py-1 bg-surface border border-line text-ink">{s.data}</code>
              </li>
            ))}
          </ol>
          <div className="mt-16 grid lg:grid-cols-[1fr_2.4fr] gap-8 lg:gap-12 items-start">
            <div className="bg-accent-soft border-l-4 border-accent p-6">
              <h3 className="type-h3">Why batch?</h3>
              <p className="type-body text-ink-2 mt-2">
                One transaction per sensor reading is slow and expensive. A Merkle tree folds a full day of
                readings into one root, so one transaction anchors them all.
              </p>
              <p className="type-body text-ink-2 mt-3">
                Each reading can still be proven on its own: its path to the root is all an auditor needs.
              </p>
            </div>
            <div className="min-w-0">
              <MerkleTree />
            </div>
          </div>
        </div>
      </section>

      {/* 03 What you get: certificate */}
      <section id="certificate" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow n="03">What you get</Eyebrow>
            <h2 className="type-h2">An audit-ready certificate for every shipment.</h2>
            <p className="type-lead text-ink-2 mt-5">
              Hand your client or auditor one document that proves the temperature record is exactly what the
              sensors logged.
            </p>
            <ul className="mt-8 space-y-6">
              {CERTIFICATE_POINTS.map(point => (
                <li key={point.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="size-10 flex items-center justify-center border border-ink"><Icon icon={point.icon} /></span>
                  <div>
                    <h3 className="font-semibold">{point.title}</h3>
                    <p className="type-body text-ink-2 mt-0.5">{point.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="type-small text-muted mt-8">Design preview. The report format is finalised with each pilot.</p>
          </div>
          <div className="min-w-0 lg:pl-4">
            <IntegrityCertificate />
          </div>
        </div>
      </section>

      {/* 03 Compliance: dark band */}
      <section id="compliance" className="section-pad bg-band text-white scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="04" onDark>Built for Malaysia</Eyebrow>
            <h2 className="type-h2">Evidence for the audits Malaysian logistics actually faces.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-px bg-band-line border border-band-line">
            {COMPLIANCE.map(c => (
              <div key={c.tag} className="bg-band p-6 lg:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="type-eyebrow inline-block border border-band-2/40 text-white px-2 py-1">{c.tag}</div>
                  <Icon icon={c.icon} className="size-6 text-accent-on-dark" />
                </div>
                <h3 className="type-h3 mt-6">{c.title}</h3>
                <p className="type-body text-band-2 mt-2">{c.text}</p>
              </div>
            ))}
          </div>
          <p className="type-small text-band-2 mt-6">Immutal strengthens your compliance evidence. It does not replace certification.</p>
        </div>
      </section>

      {/* 04 Trust: comparison */}
      <section id="trust" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="05">Why it holds up</Eyebrow>
            <h2 className="type-h2">Proof that doesn&apos;t depend on trusting anyone.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="border border-line p-6 lg:p-8">
              <h3 className="type-h3 text-ink-2">Database log today</h3>
              <ul className="mt-6 space-y-4">
                {COMPARISON.map(row => (
                  <li key={row.before} className="flex gap-3 type-body text-ink-2">
                    <span className="text-tampered font-bold shrink-0" aria-hidden="true">✕</span>{row.before}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-accent p-6 lg:p-8">
              <h3 className="type-h3">Immutal-anchored log</h3>
              <ul className="mt-6 space-y-4">
                {COMPARISON.map(row => (
                  <li key={row.after} className="flex gap-3 type-body">
                    <span className="text-verified font-bold shrink-0" aria-hidden="true">✓</span>{row.after}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className="type-h3 mt-16">What Immutal doesn&apos;t ask of you</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-8">
            {NO_ASKS.map(item => (
              <div key={item.title} className="border-t-2 border-ink pt-4">
                <div className="font-semibold flex items-center gap-2"><Icon icon={item.icon} className="size-5 text-accent" />{item.title}</div>
                <p className="type-body text-ink-2 mt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Integrations */}
      <section id="integrations" className="section-pad border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="06">Integrations</Eyebrow>
            <h2 className="type-h2">Plugs into what your warehouse already runs.</h2>
          </div>
          <div className="mt-12 grid lg:grid-cols-[5fr_7fr] gap-6">
            <div className="bg-surface border-2 border-ink p-6 lg:p-8">
              <div className="type-eyebrow text-verified flex items-center gap-2">
                <span className="size-2 bg-current" aria-hidden="true" />Available now
              </div>
              <ul className="mt-6 space-y-3">
                {AVAILABLE_NOW.map(item => (
                  <li key={item} className="type-h3">{item}</li>
                ))}
              </ul>
            </div>
            <div className="border border-line">
              <div className="type-eyebrow text-muted px-6 pt-6">Roadmap, ordered by pilot demand</div>
              <ul className="mt-2">
                {ROADMAP.map(r => (
                  <li key={r.phase} className="grid sm:grid-cols-[7rem_1fr] gap-1 sm:gap-4 px-6 py-4 border-b border-line last:border-b-0">
                    <span className="type-small font-semibold">{r.phase}</span>
                    <span className="type-small text-ink-2">{r.items}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 border border-line bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="type-h3">Build WMS or ERP software?</h3>
              <p className="type-body text-ink-2 mt-1">White-label Immutal&apos;s compliance layer inside your own product.</p>
            </div>
            <a href={PARTNER_MAILTO} className="btn btn-secondary">Partner with us</a>
          </div>
        </div>
      </section>

      {/* 06 Status: timeline */}
      <section id="status" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="07">Project status</Eyebrow>
            <h2 className="type-h2">Where Immutal is today.</h2>
          </div>
          <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <span className="hidden lg:block absolute top-[5px] left-0 right-0 h-px bg-line-strong" aria-hidden="true" />
            {STATUS.map(s => (
              <li key={s.title} className="relative">
                <span
                  className={`block size-3 ${s.done ? 'bg-verified' : 'bg-surface border-2 border-line-strong'}`}
                  aria-hidden="true"
                />
                <div className={`type-data mt-5 font-semibold ${s.done ? 'text-verified' : 'text-muted'}`}>{s.state}</div>
                <h3 className="type-h3 mt-1">{s.title}</h3>
                <p className="type-body text-ink-2 mt-1.5">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="type-small text-ink-2 mt-12">
            Check a real Immutal anchor yourself:{' '}
            <a href={REFERENCE_TX_URL} target="_blank" rel="noopener noreferrer" className="type-data text-accent underline underline-offset-4 break-all hover:text-accent-hover">
              {REFERENCE_TX.slice(0, 18)}…{REFERENCE_TX.slice(-8)} ↗
            </a>
          </p>
        </div>
      </section>

      {/* 07 Call to action */}
      <section id="contact" className="section-pad bg-accent text-white scroll-mt-16">
        <div className="container-page">
          <div className="type-eyebrow text-white/80 mb-4">08 · Run a pilot</div>
          <h2 className="type-display max-w-3xl">Run a pilot on one cold‑chain lane.</h2>
          <p className="type-lead text-white/85 mt-6 max-w-2xl">
            We&apos;re looking for Malaysian 3PLs, pharma distributors and Halal exporters to pilot Immutal on
            real shipments. Tell us what you move, and where your temperature and handling logs live today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a href={PILOT_MAILTO} className="btn bg-white text-accent hover:bg-accent-soft">Request a pilot</a>
            <a href={PARTNER_MAILTO} className="btn border border-white/60 text-white hover:border-white">Partner with us</a>
          </div>
          <a href={`mailto:${EMAIL}`} className="mt-8 inline-block type-data text-white underline underline-offset-4 break-all">
            {EMAIL}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper">
        <div className="container-page py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="font-mono text-sm font-bold tracking-[0.12em]">IMMUTAL</div>
            <p className="type-small text-muted mt-1">Zero-PII integrity for cold-chain and Halal logistics. © 2026</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 type-small text-ink-2" aria-label="Footer">
            {NAV.map(item => (
              <a key={item.href} href={item.href} className="hover:text-ink transition-colors">{item.label}</a>
            ))}
            <a href={`mailto:${EMAIL}`} className="hover:text-ink transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
