import React from 'react';
import { X, HelpCircle, Award, ShieldAlert, Sparkles, Flame, Coins, Landmark } from 'lucide-react';
import { TOTAL_SUPPLY, MINER_ALLOCATION, BURN_ALLOCATION, DEV_ALLOCATION } from '../utils/cryptoSim';

interface TutorialModalProps {
  onClose: () => void;
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-cyber-dark border border-brand-cyan/30 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,212,255,0.2)] flex flex-col relative max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-brand-cyan/20 px-6 py-4 flex justify-between items-center bg-cyber-black">
          <h3 className="text-xs font-bold font-mono tracking-widest text-brand-cyan flex items-center gap-2 uppercase">
            <HelpCircle className="w-4.5 h-4.5 text-brand-cyan animate-pulse" />
            TOKENOMICS & PROTOCOLO DE CONSENSO KIRIKAL COIN (KRC)
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm border border-brand-cyan/20 hover:border-brand-cyan hover:text-brand-cyan transition-all text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-left">
          
          {/* General Intro */}
          <div>
            <h4 className="text-xs font-bold font-mono text-brand-cyan uppercase tracking-wider mb-2">Visión de Kirikal Coin (KRC)</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Kirikal Coin es un activo digital descentralizado diseñado sobre una arquitectura de escasez programática y minería equitativa. Con un suministro total inamovible de <strong>50,000,000 tokens</strong>, el protocolo fomenta la participación a largo plazo mediante recompensas de bloque dinámicas y un sistema integrado de quema y staking.
            </p>
          </div>

          {/* Allocation Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cyber-black border border-brand-cyan/10 rounded-sm">
              <div className="flex items-center gap-1.5 text-brand-cyan font-mono text-xs font-bold">
                <Coins className="w-4 h-4" />
                MINEROS (80%)
              </div>
              <p className="text-lg font-bold font-mono text-slate-200 mt-1">40M <span className="text-xs font-normal text-slate-400">KRK</span></p>
              <p className="text-[10px] text-slate-500 font-mono mt-2">Reservados para ser extraídos mediante minería activa durante un período proyectado de 3 años.</p>
            </div>

            <div className="p-4 bg-cyber-black border border-brand-cyan/10 rounded-sm">
              <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-bold animate-pulse">
                <Flame className="w-4 h-4" />
                BURN PORTAL (10%)
              </div>
              <p className="text-lg font-bold font-mono text-slate-200 mt-1">5M <span className="text-xs font-normal text-slate-400">KRK</span></p>
              <p className="text-[10px] text-slate-500 font-mono mt-2">Suministro deflacionario. Los usuarios queman KRK para acelerar su tasa de hashrate permanentemente.</p>
            </div>

            <div className="p-4 bg-cyber-black border border-brand-cyan/10 rounded-sm">
              <div className="flex items-center gap-1.5 text-blue-400 font-mono text-xs font-bold">
                <Landmark className="w-4 h-4" />
                DESARROLLO (10%)
              </div>
              <p className="text-lg font-bold font-mono text-slate-200 mt-1">5M <span className="text-xs font-normal text-slate-400">KRK</span></p>
              <p className="text-[10px] text-slate-500 font-mono mt-2">Fondo destinado a incentivar el mantenimiento técnico, infraestructura de servidores y equipo fundador.</p>
            </div>
          </div>

          {/* Core Rules List */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold font-mono text-brand-cyan uppercase tracking-wider">Protocolos del Simulador</h4>
            
            <div className="flex gap-3 items-start">
              <div className="p-1 rounded-sm bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">1</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono">Sesión de Minado de 24 Horas</h5>
                <p className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">
                  Para mantener el consenso equitativo, tu nodo de minería se suspende automáticamente después de 24 horas. Debes entrar diariamente y pulsar "ACTIVAR SESIÓN" para reiniciar el hashrate en la nube.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1 rounded-sm bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">2</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono">Mecanismo Tapping (Clicker)</h5>
                <p className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">
                  Pulsar el núcleo de Kirikal Coin genera micro-recompensas instantáneas y acumula un bono de hashrate temporal (+0.2 MH/s por tap) para acelerar el procesamiento de bloques.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1 rounded-sm bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">3</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono">Recompensas por Bloque Dinámicas</h5>
                <p className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">
                  El protocolo premia a los mineros tempranos. La recompensa base por bloque resuelto comienza en <strong>50 KRK</strong> y decrece proporcionalmente a medida que el circulante minado por la comunidad se acerca a los 40,000,000 KRK, incrementando la dificultad.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1 rounded-sm bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">4</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono">Fórmula de Staking Progresivo</h5>
                <p className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">
                  Bloquear tus KRK acumulados genera intereses pasivos con retornos progresivos (hasta 35% APY). Además, el staking incrementa tu multiplicador general de minería, uniendo ambos mundos financieros.
                </p>
              </div>
            </div>
          </div>

          {/* Ad Boost Warning */}
          <div className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-sm flex items-center gap-3">
            <div className="p-2 rounded-sm bg-brand-cyan/10 text-brand-cyan shrink-0">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-[10px] text-slate-300 font-mono leading-normal">
              <strong>Tip Profesional:</strong> Ver transmisiones publicitarias futuristas otorga un multiplicador inmediato de 2x a tu velocidad por 4 horas. ¡Úsalo junto con el bonus de referidos para escalar puestos rápidamente en el Ranking Pool!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-cyan/15 p-5 flex justify-end bg-cyber-black">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm bg-brand-cyan hover:bg-[#00e1ff] text-cyber-black font-bold font-mono text-xs transition-all cursor-pointer"
          >
            ENTENDIDO, CONTINUAR MINANDO
          </button>
        </div>
      </div>
    </div>
  );
}
