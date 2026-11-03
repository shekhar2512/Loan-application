import React from 'react';
import Wizard from './components/wizard/Wizard';
import { Shield, Lock } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1F4E79] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#1F4E79] block leading-none">
                Lend<span className="text-[#27AE60]">Swift</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                RBI-Regulated NBFC
              </span>
            </div>
          </div>

          {/* Security & Support Badge */}
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-[#27AE60]" />
              <span>256-bit AES Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Shield className="w-4 h-4 text-[#1F4E79]" />
              <span className="hidden md:inline">RBI Guidelines Compliant</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Wizard Flow */}
      <main className="flex-1 py-4">
        <Wizard />
      </main>

      {/* Regulatory Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© 2026 LendSwift Financial Services. All rights reserved.</p>
          <p className="max-w-xl text-[11px] text-slate-400">
            LendSwift complies with RBI Digital Lending Guidelines. Data is encrypted and never shared without explicit consent. For grievances: grievance@lendswift.in | RBI CMS Portal.
          </p>
        </div>
      </footer>
    </div>
  );
}