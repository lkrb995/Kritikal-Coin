import React, { useState } from 'react';
import { Share2, Users, Award, HelpCircle, CheckCircle, PlusCircle } from 'lucide-react';
import { Referral } from '../types';

interface ReferralPanelProps {
  referralCode: string;
  referrals: Referral[];
  onAddSimulatedReferral: () => void;
  referralBonus: number; // e.g. 0.15 for 15%
}

export default function ReferralPanel({
  referralCode,
  referrals,
  onAddSimulatedReferral,
  referralBonus,
}: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = referrals.filter((r) => r.status === 'active').length;

  // Progressive Milestone achievements definition
  const MILESTONES = [
    { qty: 1, bonus: '5%', desc: 'Iniciador' },
    { qty: 3, bonus: '15%', desc: 'Sindicato' },
    { qty: 5, bonus: '25%', desc: 'Corporación' },
    { qty: 10, bonus: '50%', desc: 'Magnate de Hash' },
    { qty: 20, bonus: '100%', desc: 'Satoshi Core' },
  ];

  return (
    <div id="referral-panel-card" className="bg-cyber-dark border border-brand-cyan/25 rounded-sm p-6 shadow-2xl relative flex flex-col gap-6 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-cyan/15 pb-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 font-mono flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-cyan" />
          SISTEMA DE REFERIDOS PROGRESIVO
        </h2>
        <span className="text-xs text-brand-cyan font-mono font-bold bg-cyber-black border border-brand-cyan/30 px-2.5 py-1 rounded-sm">
          Bonus: +{(referralBonus * 100).toFixed(0)}% Boost
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Code and Simulation action */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">COMPARTE TU ENLACE DE INVITADO</p>
          
          <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">Código de invitación:</span>
              <span className="text-xs text-brand-cyan font-mono font-bold">{referralCode}</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?ref=${referralCode}`}
                className="bg-cyber-dark border border-brand-cyan/15 text-[11px] text-slate-400 font-mono px-3 py-2 rounded-sm focus:outline-none flex-1 truncate"
              />
              <button
                onClick={handleCopy}
                className="bg-brand-cyan/10 border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/25 transition-all px-3 py-2 rounded-sm text-xs font-mono font-bold shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'COPIADO' : 'COPIAR'}
              </button>
            </div>
          </div>

          {/* Simulate Action */}
          <div className="bg-brand-cyan/5 border border-brand-cyan/15 p-4 rounded-sm">
            <p className="text-xs text-brand-cyan font-mono font-bold flex items-center gap-1">
              <PlusCircle className="w-4 h-4" />
              Simulador de Red de Mineros
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-1.5 leading-relaxed">
              Invita a nuevos mineros simulados. Cada minero que invites se une a la pool en tiempo real, aumentando tu hashrate y otorgándote recompensas de red.
            </p>
            <button
              onClick={onAddSimulatedReferral}
              className="mt-3 w-full bg-brand-cyan text-cyber-black hover:bg-[#00e1ff] text-xs font-mono font-bold py-2 rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              SIMULAR INVITACIÓN (+1 AMIGO)
            </button>
          </div>
        </div>

        {/* Right column: Progressive milestones map */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">SENDEROS DE BONIFICACIÓN DE HASH</p>
          
          <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col gap-3.5">
            {MILESTONES.map((ms, idx) => {
              const isAchieved = referrals.length >= ms.qty;
              return (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isAchieved ? (
                      <CheckCircle className="w-4.5 h-4.5 text-brand-cyan shrink-0" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-800 shrink-0 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-slate-600">{ms.qty}</span>
                      </div>
                    )}
                    <div>
                      <p className={`text-xs font-mono font-bold ${isAchieved ? 'text-brand-cyan' : 'text-slate-500'}`}>
                        {ms.qty} {ms.qty === 1 ? 'Invitado' : 'Invitados'}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">{ms.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-sm border ${
                    isAchieved 
                      ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan' 
                      : 'border-slate-800 bg-cyber-dark text-slate-600'
                  }`}>
                    +{ms.bonus} BOOST
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Referrals list */}
      <div className="mt-2 border-t border-brand-cyan/15 pt-4 flex-1">
        <p className="text-[10px] text-slate-400 font-mono mb-2 tracking-wider uppercase">LISTADO DE TU EQUIPO DE MINERÍA ({referrals.length})</p>
        
        {referrals.length === 0 ? (
          <p className="text-[11px] text-slate-500 font-mono py-4 text-center">No has invitado amigos todavía. Usa el botón superior para simularlos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto pr-1">
            {referrals.map((ref) => (
              <div key={ref.id} className="bg-cyber-black border border-brand-cyan/10 p-3 rounded-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-300 truncate">{ref.username}</span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm ${
                    ref.status === 'active' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 animate-pulse' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {ref.status === 'active' ? 'ACTIVO' : 'DORMIDO'}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Aportado:</span>
                  <span className="text-brand-cyan">+{ref.contribution.toFixed(2)} KRK</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
