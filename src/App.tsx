import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Flame, Coins, ShieldCheck, Share2, Award, Zap, Bell, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types and Sim Utilities
import { UserStats, StakingPosition, LeaderboardUser, Referral, BlockchainStats } from './types';
import {
  TOTAL_SUPPLY,
  MINER_ALLOCATION,
  BURN_ALLOCATION,
  DEV_ALLOCATION,
  BLOCK_INTERVAL_SEC,
  generateSimulatedMiners,
  INITIAL_REFERRALS,
  calculateBlockReward,
  loadLocalData,
  saveLocalData,
} from './utils/cryptoSim';

// Components
import Header from './components/Header';
import BlockchainStatsPanel from './components/BlockchainStatsPanel';
import MinerCore from './components/MinerCore';
import StakingPanel from './components/StakingPanel';
import ReferralPanel from './components/ReferralPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import AdBoostSimulator from './components/AdBoostSimulator';
import TutorialModal from './components/TutorialModal';
import RoulettePanel from './components/RoulettePanel';

export default function App() {
  // --- 1. State Initialization ---
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const defaultStats: UserStats = {
      balance: 10.0, // Give a 10 KRT welcome gift!
      minedBalance: 0,
      stakedBalance: 0,
      totalMined: 0,
      totalBurned: 0,
      baseHashRate: 2.5,
      boostMultiplier: 1.0,
      activeSession: null,
      referralCode: 'KRT-' + Math.floor(1000 + Math.random() * 9000),
      referredBy: null,
      referralsCount: 0,
      referralBonus: 0,
      adBoostUntil: null,
      dailyAdBoostsCount: 0,
      lastAdBoostReset: Date.now(),
    };
    return loadLocalData<UserStats>('krk_user_stats_v2', defaultStats);
  });

  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats>(() => {
    const defaultBlockStats: BlockchainStats = {
      blockHeight: 348210,
      circulatingMined: 14250000,
      totalBurned: 1824000,
      devAllocation: 1564000,
      currentRewardPerBlock: 25.36,
      totalActiveHashRate: 15420.5,
      timeToNextBlock: BLOCK_INTERVAL_SEC,
    };
    return loadLocalData<BlockchainStats>('krk_blockchain_stats_v2', defaultBlockStats);
  });

  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(() => {
    return loadLocalData<StakingPosition[]>('krk_staking_positions_v2', []);
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    return loadLocalData<Referral[]>('krk_referrals_v2', INITIAL_REFERRALS);
  });

  // Tap temporary boost hashrate
  const [activeTapBonus, setActiveTapBonus] = useState<number>(0);

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<'mining' | 'wallet' | 'roulette'>('mining');

  // Ad Purpose tracking
  const [adPurpose, setAdPurpose] = useState<'mining' | 'boost' | 'roulette' | 'general' | null>(null);

  // Roulette spin targets
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);

  // Overlay modald
  const [showAdSimulator, setShowAdSimulator] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Active notifications
  const [notification, setNotification] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Temporary variable to prevent massive writing cycles
  const tickCounterRef = useRef(0);

  // Helper to trigger floating notifications
  const triggerNotification = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString();
    setNotification({ id, text, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  // --- 2. Recalculate Multiplier based on all active boosts ---
  useEffect(() => {
    // 1. Referral Bonus: +5% per referral (max 100%)
    const activeRefs = referrals.filter((r) => r.status === 'active').length;
    let refBonus = activeRefs * 0.05;
    if (activeRefs >= 20) refBonus = 1.00; // Cap at 100%
    else if (activeRefs >= 10) refBonus = 0.50;
    else if (activeRefs >= 5) refBonus = 0.25;
    else if (activeRefs >= 3) refBonus = 0.15;

    // 2. Staking Bonus:
    // Flexible: +2% boost per 100 KRT staked
    // Silver (30d): +5% boost per 100 KRT staked
    // Gold (90d): +12% boost per 100 KRT staked
    let stakeBonus = 0;
    stakingPositions.forEach((pos) => {
      const factor = pos.amount / 100;
      if (pos.lockupDays === 0) stakeBonus += factor * 0.02;
      else if (pos.lockupDays === 30) stakeBonus += factor * 0.05;
      else if (pos.lockupDays === 90) stakeBonus += factor * 0.12;
    });

    // 3. Burn Bonus: +10% per 50 KRT burned
    const burnBonus = (userStats.totalBurned / 50) * 0.10;

    // 4. Ad boost: +100% (2x speed)
    const isAdBoostActive = userStats.adBoostUntil && userStats.adBoostUntil > Date.now();
    const adBonus = isAdBoostActive ? 1.0 : 0.0;

    // Combined boost multiplier
    const totalMultiplier = 1.0 + refBonus + stakeBonus + burnBonus + adBonus;

    setUserStats((prev) => ({
      ...prev,
      boostMultiplier: totalMultiplier,
      referralsCount: referrals.length,
      referralBonus: refBonus,
    }));
  }, [referrals, stakingPositions, userStats.totalBurned, userStats.adBoostUntil]);

  // --- 3. The Master Live Loop (Updates every 1 second) ---
  useEffect(() => {
    const mainTimer = setInterval(() => {
      const now = Date.now();
      const isMiningSessionActive = userStats.activeSession?.isActive && userStats.activeSession.endTime > now;

      // Reset daily ad boosts if 24 hours have elapsed since last reset
      setUserStats((prev) => {
        const lastReset = prev.lastAdBoostReset || 0;
        if (now - lastReset > 24 * 60 * 60 * 1000) {
          return {
            ...prev,
            dailyAdBoostsCount: 0,
            lastAdBoostReset: now,
          };
        }
        return prev;
      });

      // 1. Dynamic Tap Bonus decay (decreases by 8% every second, minimal 0)
      setActiveTapBonus((prev) => {
        if (prev <= 0.05) return 0;
        return prev * 0.92;
      });

      // 2. Accumulate Continuous Mining Yield (if session is active)
      let minedThisTick = 0;
      if (isMiningSessionActive) {
        // Player speed in MH/s
        const speed = (userStats.baseHashRate + activeTapBonus) * userStats.boostMultiplier;
        
        // Let's generate tokens proportional to Hash Rate:
        // 1 MH/s generates roughly 0.0004 KRT per second. Very interactive and visible!
        minedThisTick = speed * 0.0004;

        setUserStats((prev) => {
          const nextBalance = prev.balance + minedThisTick;
          const nextMined = prev.minedBalance + minedThisTick;
          const nextTotal = prev.totalMined + minedThisTick;

          return {
            ...prev,
            balance: nextBalance,
            minedBalance: nextMined,
            totalMined: nextTotal,
          };
        });

        // Simulating referred users generating commission (10% of their speed goes as referral bonus!)
        const activeRefs = referrals.filter((r) => r.status === 'active');
        if (activeRefs.length > 0) {
          const bonusFromRefs = activeRefs.length * 0.00015; // small real-time bonus contribution
          
          setUserStats((prev) => ({
            ...prev,
            balance: prev.balance + bonusFromRefs,
          }));

          setReferrals((prevRefs) =>
            prevRefs.map((ref) => {
              if (ref.status === 'active') {
                return {
                  ...ref,
                  contribution: ref.contribution + 0.00015,
                };
              }
              return ref;
            })
          );
        }
      }

      // Check for session expiry
      if (userStats.activeSession?.isActive && userStats.activeSession.endTime <= now) {
        setUserStats((prev) => ({
          ...prev,
          activeSession: {
            ...prev.activeSession!,
            isActive: false,
          },
        }));
        triggerNotification('⚠️ Tu sesión de minería de 3hs ha terminado. ¡Actívala de nuevo para reiniciar el rig!', 'warning');
      }

      // 3. Staking Compounding Interest
      // We accelerate interest compounding by 1000x for gameplay excitement!
      // Real formula interest per second: amount * (apy/100) / (365 * 24 * 3600)
      const STAKING_ACCELERATION_FACTOR = 1000;
      setStakingPositions((prevPositions) =>
        prevPositions.map((pos) => {
          if (pos.claimed) return pos;

          // Calculate earned interest
          const interestPerSec = pos.amount * (pos.apy / 100) / (365 * 24 * 3600);
          const accrued = interestPerSec * STAKING_ACCELERATION_FACTOR;

          return {
            ...pos,
            accruedInterest: pos.accruedInterest + accrued,
          };
        })
      );

      // 4. Decrypt / Count Down to Next Block
      setBlockchainStats((prevBlockStats) => {
        const nextTime = prevBlockStats.timeToNextBlock - 1;
        
        if (nextTime <= 0) {
          // A block is resolved on the network!
          const newBlockHeight = prevBlockStats.blockHeight + 1;
          const blockReward = calculateBlockReward(prevBlockStats.circulatingMined);

          // Dev Treasury receives 10% of block reward
          const devPortion = blockReward * 0.10;
          // Burn pool receives a tiny automatic burn from global tx volume
          const autoGlobalBurn = blockReward * 0.05;

          // If the player's session is active, they receive a POOL SHARE!
          // Pool Share = (Player Hashrate / Global Hashrate) * Block Reward
          let playerPoolShare = 0;
          if (isMiningSessionActive) {
            const speed = (userStats.baseHashRate + activeTapBonus) * userStats.boostMultiplier;
            const poolRatio = speed / prevBlockStats.totalActiveHashRate;
            playerPoolShare = poolRatio * blockReward * 120; // amplified to reward block solves!
            
            setUserStats((prev) => ({
              ...prev,
              balance: prev.balance + playerPoolShare,
              minedBalance: prev.minedBalance + playerPoolShare,
              totalMined: prev.totalMined + playerPoolShare,
            }));

            triggerNotification(`🎉 ¡Bloque #${newBlockHeight} resuelto! Participación en pool reclamada: +${playerPoolShare.toFixed(3)} KRT`, 'success');
          }

          // Return updated block statistics
          return {
            ...prevBlockStats,
            blockHeight: newBlockHeight,
            circulatingMined: Math.min(MINER_ALLOCATION, prevBlockStats.circulatingMined + blockReward),
            totalBurned: Math.min(BURN_ALLOCATION, prevBlockStats.totalBurned + autoGlobalBurn),
            devAllocation: Math.min(DEV_ALLOCATION, prevBlockStats.devAllocation + devPortion),
            currentRewardPerBlock: calculateBlockReward(prevBlockStats.circulatingMined + blockReward),
            timeToNextBlock: BLOCK_INTERVAL_SEC, // reset countdown
            // global speed fluctuates slightly
            totalActiveHashRate: Math.max(12000, prevBlockStats.totalActiveHashRate + (Math.random() * 50 - 25)),
          };
        }

        return {
          ...prevBlockStats,
          timeToNextBlock: nextTime,
        };
      });

      // 5. Periodic Local Storage persistence (every 3 ticks to conserve disk writes)
      tickCounterRef.current += 1;
      if (tickCounterRef.current >= 3) {
        tickCounterRef.current = 0;
        saveLocalData('krk_user_stats_v2', userStats);
        saveLocalData('krk_staking_positions_v2', stakingPositions);
        saveLocalData('krk_referrals_v2', referrals);
        saveLocalData('krk_blockchain_stats_v2', blockchainStats);
      }
    }, 1000);

    return () => clearInterval(mainTimer);
  }, [userStats, stakingPositions, referrals, blockchainStats, activeTapBonus]);

  // --- 4. Interactive User Handlers ---

  // Activating the 3-hour mining rig via Ad
  const handleActivateSession = () => {
    setAdPurpose('mining');
    setShowAdSimulator(true);
  };

  // Click on Coin: returns instant rewards + speeds hashrate temporarily
  const handleTapCoin = (x: number, y: number) => {
    const balanceBonus = 0.004 * userStats.boostMultiplier;
    const hashBonus = 0.2; // adding speed on tapping

    // Direct state updates for speed and instant feedback
    setActiveTapBonus((prev) => Math.min(50, prev + hashBonus)); // max 50 MH/s tap speed
    setUserStats((prev) => ({
      ...prev,
      balance: prev.balance + balanceBonus,
      minedBalance: prev.minedBalance + balanceBonus,
      totalMined: prev.totalMined + balanceBonus,
    }));

    return { balanceBonus, hashBonus };
  };

  // Creating a new Staking Contract
  const handleStake = (amount: number, lockupDays: number, apy: number) => {
    if (amount > userStats.balance) return;

    // For player gameplay, we convert lockupDays to testable fast seconds countdown!
    // lockupDays === 0: Flexible (no lock, can withdraw anytime)
    // lockupDays === 30: Silver lock (60 seconds)
    // lockupDays === 90: Gold lock (180 seconds)
    const durationMs = lockupDays === 30 ? 60 * 1000 : lockupDays === 90 ? 180 * 1000 : 0;

    const newPosition: StakingPosition = {
      id: 'stake-' + Math.random().toString(36).substr(2, 9),
      amount,
      apy,
      lockupDays,
      startTime: Date.now(),
      endTime: Date.now() + durationMs,
      claimed: false,
      accruedInterest: 0,
    };

    setStakingPositions((prev) => [...prev, newPosition]);
    setUserStats((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      stakedBalance: prev.stakedBalance + amount,
    }));

    triggerNotification(`🔒 Depósito exitoso en Staking: ${amount} KRT lockup por ${lockupDays === 0 ? 'Flexible' : `${lockupDays} días (simulados en segundos)`}`, 'success');
  };

  // Claim interest earned from a specific staking contract
  const handleClaimInterest = (id: string) => {
    const posIndex = stakingPositions.findIndex((p) => p.id === id);
    if (posIndex === -1) return;

    const pos = stakingPositions[posIndex];
    const interest = pos.accruedInterest;

    setUserStats((prev) => ({
      ...prev,
      balance: prev.balance + interest,
    }));

    setStakingPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, accruedInterest: 0 } : p))
    );

    triggerNotification(`💰 Intereses reclamados: +${interest.toFixed(5)} KRT`, 'success');
  };

  // Unstake contract principal + claim any pending yield
  const handleUnstake = (id: string) => {
    const posIndex = stakingPositions.findIndex((p) => p.id === id);
    if (posIndex === -1) return;

    const pos = stakingPositions[posIndex];
    const interest = pos.accruedInterest;
    const principal = pos.amount;

    setUserStats((prev) => ({
      ...prev,
      balance: prev.balance + principal + interest,
      stakedBalance: prev.stakedBalance - principal,
    }));

    setStakingPositions((prev) => prev.filter((p) => p.id !== id));

    triggerNotification(`🔓 Unstake completado. Reclamado principal: ${principal} KRT + intereses: +${interest.toFixed(5)} KRT`, 'success');
  };

  // Burning portal tokens
  const handleBurnTokens = (amount: number) => {
    if (amount > userStats.balance) return;

    setUserStats((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      totalBurned: prev.totalBurned + amount,
    }));

    setBlockchainStats((prev) => ({
      ...prev,
      totalBurned: Math.min(BURN_ALLOCATION, prev.totalBurned + amount),
    }));

    triggerNotification(`🔥 ¡Has quemado ${amount} KRT! Multiplicador de hashrate aumentado permanentemente.`, 'success');
  };

  // Simulate inviting a friend
  const handleAddSimulatedReferral = () => {
    const listBots = [
      'MinerVoz_Neon', 'VoltHex_88', 'BitRaider', 'Crypton_99', 'SatoshiSentry', 'NebulaDigger'
    ];
    const randomUser = listBots[Math.floor(Math.random() * listBots.length)] + '_' + Math.floor(100 + Math.random() * 900);

    const newRef: Referral = {
      id: 'ref-' + Math.random().toString(),
      username: randomUser,
      status: 'active',
      joinedAt: Date.now(),
      contribution: 0,
    };

    setReferrals((prev) => [...prev, newRef]);
    triggerNotification(`🤝 ¡Felicidades! Se ha unido un nuevo minero a tu enlace: ${randomUser}`, 'success');
  };

  // Ad Complete handler with multiple ad purposes (mining, boost, roulette, general)
  const handleAdComplete = () => {
    const now = Date.now();
    
    if (adPurpose === 'mining') {
      const startTime = now;
      const endTime = startTime + 3 * 60 * 60 * 1000; // 3 hours session
      setUserStats((prev) => ({
        ...prev,
        activeSession: {
          startTime,
          endTime,
          isActive: true,
        },
      }));
      triggerNotification('🚀 ¡Plataforma de Minería Activada por 3 horas!', 'success');
    } else if (adPurpose === 'boost') {
      const currentCount = userStats.dailyAdBoostsCount || 0;
      const durationMs = 1 * 60 * 60 * 1000; // +1 hour duration
      const currentUntil = userStats.adBoostUntil || 0;
      const newUntil = Math.max(now, currentUntil) + durationMs;

      setUserStats((prev) => ({
        ...prev,
        adBoostUntil: newUntil,
        dailyAdBoostsCount: currentCount + 1,
      }));
      triggerNotification(`⚡ ¡Boost de Hashrate activado! (+50% velocidad por +1 hora). Límite hoy: ${currentCount + 1}/10.`, 'success');
    } else if (adPurpose === 'roulette') {
      // Pick a random prize index (0 to 7) for the RoulettePanel
      const prizeIndex = Math.floor(Math.random() * 8);
      setTargetPrizeIndex(prizeIndex);
      triggerNotification('🎡 Transmisión validada. ¡Iniciando el giro de la ruleta!', 'info');
    } else {
      // General default boost (4 hours)
      const durationMs = 4 * 60 * 60 * 1000;
      setUserStats((prev) => ({
        ...prev,
        adBoostUntil: now + durationMs,
      }));
      triggerNotification('⚡ ¡Fabuloso! 2x de Hashrate Boost activado por 4 horas.', 'success');
    }

    setShowAdSimulator(false);
  };

  // Roulette handlers
  const handleClaimPrize = (prizeValue: number) => {
    setUserStats((prev) => ({
      ...prev,
      balance: prev.balance + prizeValue,
    }));
    setTargetPrizeIndex(null);
    setAdPurpose(null);
    triggerNotification(`🎉 ¡Felicidades! Reclamaste +${prizeValue.toFixed(2)} KRT de la ruleta.`, 'success');
  };

  const handleSpinRequest = () => {
    if (targetPrizeIndex !== null) return; // already spinning
    setAdPurpose('roulette');
    setShowAdSimulator(true);
  };

  // Dynamic global leaderboard computation based on user stats
  const currentPlayerHashRate = (userStats.baseHashRate + activeTapBonus) * userStats.boostMultiplier;
  const leaderboardData = generateSimulatedMiners(userStats.totalMined, currentPlayerHashRate);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 pb-12 relative overflow-x-hidden">
      
      {/* Background neon grid grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#022335_1px,transparent_1px),linear-gradient(to_bottom,#022335_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

      {/* 1. Header component */}
      <Header
        totalBalance={userStats.balance}
        globalHashRate={blockchainStats.totalActiveHashRate}
        blockHeight={blockchainStats.blockHeight}
        isSessionActive={!!userStats.activeSession?.isActive}
        onShowTutorial={() => setShowTutorialModal(true)}
      />

      {/* Interactive notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur ${
              notification.type === 'success' 
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200' 
                : notification.type === 'warning' 
                ? 'bg-red-950/80 border-red-500/60 text-red-200' 
                : 'bg-slate-900/80 border-slate-700 text-slate-200'
            }`}>
              <Bell className="w-5 h-5 shrink-0 animate-bounce" />
              <p className="text-xs font-mono font-medium leading-relaxed">{notification.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Dashboard */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 flex flex-col gap-6 relative z-10">
        
        {/* Dynamic Ad Booster alert rail */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 shrink-0">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-slate-200">
                  {userStats.adBoostUntil && userStats.adBoostUntil > Date.now()
                    ? '⚡ ¡MULTIPLICADOR DE ANUNCIO ACTIVO! (+100% velocidad)'
                    : '🚀 ACELERA TU VELOCIDAD DE MINADO'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {userStats.adBoostUntil && userStats.adBoostUntil > Date.now()
                    ? `Quedan ${Math.round((userStats.adBoostUntil - Date.now()) / (60 * 1000))} minutos de velocidad 2x.`
                    : 'Disfruta de un anuncio de patrocinadores y duplica tu hashrate temporalmente.'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-cyber-black border border-brand-cyan/20 px-3 py-2 rounded-sm text-center">
                BOOSTS HOY: <strong className="text-brand-cyan">{(userStats.dailyAdBoostsCount || 0)}/10</strong>
              </span>
              <button
                onClick={() => {
                  const currentCount = userStats.dailyAdBoostsCount || 0;
                  if (currentCount >= 10) {
                    triggerNotification('⚠️ Has alcanzado el límite diario de 10 boosts por anuncio.', 'warning');
                    return;
                  }
                  setAdPurpose('boost');
                  setShowAdSimulator(true);
                }}
                disabled={(userStats.dailyAdBoostsCount || 0) >= 10}
                className={`px-4 py-2 rounded-sm text-xs font-mono font-bold transition-all flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center cursor-pointer ${
                  (userStats.dailyAdBoostsCount || 0) >= 10
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-cyan-950 hover:bg-[#00e1ff] hover:text-cyber-black text-cyan-400 border border-cyan-700 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                }`}
              >
                OBTENER BOOST DE VELOCIDAD
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs System */}
        <div id="navigation-tabs" className="grid grid-cols-3 gap-2 bg-cyber-dark/80 border border-brand-cyan/20 p-1.5 rounded-sm backdrop-blur sticky top-20 z-40 shadow-lg">
          <button
            onClick={() => setActiveTab('mining')}
            className={`py-3 px-2 font-mono font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-all rounded-sm text-center cursor-pointer border ${
              activeTab === 'mining'
                ? 'bg-brand-cyan text-cyber-black border-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'bg-cyber-black text-slate-400 border-slate-900 hover:border-brand-cyan/40 hover:text-brand-cyan'
            }`}
          >
            ⛏️ Minería
          </button>
          
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-2 font-mono font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-all rounded-sm text-center cursor-pointer border ${
              activeTab === 'wallet'
                ? 'bg-brand-cyan text-cyber-black border-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'bg-cyber-black text-slate-400 border-slate-900 hover:border-brand-cyan/40 hover:text-brand-cyan'
            }`}
          >
            💼 Billetera
          </button>
          
          <button
            onClick={() => setActiveTab('roulette')}
            className={`py-3 px-2 font-mono font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-all rounded-sm text-center cursor-pointer border ${
              activeTab === 'roulette'
                ? 'bg-brand-cyan text-cyber-black border-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'bg-cyber-black text-slate-400 border-slate-900 hover:border-brand-cyan/40 hover:text-brand-cyan'
            }`}
          >
            🎡 Ruleta KRT
          </button>
        </div>

        {/* Render Active Tab Pane */}
        <div className="transition-all duration-300">
          {activeTab === 'mining' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5">
                  <MinerCore
                    userStats={userStats}
                    onActivateSession={handleActivateSession}
                    onTapCoin={handleTapCoin}
                    activeTapBonus={activeTapBonus}
                  />
                </div>
                <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
                  <BlockchainStatsPanel
                    stats={blockchainStats}
                    playerBalance={userStats.balance}
                    onBurnTokens={handleBurnTokens}
                    playerBurnedTotal={userStats.totalBurned}
                  />
                </div>
              </div>
              <LeaderboardPanel leaderboard={leaderboardData} />
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="flex flex-col gap-6">
              {/* Wallet overview card */}
              <div className="bg-cyber-dark border border-brand-cyan/25 p-6 rounded-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-3xl rounded-full"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-cyan/15 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-brand-cyan tracking-widest block uppercase mb-1">
                      BILLETERA DE TESTNET KRITICAL
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-white font-mono flex items-center gap-2">
                      DIRECCIÓN: <span className="text-slate-400 selection:bg-brand-cyan selection:text-cyber-black">krt_wallet_f73b88a912a20b9e</span>
                    </h2>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => triggerNotification('🔄 Dirección de depósito copiada al portapapeles (Simulado)', 'info')}
                      className="bg-cyber-black border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/10 font-mono text-[10px] px-3.5 py-2 rounded-sm cursor-pointer transition-all uppercase tracking-wider font-bold"
                    >
                      Copiar Dirección
                    </button>
                    <button
                      onClick={() => triggerNotification('⚠️ Para retirar tus KRT debes esperar al lanzamiento de la mainnet en 2027.', 'warning')}
                      className="bg-brand-cyan text-cyber-black font-mono font-black text-[10px] px-4 py-2 rounded-sm hover:bg-[#00e1ff] cursor-pointer transition-all shadow-[0_0_15px_rgba(0,212,255,0.25)] uppercase tracking-wider"
                    >
                      Retirar (Mainnet)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm">
                    <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">SALDO DISPONIBLE</p>
                    <p className="text-lg font-bold text-white font-mono mt-1">
                      {userStats.balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} <span className="text-xs text-brand-cyan">KRT</span>
                    </p>
                  </div>
                  <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm">
                    <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">STAKING BLOQUEADO</p>
                    <p className="text-lg font-bold text-slate-300 font-mono mt-1">
                      {userStats.stakedBalance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} <span className="text-xs text-slate-400">KRT</span>
                    </p>
                  </div>
                  <div className="bg-cyber-black border border-brand-cyan/10 p-4 rounded-sm">
                    <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">TOTAL QUEMADO</p>
                    <p className="text-lg font-bold text-red-500 font-mono mt-1">
                      {userStats.totalBurned.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} <span className="text-xs text-red-400">KRT</span>
                    </p>
                  </div>
                </div>
              </div>

              <StakingPanel
                playerBalance={userStats.balance}
                stakingPositions={stakingPositions}
                onStake={handleStake}
                onClaimInterest={handleClaimInterest}
                onUnstake={handleUnstake}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <ReferralPanel
                  referralCode={userStats.referralCode}
                  referrals={referrals}
                  onAddSimulatedReferral={handleAddSimulatedReferral}
                  referralBonus={userStats.referralBonus}
                />
                <LeaderboardPanel leaderboard={leaderboardData} />
              </div>
            </div>
          )}

          {activeTab === 'roulette' && (
            <RoulettePanel
              userStats={userStats}
              targetPrizeIndex={targetPrizeIndex}
              onSpinRequest={handleSpinRequest}
              onClaimPrize={handleClaimPrize}
            />
          )}
        </div>
      </main>

      {/* Cyber Advertising modal overlay */}
      {showAdSimulator && (
        <AdBoostSimulator
          onClose={() => setShowAdSimulator(false)}
          onAdComplete={handleAdComplete}
          purpose={adPurpose}
        />
      )}

      {/* Blockchain explanation / guide modal overlay */}
      {showTutorialModal && (
        <TutorialModal onClose={() => setShowTutorialModal(false)} />
      )}
    </div>
  );
}
