import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, AlertTriangle, Zap, Percent, Clock, MousePointerClick } from 'lucide-react';
import { UserStats } from '../types';

interface MinerCoreProps {
  userStats: UserStats;
  onActivateSession: () => void;
  onTapCoin: (x: number, y: number) => { balanceBonus: number; hashBonus: number };
  activeTapBonus: number;
}

interface ClickTracker {
  id: number;
  x: number;
  y: number;
  val: string;
}

export default function MinerCore({
  userStats,
  onActivateSession,
  onTapCoin,
  activeTapBonus,
}: MinerCoreProps) {
  const [clickIndicators, setClickIndicators] = useState<ClickTracker[]>([]);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('03:00:00');
  const [timerProgress, setTimerProgress] = useState<number>(0);
  const coinContainerRef = useRef<HTMLDivElement>(null);

  // Floating text tracker counter
  const counterRef = useRef(0);

  // Time remaining update for 3-hour mining session
  useEffect(() => {
    const updateTimer = () => {
      if (!userStats.activeSession || !userStats.activeSession.isActive) {
        setTimeLeftStr('Falta Activar');
        setTimerProgress(0);
        return;
      }

      const now = Date.now();
      const end = userStats.activeSession.endTime;
      const total = 3 * 60 * 60 * 1000; // 3 hours
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeLeftStr('Expirada');
        setTimerProgress(100);
        return;
      }

      // Convert to hh:mm:ss
      const hours = Math.floor(remaining / (3600 * 1000));
      const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((remaining % (60 * 1000)) / 1000);

      const hStr = hours.toString().padStart(2, '0');
      const mStr = mins.toString().padStart(2, '0');
      const sStr = secs.toString().padStart(2, '0');

      setTimeLeftStr(`${hStr}:${mStr}:${sStr}`);
      setTimerProgress(Math.min(100, ((total - remaining) / total) * 100));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userStats.activeSession]);

  const handleCoinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!userStats.activeSession?.isActive) {
      // Prompt user to activate session first
      return;
    }

    // Capture click coordinates relative to target element or container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger parent callback
    const bonuses = onTapCoin(e.clientX, e.clientY);

    // Create a floating feedback indicator
    const newId = counterRef.current++;
    const valueText = `+${bonuses.balanceBonus.toFixed(3)} KRT`;
    
    setClickIndicators((prev) => [
      ...prev,
      { id: newId, x, y, val: valueText },
    ]);

    // Automatically clean up floating tracker after animation concludes
    setTimeout(() => {
      setClickIndicators((prev) => prev.filter((item) => item.id !== newId));
    }, 900);
  };

  const isMining = userStats.activeSession?.isActive;
  const currentTotalHashRate = (userStats.baseHashRate + activeTapBonus) * userStats.boostMultiplier;

  return (
    <div id="miner-core-card" className="bg-cyber-dark border border-brand-cyan/25 rounded-sm p-6 shadow-2xl relative flex flex-col items-center justify-between gap-6 min-h-[500px]">
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full"></div>

      {/* Top Session Bar */}
      <div className="w-full flex items-center justify-between border-b border-brand-cyan/15 pb-3">
        <div>
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">ESTADO DEL RIG</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-block w-2 h-2 rounded-full ${isMining ? 'bg-brand-cyan animate-pulse' : 'bg-red-500 animate-ping'}`} />
            <span className="text-xs font-bold font-mono text-slate-200">
              {isMining ? 'MINANDO EN LA NUBE' : 'RIG DETENIDO'}
            </span>
          </div>
        </div>

        {/* 3h Session Countdown */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 justify-end tracking-wider">
            <Clock className="w-3 h-3 text-brand-cyan" />
            SESIÓN DE 3HS
          </span>
          <p className={`text-sm font-bold font-mono mt-0.5 ${isMining ? 'text-brand-cyan' : 'text-amber-500'}`}>
            {timeLeftStr}
          </p>
        </div>
      </div>

      {/* Main Reactor Core tapping field */}
      <div className="relative flex-1 flex flex-col items-center justify-center py-6 w-full">
        {/* Glowing aura behind the coin */}
        <div className={`absolute w-56 h-56 rounded-full bg-brand-cyan/10 blur-3xl transition-all duration-1000 ${isMining ? 'scale-110 opacity-100 animate-pulse' : 'scale-75 opacity-20'}`} />

        <div className="relative" ref={coinContainerRef}>
          {/* Neon clicker coin */}
          <motion.div
            whileHover={{ scale: isMining ? 1.05 : 1 }}
            whileTap={{ scale: isMining ? 0.95 : 1 }}
            onClick={handleCoinClick}
            className={`w-44 h-44 rounded-full flex items-center justify-center cursor-pointer select-none relative z-10 transition-all duration-300 ${
              isMining 
                ? 'border-4 border-brand-cyan bg-cyber-black shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_50px_rgba(0,212,255,0.45)]' 
                : 'border-4 border-slate-800 bg-slate-900/40 cursor-not-allowed opacity-50'
            }`}
          >
            {/* Inside details */}
            <div className="text-center p-3">
              <span className={`text-4xl font-black tracking-widest font-mono text-white ${isMining ? 'animate-pulse' : ''}`}>
                KRT
              </span>
              <p className="text-[9px] font-mono text-brand-cyan/80 mt-1 uppercase tracking-widest">
                {isMining ? '¡TAP PARA BOOST!' : 'SISTEMA APAGADO'}
              </p>
            </div>

            {/* Simulated rotating tech ring */}
            {isMining && (
              <div className="absolute inset-0 border border-dashed border-brand-cyan/30 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none scale-110"></div>
            )}
          </motion.div>

          {/* Floaters Animation Container */}
          <AnimatePresence>
            {clickIndicators.map((click) => (
              <motion.div
                key={click.id}
                initial={{ opacity: 1, y: click.y - 10, scale: 0.8 }}
                animate={{ opacity: 0, y: click.y - 80, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: click.x - 30,
                  top: click.y - 20,
                  zIndex: 40,
                }}
                className="text-brand-cyan font-mono font-bold text-xs pointer-events-none drop-shadow-[0_0_6px_#00d4ff] bg-cyber-black/90 border border-brand-cyan/40 px-2 py-0.5 rounded-sm"
              >
                {click.val}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dynamic Help tip if offline */}
        {!isMining && (
          <div className="text-center mt-4 max-w-xs z-10">
            <p className="text-xs text-amber-500 font-mono flex items-center justify-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Suministro de minería bloqueado
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              La sesión de minería de 3 horas ha expirado o no ha iniciado. Actívala con una transmisión para comenzar a generar tokens KRT en la nube.
            </p>
          </div>
        )}
      </div>

      {/* Core controls & Speed stats */}
      <div className="w-full flex flex-col gap-4 mt-auto">
        <div className="grid grid-cols-2 gap-3">
          {/* Speed Indicator */}
          <div className="bg-cyber-black border border-brand-cyan/10 p-3 rounded-sm">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest block uppercase">HASHRATE EFECTIVO</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap className="w-4 h-4 text-brand-cyan animate-pulse" />
              <p className="text-lg font-bold text-brand-cyan font-mono leading-none">
                {currentTotalHashRate.toFixed(2)} <span className="text-xs text-slate-500 font-normal">MH/s</span>
              </p>
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-1">
              Base: {userStats.baseHashRate} + Boost: {activeTapBonus.toFixed(1)}
            </p>
          </div>

          {/* Speed Multiplier */}
          <div className="bg-cyber-black border border-brand-cyan/10 p-3 rounded-sm">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest block uppercase">MULTIPLICADOR TOTAL</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Percent className="w-4 h-4 text-brand-cyan" />
              <p className="text-lg font-bold text-slate-200 font-mono leading-none">
                {userStats.boostMultiplier.toFixed(2)}x
              </p>
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-1">
              Referidos + Staking + Ads
            </p>
          </div>
        </div>

        {/* Master activation button */}
        {!isMining ? (
          <button
            onClick={onActivateSession}
            className="w-full py-3.5 rounded-sm font-bold font-sans tracking-widest text-xs bg-brand-cyan hover:bg-[#00e1ff] text-cyber-black shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_35px_rgba(0,212,255,0.45)] transition-all duration-300 flex items-center justify-center gap-2 group border border-brand-cyan/20 cursor-pointer"
          >
            <Play className="w-4 h-4 text-cyber-black fill-cyber-black group-hover:scale-110 transition-transform" />
            VER ANUNCIO Y ACTIVAR (3H)
          </button>
        ) : (
          <div className="w-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-center py-3 rounded-sm font-mono text-xs flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
            MINANDO ACTIVAMENTE ({timeLeftStr})
          </div>
        )}
      </div>
    </div>
  );
}
