import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Landmark, Coins, TrendingDown, Hourglass, Zap } from 'lucide-react';
import { BlockchainStats } from '../types';
import { TOTAL_SUPPLY, MINER_ALLOCATION, BURN_ALLOCATION, DEV_ALLOCATION, BLOCK_INTERVAL_SEC } from '../utils/cryptoSim';

interface BlockchainStatsPanelProps {
  stats: BlockchainStats;
  playerBalance: number;
  onBurnTokens: (amount: number) => void;
  playerBurnedTotal: number;
}

export default function BlockchainStatsPanel({
  stats,
  playerBalance,
  onBurnTokens,
  playerBurnedTotal,
}: BlockchainStatsPanelProps) {
  const [burnInput, setBurnInput] = useState<string>('');
  const [burnError, setBurnError] = useState<string | null>(null);

  // Calculate percentages
  const minedPct = (stats.circulatingMined / MINER_ALLOCATION) * 100;
  const burnedPct = (stats.totalBurned / BURN_ALLOCATION) * 100;
  const devPct = (stats.devAllocation / DEV_ALLOCATION) * 100;
  const totalCirculatingCurrent = stats.circulatingMined + stats.devAllocation - stats.totalBurned;

  // Simple historical block reward trajectory simulation
  const rewardData = [
    { progress: '0%', reward: 50.0 },
    { progress: '25%', reward: 37.5 },
    { progress: '50%', reward: 25.0 },
    { progress: '75%', reward: 12.5 },
    { progress: '100%', reward: 1.0 },
  ];

  const handleBurn = () => {
    const amt = parseFloat(burnInput);
    if (isNaN(amt) || amt <= 0) {
      setBurnError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (amt > playerBalance) {
      setBurnError('Saldo de KRT insuficiente');
      return;
    }
    setBurnError(null);
    onBurnTokens(amt);
    setBurnInput('');
  };

  return (
    <div id="blockchain-stats-card" className="bg-cyber-dark border border-brand-cyan/25 rounded-sm p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/5 blur-3xl rounded-full"></div>
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-brand-cyan/15 pb-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 font-mono flex items-center gap-2">
          <Coins className="w-4 h-4 text-brand-cyan" />
          ESTADÍSTICAS FINANCIERAS DE KRITICAL COIN
        </h2>
        <div className="text-right">
          <span className="text-[10px] bg-cyber-black border border-brand-cyan/30 text-brand-cyan font-mono px-2 py-0.5 rounded-sm">
            Suministro total: {TOTAL_SUPPLY.toLocaleString()} KRT
          </span>
        </div>
      </div>

      {/* Progress Bars Group */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mined Progress */}
        <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-brand-cyan" />
                MINADOS POR LA COMUNIDAD
              </span>
              <span className="text-xs font-mono font-bold text-brand-cyan">{minedPct.toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full bg-cyber-gray rounded-sm overflow-hidden border border-brand-cyan/5">
              <div 
                className="h-full bg-brand-cyan rounded-sm shadow-[0_0_8px_rgba(0,212,255,0.6)] transition-all duration-1000"
                style={{ width: `${Math.min(100, minedPct)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">CIRCULANTE MINADO</p>
              <p className="text-sm font-bold text-slate-200 font-mono leading-none mt-1">
                {stats.circulatingMined.toLocaleString(undefined, { maximumFractionDigits: 0 })} / 40M <span className="text-[10px] text-brand-cyan">KRT</span>
              </p>
            </div>
          </div>
        </div>

        {/* Burn Progress */}
        <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                TOKENS QUEMADOS (BURN)
              </span>
              <span className="text-xs font-mono font-bold text-red-400">{burnedPct.toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full bg-cyber-gray rounded-sm overflow-hidden border border-brand-cyan/5">
              <div 
                className="h-full bg-red-500 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all duration-1000"
                style={{ width: `${Math.min(100, burnedPct)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">ACUMULADO QUEMADO</p>
              <p className="text-sm font-bold text-slate-200 font-mono leading-none mt-1">
                {stats.totalBurned.toLocaleString(undefined, { maximumFractionDigits: 0 })} / 5M <span className="text-[10px] text-brand-cyan">KRT</span>
              </p>
            </div>
          </div>
        </div>

        {/* Team/Development Fund */}
        <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-blue-400" />
                FONDO DE DESARROLLO Y EQUIPO
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">{devPct.toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full bg-cyber-gray rounded-sm overflow-hidden border border-brand-cyan/5">
              <div 
                className="h-full bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-1000"
                style={{ width: `${Math.min(100, devPct)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">RESERVADO PARA DESARROLLO</p>
              <p className="text-sm font-bold text-slate-200 font-mono leading-none mt-1">
                {stats.devAllocation.toLocaleString(undefined, { maximumFractionDigits: 0 })} / 5M <span className="text-[10px] text-brand-cyan">KRT</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Block Reward, Next Block validation, and Burn action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Next Block Countdown Gauge & Info */}
        <div className="lg:col-span-4 bg-cyber-black border border-brand-cyan/10 p-5 rounded-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">SIGUIENTE BLOQUE EN</p>
              <h3 className="text-3xl font-black text-brand-cyan font-mono mt-1 flex items-baseline gap-1">
                {stats.timeToNextBlock} <span className="text-xs font-normal text-slate-400">segundos</span>
              </h3>
            </div>
            <div className="p-2 rounded-sm bg-cyber-gray border border-brand-cyan/30 text-brand-cyan animate-pulse">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Resolviendo ecuaciones...</span>
              <span>{Math.round(((BLOCK_INTERVAL_SEC - stats.timeToNextBlock) / BLOCK_INTERVAL_SEC) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-cyber-gray rounded-sm overflow-hidden border border-brand-cyan/5">
              <div 
                className="h-full bg-brand-cyan shadow-[0_0_4px_#00d4ff] transition-all duration-300"
                style={{ width: `${((BLOCK_INTERVAL_SEC - stats.timeToNextBlock) / BLOCK_INTERVAL_SEC) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="border-t border-brand-cyan/15 mt-4 pt-3 flex justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-brand-cyan" />
              Recompensa de Bloque:
            </span>
            <span className="text-brand-cyan font-bold">{stats.currentRewardPerBlock} KRT</span>
          </div>
        </div>

        {/* Dynamic Rewards Trajectory Curve chart */}
        <div className="lg:col-span-4 bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase">CURVA DE RECOMPENSA DINÁMICA</p>
            <p className="text-[9px] text-slate-500 font-mono mb-2">Decae de 50 KRT a 1 KRT según el progreso minado</p>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewardData}>
                <XAxis dataKey="progress" stroke="#475569" fontSize={8} tickLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={[0, 60]} hide />
                <Tooltip 
                  contentStyle={{ background: '#020202', border: '1px solid rgba(0,212,255,0.3)', fontSize: '10px', color: '#cbd5e1', fontFamily: 'monospace' }}
                  labelFormatter={(v) => `Progreso: ${v}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="reward" 
                  stroke="#00d4ff" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#00d4ff' }}
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Interactive Burn Panel */}
        <div className="lg:col-span-4 bg-cyber-gray border border-brand-cyan/15 p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-red-400 font-mono font-bold tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              PORTAL DE QUEMA (ACELERAR RIG)
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1 leading-normal">
              Quema tus KRT permanentemente para recibir un aumento de hashrate vitalicio. 
              <span className="text-brand-cyan ml-1">Cada 50 KRT quemados = +10% Multiplicador.</span>
            </p>
          </div>

          <div className="mt-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="KRT a quemar"
                value={burnInput}
                onChange={(e) => setBurnInput(e.target.value)}
                className="bg-cyber-black border border-brand-cyan/15 text-xs text-slate-200 font-mono px-3 py-1.5 rounded-sm focus:outline-none focus:border-brand-cyan flex-1"
              />
              <button
                onClick={handleBurn}
                className="bg-red-600 hover:bg-red-500 text-slate-100 px-3 py-1.5 rounded-sm text-xs font-mono font-bold border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center gap-1 cursor-pointer"
              >
                QUEMAR
              </button>
            </div>
            {burnError && (
              <p className="text-[10px] text-red-400 font-mono mt-1">{burnError}</p>
            )}
            <p className="text-[9px] text-slate-500 font-mono mt-2 text-right">
              Has quemado: <span className="text-red-400 font-semibold">{playerBurnedTotal.toFixed(2)} KRT</span> (+{((playerBurnedTotal / 50) * 10).toFixed(1)}% boost)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
