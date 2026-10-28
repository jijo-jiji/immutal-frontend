import {
  Ban, Blocks, Clock, EyeOff, FilePen, FileCheck2, Fingerprint, Link2, Lock, MapPin, MonitorCheck, Radio,
  ShieldCheck, Syringe, Thermometer, Trash2, Truck, Wallet, WifiOff, type LucideIcon,
} from 'lucide-react';
import { REFERENCE_TX } from '@/lib/coldchain';
import ExcursionChart from './components/ExcursionChart';
import IntegrityCertificate from './components/IntegrityCertificate';
import MerkleTree from './components/MerkleTree';
import SysStatus from './components/SysStatus';

const EMAIL = 'azizi.sahari@unipact.com.my';
const PILOT_MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Immutal pilot request')}`;
const PARTNER_MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Immutal white-label partnership')}`;
const REFERENCE_TX_URL = `https://sepolia.etherscan.io/tx/${REFERENCE_TX}`;

const NAV = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#certificate', label: 'Certificate' },
  { href: '#limits', label: 'Limits' },
  { href: '#compliance', label: 'Compliance' },
  { href: '#status', label: 'Status' },
];

// Scenarios the system is tested against (threat model T1 to T3). They are risks, not statistics.
const FAILURES = [
  { icon: Thermometer, code: 'EXCURSION_OVERWRITTEN', title: 'Excursions overwritten', text: 'A reading above range could be replaced with an in-range value after the fact, in a system the auditor cannot inspect independently.' },
  { icon: WifiOff, code: 'GAP_BACKFILLED', title: 'Gaps backfilled', text: 'Hours missing after a sensor drops offline could be filled in later with plausible readings.' },
  { icon: FilePen, code: 'HANDLING_REWRITTEN', title: 'Handling records rewritten', text: 'Receipt, dispatch or cleaning entries could be edited after an incident.' },
  { icon: Trash2, code: 'TRAIL_ADMIN_CONTROLLED', title: 'Audit trails held by the editor', text: 'An audit trail controlled by the administrator who can edit the data proves little to an outsider.' },
];

const STEPS = [
  { icon: Radio, n: '01', title: 'Capture', text: 'Readings and handling events arrive through an authenticated REST API. Each is checked and written in one canonical form (RFC 8785), so a reading always has the same bytes.', data: 'POST /records → canonical JSON' },
  { icon: Fingerprint, n: '02', title: 'Salt and hash', text: 'Every record gets a random 128-bit salt and a SHA-256 leaf hash on the operator’s server. The salt keeps a proof for one record from revealing its neighbours.', data: 'sha256(0x00 ‖ salt ‖ entry)' },
  { icon: Blocks, n: '03', title: 'Batch and anchor', text: 'A period’s leaves fold into an RFC 9162 Merkle tree. One transaction writes a 32-byte commitment to the root, the record count and a batch salt.', data: 'N records → 1 commitment' },
  { icon: ShieldCheck, n: '04', title: 'Verify', text: 'An auditor opens a static verifier page, supplies a bundle and a pinned dossier, and checks the commitment on-chain through an RPC provider of their choice.', data: 'bundle + dossier + own RPC' },
];

const COMPLIANCE = [
  { icon: Syringe, tag: 'NPRA · GDP', title: 'Pharmaceutical distribution (pilot focus)', text: 'Distributors keep temperature and handling records under NPRA’s Good Distribution Practice guideline. Immutal gives inspectors and clients a way to check those records have not changed since anchoring.' },
  { icon: Lock, tag: 'PDPA 2010', title: 'Data-minimising by design', text: 'Only fixed-size digests go on a public chain. Records and salts stay on the operator’s servers, and a bundle shows only the record it proves, including any handler ID inside it.' },
  { icon: Truck, tag: 'Halal · extension', title: 'Halal handling logs', text: 'Segregation and cleaning logs use the same mechanism. They sit outside the current evaluation and follow the pharmaceutical pilot.' },
];

const COMPARISON = [
  { before: 'Whoever administers the database can edit a record, and an audit trail they control proves little to an outsider.', after: 'After the anchor is final, any edit to a record fails verification.' },
  { before: 'Evidence lives inside the system being audited.', after: 'A fixed-size commitment lives on a public ledger the operator cannot rewrite.' },
  { before: 'Auditors have to trust the operator’s IT team.', after: 'Auditors run a static verifier against an RPC provider they choose.' },
  { before: 'Proving integrity can mean opening the whole database.', after: 'A bundle proves one record and reveals nothing practical about the others.' },
];

const NO_ASKS = [
  { icon: EyeOff, title: 'No readable data on-chain', text: 'One 32-byte commitment per period. A random batch salt hides record volumes, empty periods included.' },
  { icon: Wallet, title: 'No wallets for your staff', text: 'The service holds a hot anchoring key and a cold admin key. Staff never handle tokens or gas.' },
  { icon: MonitorCheck, title: 'No new software for staff', text: 'A background API beside the WMS, ERP or spreadsheets you already run.' },
];

// FYP1 reference run, 26 October 2026, local chain. Method and pass criteria are in the
// Threat Model and Evaluation Matrix.
const STATS = [
  { value: '5,000', unit: 'of 5,000 edits caught', text: 'Five tampering classes, 1,000 mutations each. No misses, so the miss rate is under 0.3% at 95% confidence.' },
  { value: '79,432', unit: 'verdicts, 0 mismatches', text: 'Python, a browser verifier and the transparency-dev reference library agree on every proof verdict.' },
  { value: '≈71k', unit: 'gas per daily anchor', text: 'A fixed-size commitment per period, however many records it covers. Local chain; Sepolia figures follow.' },
  { value: '0 of 10,000', unit: 'size forgeries accepted', text: 'A bare RFC 9162 proof check accepted 8,121 of them. Binding the size into the commitment rejects every one.' },
];

const CERTIFICATE_POINTS = [
  { icon: Thermometer, title: 'Every reading, excursions included', text: 'The record shows what was logged, not what anyone wished had been logged.' },
  { icon: Fingerprint, title: 'A commitment the chain can confirm', text: 'The auditor rebuilds the commitment from the bundle and finds it on-chain at the finalised block.' },
  { icon: FileCheck2, title: 'Verifiable without Immutal', text: 'A static page and an RPC provider of the auditor’s choice. No login, no database access, no wallet.' },
];

// Threat model classes (T1 to T18), grouped by what the design does about them.
const DETECTED = [
  'Edited, deleted, inserted, duplicated or reordered records (T1 to T3)',
  'Forged inclusion proofs (T4)',
  'Roots shown from another contract, chain or key (T7)',
  'A lying RPC provider or altered verifier, through a second provider and a published verifier hash (T8)',
];
const BOUNDED = [
  'Edits made before a period is anchored stay hidden until that anchor. The window is one period plus anchoring and finality time (T9).',
  'A wound-back server clock: the anchor’s block time caps every receipt claim (T10).',
  'Anchors lost to reorgs, fee spikes or outages: finality checks, capped retries, resends and alerts (T15).',
];
const UNDETECTED = [
  'Fabricated data at capture, or two sets of books (T11)',
  'Collusion between operator and auditor (T18)',
  'Sensor accuracy and calibration',
  'Availability of off-chain records. An operator who refuses to produce one creates evidence of its own.',
];

const AVAILABLE_NOW = ['REST ingestion API with API keys', 'Evidence bundle export per record', 'Batch and alert status API'];

const ROADMAP = [
  { phase: 'FYP2', items: 'Google Sheets sync and CSV / Excel import, tested against round-trip conversions' },
  { phase: 'After the pilot', items: 'Temperature logger gateways (HTTP / MQTT), Odoo Inventory' },
  { phase: 'Out of FYP scope', items: 'Commercial ERP connectors such as SAP Business One, Dynamics 365 Business Central, AutoCount and SQL Account' },
];

const STATUS = [
  { state: 'BUILT', title: 'Anchoring contract', text: 'Append-only, role-split, no upgrade path. 24 Foundry tests, 100% line and branch coverage on a local chain.', done: true },
  { state: 'BUILT', title: 'Service and verifier', text: 'Canonical entries, salted leaves, RFC 9162 batching, anchoring with retries and alerts, and a static browser verifier.', done: true },
  { state: 'NEXT · FYP2', title: 'Sepolia soak test', text: 'Scripted deployment of the new contract, then a 30-day hourly run with injected faults.', done: false },
  { state: 'OPEN', title: 'Pilot', text: 'Seeking one Malaysian pharma distributor or 3PL. Synthetic and public data are the fallback.', done: true },
];

// Lucide defaults to round caps; square caps match the hard-edged style
const ICON = { strokeWidth: 1.75, strokeLinecap: 'square', strokeLinejoin: 'miter', 'aria-hidden': true } as const;

function Icon({ icon: Glyph, className = 'size-5' }: { icon: LucideIcon; className?: string }) {
  return <Glyph className={className} {...ICON} />;
}

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
          <div className="flex items-center gap-5">
            <SysStatus />
            <a href={PILOT_MAILTO} className="hidden md:inline-flex btn btn-primary min-h-10 px-4 text-sm">Request a pilot</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="section-pad border-b border-line">
        <div className="container-page grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow>Cold-chain log integrity · NPRA GDP</Eyebrow>
            <h1 className="type-display">Prove the log wasn&apos;t edited after the fact.</h1>
            <p className="type-lead text-ink-2 mt-6 max-w-[34rem]">
              Immutal seals each day of temperature and handling records into one fixed-size commitment on
              Ethereum. Once that anchor is final, an auditor can detect any later change to those records with a
              static verifier and an RPC provider of their own choosing, without trusting the operator.
            </p>
            <p className="type-small text-muted mt-4 max-w-[34rem]">
              It shows records are unchanged since anchoring. It cannot show that a sensor read correctly, or
              that the data was honest when it was captured.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={PILOT_MAILTO} className="btn btn-primary">Request a pilot</a>
              <a href="#how-it-works" className="btn btn-secondary">See how it works</a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 type-small text-ink-2">
              <li className="flex items-center gap-2"><Icon icon={Lock} className="size-4 text-accent" />Salted hashes, digests only on-chain</li>
              <li className="flex items-center gap-2"><Icon icon={Link2} className="size-4 text-accent" />Verify with your own RPC provider</li>
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
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none">{stat.value}</span>
                  <span className="type-eyebrow text-accent">{stat.unit}</span>
                </div>
                <p className="type-small text-ink-2 mt-3 max-w-[16rem]">{stat.text}</p>
              </div>
            ))}
          </div>
          <p className="type-small text-muted py-4">
            FYP1 reference run, 26 October 2026, on a local chain. Pass criteria and method are fixed in the
            threat model and evaluation matrix. Sepolia and pilot results follow in FYP2.
          </p>
        </div>
      </section>

      {/* 01 Problem */}
      <section id="problem" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16">
          <div>
            <Eyebrow n="01">The problem</Eyebrow>
            <h2 className="type-h2">A temperature log is only as trustworthy as whoever can edit it.</h2>
            <p className="type-lead text-ink-2 mt-5">
              Distributors keep these records to show medicines stayed in range. Systems may keep an audit
              trail, but an outsider has to take the operator&apos;s word that it is complete.
            </p>
            <p className="type-small text-muted mt-5">
              The cards list scenarios Immutal is tested against, not statistics about any operator.
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
            <h2 className="type-h2">Records stay with the operator. Only a commitment goes public.</h2>
            <p className="type-lead text-ink-2 mt-5">Four steps, running in the background beside the systems you already use.</p>
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
                Anchoring each record on its own means one transaction per record. A Merkle tree folds a
                period&apos;s records into one root, so a single fixed-size commitment covers them all.
              </p>
              <p className="type-body text-ink-2 mt-3">
                Each record can still be proven alone: its short path to the root is all an auditor needs.
                The cost comparison with per-record anchoring is part of the FYP2 evaluation.
              </p>
            </div>
            <div className="min-w-0">
              <MerkleTree />
            </div>
          </div>
        </div>
      </section>

      {/* 03 What the auditor receives: certificate */}
      <section id="certificate" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow n="03">What the auditor receives</Eyebrow>
            <h2 className="type-h2">One bundle, checked against settings the operator can&apos;t change.</h2>
            <p className="type-lead text-ink-2 mt-5">
              The bundle carries the record, its salt, its path to the root and the settings the operator
              claims. The auditor checks it against a dossier received separately, which pins the chain, the
              contract and the anchoring address.
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
            <p className="type-small text-muted mt-8">Design preview. The commitment and proof are real but not anchored. The report format is finalised with each pilot.</p>
          </div>
          <div className="min-w-0 lg:pl-4">
            <IntegrityCertificate />
          </div>
        </div>
      </section>

      {/* 04 Limits */}
      <section id="limits" className="section-pad border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="04">Limits</Eyebrow>
            <h2 className="type-h2">What Immutal detects, and what it cannot.</h2>
            <p className="type-lead text-ink-2 mt-5">
              The security claim is narrow: once a period&apos;s anchor is final, a later change to its records is
              detectable without trusting the operator. The threat model names eighteen attack classes (T1 to T18)
              and says which fall inside that claim.
            </p>
          </div>
          <div className="mt-12 grid lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, label: 'Detected once the anchor is final', tone: 'border-t-verified', text: 'text-verified', items: DETECTED },
              { icon: Clock, label: 'Bounded, not prevented', tone: 'border-t-excursion', text: 'text-excursion', items: BOUNDED },
              { icon: Ban, label: 'Not detected, by design', tone: 'border-t-tampered', text: 'text-tampered', items: UNDETECTED },
            ].map(col => (
              <div key={col.label} className={`bg-surface border border-line border-t-4 ${col.tone} p-6 lg:p-8`}>
                <h3 className={`type-eyebrow flex items-center gap-2 ${col.text}`}><Icon icon={col.icon} className="size-4" />{col.label}</h3>
                <ul className="mt-5 space-y-4">
                  {col.items.map(item => (
                    <li key={item} className="type-body text-ink-2">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 border border-line bg-surface p-6">
            <h3 className="type-h3">Prototype limits</h3>
            <ul className="mt-3 grid md:grid-cols-2 gap-x-8 gap-y-2 type-small text-ink-2 list-disc pl-5">
              <li>The hot anchoring key sits in an environment variable. Production needs an encrypted keystore, a hardware module or a cloud key service.</li>
              <li>Sepolia anchors carry no economic security, and the network itself faces replacement. Production use means mainnet or a layer 2.</li>
              <li>The demo server and plain HTTP suit a demonstration only. Production needs a WSGI server behind TLS with rotated API keys.</li>
              <li>The same contract cannot repair a period that a stolen key pre-empted. The service raises a critical alert and the admin revokes the key.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 05 Compliance: dark band */}
      <section id="compliance" className="section-pad bg-band text-white scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="05" onDark>Built for Malaysia</Eyebrow>
            <h2 className="type-h2">Evidence for the inspections Malaysian pharmaceutical distribution faces.</h2>
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
          <p className="type-small text-band-2 mt-6">
            NPRA inspects. Immutal does not certify and does not replace inspection or certification. It
            strengthens the records an inspection relies on.
          </p>
        </div>
      </section>

      {/* 06 Trust: comparison */}
      <section id="trust" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="06">Why it holds up</Eyebrow>
            <h2 className="type-h2">Proof that doesn&apos;t depend on trusting the operator.</h2>
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

      {/* 07 Integrations */}
      <section id="integrations" className="section-pad border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="07">Integrations</Eyebrow>
            <h2 className="type-h2">Sits beside the systems your warehouse already runs.</h2>
          </div>
          <div className="mt-12 grid lg:grid-cols-[5fr_7fr] gap-6">
            <div className="bg-surface border-2 border-ink p-6 lg:p-8">
              <div className="type-eyebrow text-verified flex items-center gap-2">
                <span className="size-2 bg-current" aria-hidden="true" />Built in the prototype
              </div>
              <ul className="mt-6 space-y-3">
                {AVAILABLE_NOW.map(item => (
                  <li key={item} className="type-h3">{item}</li>
                ))}
              </ul>
            </div>
            <div className="border border-line">
              <div className="type-eyebrow text-muted px-6 pt-6">Not built yet, ordered by pilot demand</div>
              <ul className="mt-2">
                {ROADMAP.map(r => (
                  <li key={r.phase} className="grid sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 px-6 py-4 border-b border-line last:border-b-0">
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
              <p className="type-body text-ink-2 mt-1">Talk to us about embedding Immutal&apos;s integrity layer in your own product.</p>
            </div>
            <a href={PARTNER_MAILTO} className="btn btn-secondary">Partner with us</a>
          </div>
        </div>
      </section>

      {/* 08 Status: timeline */}
      <section id="status" className="section-pad bg-surface border-b border-line scroll-mt-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <Eyebrow n="08">Project status</Eyebrow>
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
            Check an anchor from the v0 prototype on Sepolia, which wrote one hash per record:{' '}
            <a href={REFERENCE_TX_URL} target="_blank" rel="noopener noreferrer" className="type-data text-accent underline underline-offset-4 break-all hover:text-accent-hover">
              {REFERENCE_TX.slice(0, 18)}…{REFERENCE_TX.slice(-8)} ↗
            </a>
          </p>
        </div>
      </section>

      {/* 09 Call to action */}
      <section id="contact" className="section-pad bg-accent text-white scroll-mt-16">
        <div className="container-page">
          <div className="type-eyebrow text-white/80 mb-4">09 · Run a pilot</div>
          <h2 className="type-display max-w-3xl">Test it on one cold‑chain lane.</h2>
          <p className="type-lead text-white/85 mt-6 max-w-2xl">
            We&apos;re looking for a Malaysian pharmaceutical distributor or 3PL willing to share an anonymised export
            of temperature and handling logs under a data-sharing agreement. We seal it, try to tamper with it,
            and report detection per scenario and the false-alarm rate. Without a partner, we run the same tests
            on synthetic and public data.
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
            <p className="type-small text-muted mt-1">Tamper-evident integrity for cold-chain records. A final-year project. © 2026</p>
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
