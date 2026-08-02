"use client";

import React, { useState, useEffect } from 'react';

const LOG_SEQUENCE = [
  "> INITIATING SECURE TLS TUNNEL TO ENGINE...",
  "> CALCULATING SHA-256 PAYLOAD DIGEST...",
  "> STRUCTURING MERKLE PROOF PARAMETERS...",
  "> AWAITING EVM SEPOLIA RPC CONSENSUS..."
];

export default function Home() {
  const [terminalState, setTerminalState] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [scrambleHash, setScrambleHash] = useState<string>("");

  // 1. Silent Pre-emptive Ping on Mount
  useEffect(() => {
    // Fire-and-forget health check to wake up Render in the background
    fetch('https://immutal.onrender.com/api/health/').catch(() => {
      // Silently handle if Render is sleeping; this request served its purpose as a wake-up call
    });
  }, []);

  // 2. Hash Decryption Matrix Effect Helper
  const generateRandomHash = () => 
    '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  // Scramble effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (terminalState === 'loading') {
      interval = setInterval(() => {
        setScrambleHash(generateRandomHash());
      }, 50);
    }
    return () => clearInterval(interval);
  }, [terminalState]);

  const handleInitialize = async () => {
    setTerminalState('loading');
    setLogs([]);

    // Staggered log sequence
    for (let i = 0; i < LOG_SEQUENCE.length; i++) {
      // Randomize delay between 1.5s to 3s per step to simulate real network/compute time
      const delay = Math.floor(Math.random() * 1500) + 1500; 
      await new Promise(resolve => setTimeout(resolve, delay)); 
      setLogs(prev => [...prev, LOG_SEQUENCE[i]]);
    }

    // Final short delay before snapping to the completed payload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTerminalState('complete');
  };

  return (
    <main className="flex min-h-screen flex-col font-sans selection:bg-white selection:text-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6 flex justify-between items-center">
        <h1 className="font-mono text-sm tracking-widest font-bold">IMMUTAL // ZERO-TRUST MIDDLEWARE</h1>
        <div className="font-mono text-xs text-zinc-500">SYS.STATUS: ONLINE</div>
      </header>

      {/* Hero */}
      <section className="flex flex-col lg:flex-row border-b border-zinc-800">
        <div className="p-8 lg:p-16 lg:w-1/2 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-800">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            ANCHOR ERP DATA.<br />PREVENT FRAUD.
          </h2>
          <p className="text-xl text-zinc-400 max-w-lg font-medium leading-relaxed">
            Supply Chain Compliance and Audit Readiness through immutable cryptographic anchoring on the EVM.
          </p>
          <div className="mt-12 flex space-x-4">
            <button 
              onClick={handleInitialize}
              disabled={terminalState === 'loading'}
              className="bg-white text-zinc-950 font-bold font-mono px-8 py-4 text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {terminalState === 'loading' ? '[ PROCESSING_TX... ]' : '[ INITIALIZE_CONNECTION ]'}
            </button>
            <button className="border border-zinc-800 text-white font-bold font-mono px-8 py-4 text-sm hover:bg-zinc-900 transition-colors">
              READ_DOCS
            </button>
          </div>
        </div>
        
        {/* Terminal Visual */}
        <div className="p-8 lg:p-16 lg:w-1/2 bg-zinc-900/30 flex items-center justify-center min-h-[500px]">
          <div className="w-full max-w-2xl border border-zinc-800 bg-[#0c0c0e] shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
            <div className="border-b border-zinc-800 px-4 py-2 flex items-center space-x-2">
              <div className="w-3 h-3 bg-zinc-700"></div>
              <div className="w-3 h-3 bg-zinc-700"></div>
              <div className="w-3 h-3 bg-zinc-700"></div>
              <span className="ml-4 font-mono text-xs text-zinc-500">immutal_bridge.exe</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto text-zinc-300 min-h-[350px]">
              {terminalState === 'idle' ? (
                <div className="text-zinc-500">
                  <pre><code>{`> AWAITING COMMAND...
> PRESS [ INITIALIZE_CONNECTION ] TO ANCHOR INVOICE.`}</code></pre>
                </div>
              ) : terminalState === 'loading' ? (
                <div>
                  <pre><code>{`{
  "event": "ERP_ANCHOR_INITIATED",
  "timestamp": "2026-08-02T10:39:28Z",
  "data_payload": {
    "document_type": "Purchase_Order",
    "po_id": "PO-KL-88924"
  }
}

-- PROCESSING KERNEL --`}</code></pre>
                  <div className="mt-4 text-zinc-400">
                    {logs.map((log, i) => (
                      <div key={i} className="animate-pulse">{log}</div>
                    ))}
                    {logs.length < LOG_SEQUENCE.length && (
                      <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse bg-zinc-500">_</span>
                    )}
                  </div>
                  {logs.length >= 2 && (
                    <div className="mt-6 text-xs text-zinc-700 break-all opacity-50 font-mono tracking-widest">
                      [HASH_BUFFER]: {scrambleHash}
                    </div>
                  )}
                </div>
              ) : (
                <pre><code>{`{
  "event": "ERP_ANCHOR_INITIATED",
  "timestamp": "2026-08-02T10:39:28Z",
  "data_payload": {
    "document_type": "Purchase_Order",
    "po_id": "PO-KL-88924",
    "vendor": "VND_LOGISTICS_MY",
    "amount": "145,000.00 MYR",
    "approval_tier": "Level_3_Director"
  },
  "immutal_proof": {
    "status": "`}<span className="text-[#10b981] font-bold">VERIFIED_SYSTEM_GREEN</span>{`",
    "algorithm": "SHA-256",
    "payload_hash": "`}<span className="text-white font-bold">0x8f4b9a3c72b12fa92c30987c692a7eb829a9972b21c43d83893c5eb298811a2b</span>{`",
    "network": "Ethereum Sepolia (Testnet)",
    "tx_receipt": "`}<a href="https://sepolia.etherscan.io/tx/0xf5e4e4ca7ff05df7e9a51082e2efa1b3252936406542c6df448e51f97974fb37" target="_blank" rel="noopener noreferrer" className="text-white font-bold underline decoration-zinc-600 hover:decoration-white hover:text-zinc-200 transition-colors cursor-pointer">0xf5e4e4ca7ff05df7e9a51082e2efa1b3252936406542c6df448e51f97974fb37</a>{`"
  }
}`}</code></pre>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800">
        <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="font-mono text-xs text-zinc-500 mb-4">01</div>
          <h3 className="text-2xl font-bold mb-4">Cryptographic Verification</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Mathematical proof of document existence. Every purchase order, invoice, and contract is anchored to the EVM, rendering retroactive tampering impossible.
          </p>
        </div>
        <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="font-mono text-xs text-zinc-500 mb-4">02</div>
          <h3 className="text-2xl font-bold mb-4">No PII Exposure</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Zero-knowledge design. Only SHA-256 hashes hit the public ledger. Sensitive supply chain vendor data remains completely isolated and compliant with regional data laws.
          </p>
        </div>
        <div className="p-8 lg:p-12">
          <div className="font-mono text-xs text-zinc-500 mb-4">03</div>
          <h3 className="text-2xl font-bold mb-4">Seamless Audit Trails</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Instantaneous reconciliation. Auditors verify the integrity of ERP records independently using public blockchain explorers without requesting internal database access.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 font-mono text-xs text-zinc-500 flex flex-col md:flex-row justify-between items-center">
        <div>© 2026 IMMUTAL SYSTEM. ALL RIGHTS RESERVED.</div>
        <div className="flex space-x-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">/DOCS</a>
          <a href="#" className="hover:text-white transition-colors">/SECURITY</a>
          <a href="#" className="hover:text-white transition-colors">/GITHUB</a>
        </div>
      </footer>
    </main>
  );
}
