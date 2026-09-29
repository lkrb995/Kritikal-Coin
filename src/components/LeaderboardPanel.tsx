import React from 'react';
import { Award, Trophy, Users, Zap } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardPanelProps {
  leaderboard: LeaderboardUser[];
}

export default function LeaderboardPanel({ leaderboard }: LeaderboardPanelProps) {
  return (
    <div id="leaderboard-panel-card" className="bg-cyber-dark border border-brand-cyan/25 rounded-sm p-6 shadow-2xl relative flex flex-col gap-6 h-full">
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-cyan/15 pb-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 font-mono flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          RANKING GLOBAL DE MINEROS (POOL)
        </h2>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-brand-cyan" />
          {leaderboard.length} Nodos Activos
        </span>
      </div>

      {/* Ranks List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 flex flex-col gap-2">
        <div className="grid grid-cols-12 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          <span className="col-span-2">Rank</span>
          <span className="col-span-5">Dirección / Minero</span>
          <span className="col-span-2 text-right">Velocidad</span>
          <span className="col-span-3 text-right">Total Minado</span>
        </div>

        {leaderboard.map((user) => {
          // Highlight first 3 ranks
          let rankBadge = null;
          if (user.rank === 1) {
            rankBadge = <span className="text-amber-400 font-bold flex items-center gap-1">🥇 1</span>;
          } else if (user.rank === 2) {
            rankBadge = <span className="text-slate-300 font-bold flex items-center gap-1">🥈 2</span>;
          } else if (user.rank === 3) {
            rankBadge = <span className="text-amber-700 font-bold flex items-center gap-1">🥉 3</span>;
          } else {
            rankBadge = <span className="text-slate-500 font-mono">{user.rank}</span>;
          }

          return (
            <div
              key={user.username}
              className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-sm border transition-all ${
                user.isPlayer
                  ? 'bg-brand-cyan/10 border-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)] text-cyan-100 font-bold'
                  : 'bg-cyber-black border-brand-cyan/10 text-slate-300 hover:border-brand-cyan/30'
              }`}
            >
              <div className="col-span-2 flex items-center text-xs font-mono">
                {rankBadge}
              </div>

              <div className="col-span-5 flex items-center gap-2 truncate">
                <span className={`text-xs font-mono truncate ${user.isPlayer ? 'text-brand-cyan font-black' : ''}`}>
                  {user.username}
                </span>
                {user.isPlayer && (
                  <span className="text-[8px] bg-brand-cyan text-cyber-black px-1.5 py-0.5 rounded-sm font-mono font-bold shrink-0">
                    TÚ
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right text-xs font-mono text-brand-cyan">
                {user.hashRate.toFixed(1)} <span className="text-[9px] text-slate-500">M/s</span>
              </div>

              <div className="col-span-3 text-right text-xs font-mono font-semibold text-slate-100">
                {user.totalMined.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500">KRC</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-cyber-black border border-brand-cyan/10 p-3 rounded-sm flex items-center gap-2.5">
        <div className="p-1.5 rounded-sm bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
          Competencia en tiempo real. Tu posición en la tabla se actualiza automáticamente conforme minas, aplicas boosts y expandes tu red.
        </p>
      </div>
    </div>
  );
}
