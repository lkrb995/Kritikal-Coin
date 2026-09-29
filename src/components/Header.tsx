import React from 'react';
import { Cpu, Flame, ShieldAlert, Award } from 'lucide-react';

interface HeaderProps {
  totalBalance: number;
  globalHashRate: number;
  blockHeight: number;
  isSessionActive: boolean;
  onShowTutorial: () => void;
}

export default function Header({
  totalBalance,
  globalHashRate,
  blockHeight,
  isSessionActive,
  onShowTutorial,
}: HeaderProps) {
  return (
    <header className="border-b border-brand-cyan/30 bg-cyber-dark px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-brand-cyan/30 blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <img
              src="/src/assets/images/kirikal_coin_logo_1783613706918.jpg"
              alt="Kritical Coin Logo"
              className="w-12 h-12 rounded-full border border-brand-cyan object-cover relative z-10 animate-[spin_60s_linear_infinite]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fail-safe fallback if logo fails to render
                e.currentTarget.src = "https://picsum.photos/seed/cybercoin/100/100";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white font-sans flex items-center gap-2">
              KRITICAL <span className="text-brand-cyan">CORE</span>
              <span className="text-[10px] px-2 py-0.5 rounded border border-brand-cyan/30 bg-cyber-black text-brand-cyan font-mono tracking-widest font-normal uppercase">SIMULATOR v2.0</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 tracking-wider">
              <span className={`inline-block w-2 h-2 rounded-full ${isSessionActive ? 'bg-brand-cyan animate-pulse' : 'bg-amber-400 animate-ping'}`} />
              {isSessionActive ? 'SESIÓN ACTIVA - SINCRONIZADO' : 'SISTEMA DETENIDO - ADVERTENCIA'}
            </p>
          </div>
        </div>

        {/* Global Blockchain Metrics */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="bg-cyber-black border border-brand-cyan/10 px-3 py-1.5 rounded-sm flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-brand-cyan animate-pulse" />
            <div>
              <p className="text-[9px] text-slate-500 font-mono leading-none tracking-widest uppercase">HASHRATE GLOBAL</p>
              <p className="text-xs font-semibold text-brand-cyan font-mono leading-none mt-1">
                {globalHashRate.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MH/s
              </p>
            </div>
          </div>

          <div className="bg-cyber-black border border-brand-cyan/10 px-3 py-1.5 rounded-sm flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-[9px] text-slate-500 font-mono leading-none tracking-widest uppercase">ALTURA BLOQUE</p>
              <p className="text-xs font-semibold text-slate-200 font-mono leading-none mt-1">
                #{blockHeight.toLocaleString()}
              </p>
            </div>
          </div>

          {/* User Balance Header Panel */}
          <div className="bg-cyber-gray border border-brand-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.15)] px-4 py-1.5 rounded-sm flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] text-brand-cyan font-mono leading-none tracking-widest">SALDO DISPONIBLE</p>
              <p id="total-balance-display" className="text-sm font-bold text-white font-mono mt-1">
                {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} <span className="text-[10px] text-brand-cyan">KRT</span>
              </p>
            </div>
          </div>

          <button
            onClick={onShowTutorial}
            className="p-1.5 px-3 rounded-sm border border-brand-cyan/20 bg-cyber-black text-slate-400 hover:text-brand-cyan hover:border-brand-cyan transition-all text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer"
            title="Mostrar Tokenomics"
          >
            TOKENOMICS
          </button>
        </div>
      </div>
    </header>
  );
}
