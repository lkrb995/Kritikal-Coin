import React, { useState } from 'react';
import { Landmark, TrendingUp, Lock, Sparkles, HelpCircle } from 'lucide-react';
import { StakingPosition } from '../types';

interface StakingPanelProps {
  playerBalance: number;
  stakingPositions: StakingPosition[];
  onStake: (amount: number, lockupDays: number, apy: number) => void;
  onClaimInterest: (id: string) => void;
  onUnstake: (id: string) => void;
}

export default function StakingPanel({
  playerBalance,
  stakingPositions,
  onStake,
  onClaimInterest,
  onUnstake,
}: StakingPanelProps) {
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<number>(30); // Default 30 days
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Staking Products configuration
  const STAKING_PRODUCTS = [
    { days: 0, label: 'Flexible', apy: 8.0, desc: 'Retiro instantáneo. +2% boost de minería por cada 100 KRT.' },
    { days: 30, label: 'Plata (30 Días)', apy: 18.0, desc: 'Bloqueo temporal. +5% boost de minería por cada 100 KRT.' },
    { days: 90, label: 'Oro (90 Días)', apy: 35.0, desc: 'Bloqueo máximo. +12% boost de minería por cada 100 KRT.' },
  ];

  const handleStake = () => {
    const amt = parseFloat(stakeAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }
    if (amt > playerBalance) {
      setErrorMsg('Saldo disponible insuficiente');
      return;
    }
    setErrorMsg(null);

    const product = STAKING_PRODUCTS.find((p) => p.days === selectedProduct);
    if (product) {
      onStake(amt, product.days, product.apy);
      setStakeAmount('');
    }
  };

  const selectedProductDetails = STAKING_PRODUCTS.find((p) => p.days === selectedProduct)!;
  const estimatedAnnualYield = (parseFloat(stakeAmount) || 0) * (selectedProductDetails.apy / 100);

  const totalStaked = stakingPositions.reduce((sum, pos) => sum + pos.amount, 0);

  return (
    <div id="staking-panel-card" className="bg-cyber-dark border border-brand-cyan/25 rounded-sm p-6 shadow-2xl relative flex flex-col gap-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-cyan/15 pb-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 font-mono flex items-center gap-2">
          <Landmark className="w-4 h-4 text-brand-cyan" />
          MÓDULO DE STAKING INTEGRADO
        </h2>
        <span className="text-xs text-brand-cyan font-mono font-bold bg-cyber-black border border-brand-cyan/30 px-2.5 py-1 rounded-sm">
          Total Staked: {totalStaked.toFixed(2)} KRT
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Stake Creation Section */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">CREAR NUEVO CONTRATO DE PARTICIPACIÓN</p>
          
          {/* Input amount */}
          <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Monto a depositar</span>
              <span 
                onClick={() => setStakeAmount(playerBalance.toString())}
                className="text-xs text-brand-cyan font-mono hover:underline cursor-pointer"
              >
                Max: {playerBalance.toFixed(4)} KRT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Cantidad de KRT"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-transparent text-xl font-bold font-mono text-brand-cyan w-full focus:outline-none"
              />
              <span className="text-sm font-mono font-bold text-slate-400">KRT</span>
            </div>
          </div>

          {/* Product selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 font-mono">Selecciona plazo de bloqueo:</span>
            <div className="grid grid-cols-3 gap-2">
              {STAKING_PRODUCTS.map((prod) => (
                <button
                  key={prod.days}
                  onClick={() => setSelectedProduct(prod.days)}
                  className={`p-2.5 rounded-sm border text-center transition-all cursor-pointer ${
                    selectedProduct === prod.days
                      ? 'bg-brand-cyan/15 border-brand-cyan text-brand-cyan shadow-[0_0_10px_rgba(0,212,255,0.25)]'
                      : 'bg-cyber-black border-brand-cyan/10 text-slate-400 hover:border-brand-cyan/30'
                  }`}
                >
                  <p className="text-[10px] font-mono font-bold leading-none">{prod.label}</p>
                  <p className="text-sm font-bold font-mono mt-1 text-brand-cyan">{prod.apy}% APY</p>
                </button>
              ))}
            </div>
          </div>

          {/* Staking summary & estimated yield */}
          <div className="bg-brand-cyan/5 border border-brand-cyan/15 p-4 rounded-sm flex flex-col gap-2">
            <p className="text-[10px] text-brand-cyan font-mono leading-relaxed">
              💡 {selectedProductDetails.desc}
            </p>
            <div className="border-t border-brand-cyan/10 my-1"></div>
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Retorno anual estimado (APY):</span>
              <span className="text-brand-cyan font-bold">+{estimatedAnnualYield.toFixed(2)} KRT / año</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-mono">{errorMsg}</p>
          )}

          <button
            onClick={handleStake}
            className="w-full py-3 rounded-sm font-bold text-xs font-mono tracking-widest text-cyber-black bg-brand-cyan hover:bg-[#00e1ff] transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            STAKEAR TOKENS Y AUMENTAR HASHRATE
          </button>
        </div>

        {/* Staked list Section */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">CONTRATOS DE STAKING ACTIVOS</p>
          
          {stakingPositions.length === 0 ? (
            <div className="bg-cyber-black border border-brand-cyan/10 rounded-sm py-12 text-center text-slate-500 font-mono flex flex-col items-center gap-2">
              <Landmark className="w-8 h-8 text-slate-600 animate-pulse" />
              <p className="text-xs">No tienes tokens en participación actualmente.</p>
              <p className="text-[10px] text-slate-600">Deposita KRT para recibir ingresos pasivos y aceleradores.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
              {stakingPositions.map((pos) => {
                const now = Date.now();
                const isLocked = pos.endTime > now;
                const remainingSec = Math.max(0, Math.floor((pos.endTime - now) / 1000));
                
                // Formulate countdown time
                let countdown = 'Completado';
                if (isLocked) {
                  const hours = Math.floor(remainingSec / 3600);
                  const mins = Math.floor((remainingSec % 3600) / 60);
                  const secs = remainingSec % 60;
                  countdown = `${hours}h ${mins}m ${secs}s`;
                }

                return (
                  <div key={pos.id} className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-200">
                          {pos.amount.toFixed(2)} KRT
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan">
                          {pos.apy}% APY
                        </span>
                        {pos.lockupDays > 0 ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-red-900 bg-red-950/20 text-red-400">
                            Candado {pos.lockupDays}d
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-green-900 bg-green-950/20 text-green-400">
                            Flexible
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-[10px] font-mono text-slate-500">
                        <p>Interés Acumulado: <span className="text-brand-cyan font-bold">+{pos.accruedInterest.toFixed(5)} KRT</span></p>
                        <p className="mt-1">Tiempo Restante: <span className={isLocked ? 'text-amber-500' : 'text-green-400 font-bold'}>{countdown}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                      <button
                        onClick={() => onClaimInterest(pos.id)}
                        disabled={pos.accruedInterest <= 0}
                        className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                          pos.accruedInterest > 0
                            ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan hover:bg-brand-cyan/25'
                            : 'bg-cyber-black text-slate-600 border-slate-950 cursor-not-allowed'
                        }`}
                      >
                        RECLAMAR INTERESES
                      </button>
                      <button
                        onClick={() => onUnstake(pos.id)}
                        disabled={isLocked}
                        className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                          !isLocked
                            ? 'bg-red-950/20 border-red-900 text-red-400 hover:bg-red-900/40'
                            : 'bg-cyber-black text-slate-600 border-slate-950 cursor-not-allowed'
                        }`}
                        title={isLocked ? 'Desbloqueo no disponible hasta que termine el plazo' : 'Desbloquear depósito principal'}
                      >
                        DES-STAKEAR TODO
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

