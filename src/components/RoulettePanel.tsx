import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { HelpCircle, Star, Sparkles, Volume2 } from 'lucide-react';
import { UserStats } from '../types';

export const ROULETTE_PRIZES = [
  { value: 0.05, label: "0.05 KRT", color: "#091e3a", text: "#00e1ff" }, // Kritical Blue
  { value: 0.25, label: "0.25 KRT", color: "#0c1020", text: "#cbd5e1" }, // Slate-300
  { value: 0.10, label: "0.10 KRT", color: "#1a0b2e", text: "#d946ef" }, // Purple
  { value: 1.00, label: "1.00 KRT", color: "#0c1020", text: "#cbd5e1" }, // Slate-300
  { value: 0.50, label: "0.50 KRT", color: "#091e3a", text: "#00e1ff" }, // Kritical Blue
  { value: 2.50, label: "2.50 KRT", color: "#1a0b2e", text: "#d946ef" }, // Purple
  { value: 0.02, label: "0.02 KRT", color: "#0c1020", text: "#cbd5e1" }, // Slate-300
  { value: 5.00, label: "5.00 KRT", color: "#3f2b00", text: "#fbbf24" }, // Amber Gold Jackpot!
];

interface RoulettePanelProps {
  userStats: UserStats;
  targetPrizeIndex: number | null;
  onSpinRequest: () => void;
  onClaimPrize: (prizeValue: number) => void;
}

export default function RoulettePanel({
  userStats,
  targetPrizeIndex,
  onSpinRequest,
  onClaimPrize,
}: RoulettePanelProps) {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [recentWins, setRecentWins] = useState<Array<{ id: string; prize: string; time: string }>>([
    { id: '1', prize: '1.00 KRT', time: 'Hace 2 min' },
    { id: '2', prize: '0.10 KRT', time: 'Hace 5 min' },
    { id: '3', prize: '0.50 KRT', time: 'Hace 12 min' },
  ]);

  // Handle spin trigger when targetPrizeIndex becomes a number
  useEffect(() => {
    if (targetPrizeIndex !== null && !isSpinning) {
      setIsSpinning(true);

      // 8 slices, each is 45 degrees.
      // Index 0 is at 0-45 deg (middle is 22.5 deg).
      // We want the winning slice to align with the pointer at the top (which is 270 deg or -90 deg).
      // Pointer is at 90 deg counter-clockwise (top, or 270 deg on standard CSS coordinate where 0 deg is right).
      // Standard CSS rotation: 0 degrees is facing RIGHT.
      // Pointer is at TOP (270 degrees).
      // To make slice 'i' land on top, we need to rotate the wheel by:
      // Rotation = 270 - (i * 45 + 22.5)
      // To make it spin multiple times: add 360 * 5 (5 full spins)
      const sliceAngle = 45;
      const targetAngle = 270 - (targetPrizeIndex * sliceAngle + 22.5);
      const totalRotation = 360 * 5 + targetAngle;

      controls.start({
        rotate: totalRotation,
        transition: { duration: 4, ease: [0.25, 0.1, 0.25, 1] },
      }).then(() => {
        // Spin finished!
        const wonPrize = ROULETTE_PRIZES[targetPrizeIndex];
        
        // Add to local list of wins
        setRecentWins(prev => [
          {
            id: Math.random().toString(),
            prize: wonPrize.label,
            time: 'Justo ahora',
          },
          ...prev.slice(0, 4)
        ]);

        // Triggers App.tsx callback to claim balance
        setTimeout(() => {
          onClaimPrize(wonPrize.value);
          setIsSpinning(false);
        }, 1200);
      });
    }
  }, [targetPrizeIndex, controls]);

  // Generate SVG path for wedges
  const getWedgePath = (index: number) => {
    const startAngle = (index * 45) * Math.PI / 180;
    const endAngle = ((index + 1) * 45) * Math.PI / 180;
    const r = 95;
    const cx = 100;
    const cy = 100;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div id="roulette-panel-card" className="bg-cyber-dark border border-brand-cyan/25 rounded-sm p-6 shadow-2xl relative flex flex-col gap-6 h-full min-h-[500px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-cyan/15 pb-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
          RULETA DE FORTUNA KRITICAL
        </h2>
        <span className="text-xs text-brand-cyan font-mono font-bold bg-cyber-black border border-brand-cyan/30 px-2.5 py-1 rounded-sm flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-brand-cyan animate-spin" />
          Premios en KRT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Side: The Interactive Wheel (7 columns) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative py-6">
          
          {/* Outer Ring frame */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border-4 border-brand-cyan/40 bg-cyber-black p-2 flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.15)]">
            
            {/* Glowing neon shadow ring */}
            <div className="absolute inset-0 rounded-full border border-brand-cyan/20 blur-[2px] animate-pulse"></div>

            {/* Indicator / Pointer (At the top, facing down) */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-brand-cyan drop-shadow-[0_0_8px_#00d4ff]"></div>

            {/* Rotating Wheel body */}
            <motion.div
              animate={controls}
              style={{ originX: '50%', originY: '50%' }}
              className="w-full h-full rounded-full overflow-hidden select-none"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g>
                  {ROULETTE_PRIZES.map((prize, idx) => (
                    <g key={idx}>
                      {/* Wedge Path */}
                      <path
                        d={getWedgePath(idx)}
                        fill={prize.color}
                        stroke="#0a1020"
                        strokeWidth="1.5"
                      />
                      {/* Label Text aligned inside wedge */}
                      <g transform={`rotate(${idx * 45 + 22.5} 100 100)`}>
                        <text
                          x="142"
                          y="103"
                          fill={prize.text}
                          fontSize="7"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          transform={`rotate(180 142 103)`} // optional rotation
                        >
                          {prize.label.replace(" KRT", "")}
                        </text>
                      </g>
                    </g>
                  ))}
                  {/* Wheel Center Core cap */}
                  <circle cx="100" cy="100" r="18" fill="#020813" stroke="#00d4ff" strokeWidth="2" />
                  <circle cx="100" cy="100" r="6" fill="#00d4ff" />
                </g>
              </svg>
            </motion.div>
          </div>

          {/* Action Trigger */}
          <div className="mt-6 w-full max-w-xs text-center z-10">
            <button
              onClick={onSpinRequest}
              disabled={isSpinning || targetPrizeIndex !== null}
              className={`w-full py-3 px-6 font-mono font-black text-sm tracking-widest transition-all rounded-sm shadow-lg cursor-pointer ${
                isSpinning || targetPrizeIndex !== null
                  ? 'bg-cyber-black text-slate-600 border border-slate-800 cursor-not-allowed'
                  : 'bg-brand-cyan text-cyber-black hover:bg-[#00e1ff] border border-brand-cyan hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]'
              }`}
            >
              {isSpinning ? 'GIRANDO LA RUEDA...' : 'VER ANUNCIO Y GIRAR'}
            </button>
            <p className="text-[9px] text-slate-500 font-mono mt-2 tracking-wider uppercase">
              Cada tirada requiere ver una transmisión publicitaria
            </p>
          </div>
        </div>

        {/* Right Side: Log of prizes and description (5 columns) */}
        <div className="md:col-span-5 flex flex-col gap-4 h-full">
          {/* Info Card */}
          <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm">
            <h4 className="text-xs font-bold font-mono text-brand-cyan tracking-wide mb-1 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              SISTEMA DE TIRADAS RECOMPENSADAS
            </h4>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              La Ruleta de Kritical permite ganar fracciones de monedas de forma inmediata. Al completar una propaganda holográfica, obtienes un giro con un jackpot garantizado de hasta <strong className="text-amber-400">5.00 KRT</strong>.
            </p>
          </div>

          {/* List of Rewards */}
          <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex-1 flex flex-col justify-between">
            <div>
              <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase mb-2">POSIBLES PREMIOS EN EL DISCO</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {ROULETTE_PRIZES.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-cyber-dark px-2.5 py-1.5 rounded-sm border border-brand-cyan/5">
                    <span className="text-[10px] text-slate-500">Wedge #{idx+1}</span>
                    <span className="font-bold" style={{ color: p.text }}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wins list log */}
            <div className="mt-4 pt-4 border-t border-brand-cyan/15">
              <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase mb-2">TUS GIROS RECIENTES</p>
              <div className="flex flex-col gap-1.5">
                {recentWins.map((win) => (
                  <div key={win.id} className="flex justify-between items-center text-[10px] font-mono bg-cyber-dark/40 px-2 py-1 rounded-sm">
                    <span className="text-slate-400">Giro completado</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand-cyan font-bold">+{win.prize}</span>
                      <span className="text-[8px] text-slate-600">{win.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
