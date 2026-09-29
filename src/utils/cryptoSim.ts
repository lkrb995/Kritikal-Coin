import { UserStats, StakingPosition, LeaderboardUser, Referral, BlockchainStats } from '../types';

// Constants for Kritical Coin (KRT)
export const TOTAL_SUPPLY = 50000000;
export const MINER_ALLOCATION = 40000000;
export const BURN_ALLOCATION = 50000000 - 45000000; // 5M
export const DEV_ALLOCATION = 50000000 - 45000000;  // 5M
export const BLOCK_INTERVAL_SEC = 15; // Accelerated block interval for engaging game UI

// Initial player stats
const DEFAULT_USER_STATS: UserStats = {
  balance: 0,
  minedBalance: 0,
  stakedBalance: 0,
  totalMined: 0,
  totalBurned: 0,
  baseHashRate: 2.5, // 2.5 MH/s
  boostMultiplier: 1.0,
  activeSession: null,
  referralCode: 'KRT-7492',
  referredBy: null,
  referralsCount: 0,
  referralBonus: 0,
  adBoostUntil: null,
};

// Initial blockchain stats
const DEFAULT_BLOCKCHAIN_STATS: BlockchainStats = {
  blockHeight: 348210,
  circulatingMined: 14250000, // already mined globally
  totalBurned: 1824000,
  devAllocation: 1564000,
  currentRewardPerBlock: 25.36,
  totalActiveHashRate: 15420.5,
  timeToNextBlock: 15,
};

// Generate list of simulated global miners for high-fidelity ranking
export const generateSimulatedMiners = (playerTotalMined: number, playerHashRate: number): LeaderboardUser[] => {
  const bots: LeaderboardUser[] = [
    { rank: 1, username: 'Zeta_Whale', hashRate: 450.5, totalMined: 145200.45 },
    { rank: 2, username: 'Satoshi_Neon', hashRate: 380.2, totalMined: 121050.12 },
    { rank: 3, username: 'GridRunner_88', hashRate: 310.4, totalMined: 98450.65 },
    { rank: 4, username: 'CryptoStaker_MX', hashRate: 275.0, totalMined: 84120.30 },
    { rank: 5, username: 'cyber_miner_99', hashRate: 210.1, totalMined: 65400.90 },
    { rank: 6, username: 'Nebula_KRT', hashRate: 185.3, totalMined: 51220.40 },
    { rank: 7, username: 'AstroCore_X', hashRate: 140.0, totalMined: 38900.15 },
    { rank: 8, username: 'VoidDigger', hashRate: 95.8, totalMined: 24500.80 },
    { rank: 9, username: 'QuantumFlux', hashRate: 65.2, totalMined: 15600.35 },
    { rank: 10, username: 'HashBlade', hashRate: 45.5, totalMined: 8900.20 },
    { rank: 11, username: 'KritLover_A', hashRate: 24.0, totalMined: 4500.50 },
    { rank: 12, username: 'NeoGamer_Z', hashRate: 15.2, totalMined: 2100.85 },
    { rank: 13, username: 'BitDust', hashRate: 8.5, totalMined: 950.40 },
    { rank: 14, username: 'VoltMinero', hashRate: 4.2, totalMined: 420.10 },
    { rank: 15, username: 'GenesisRust', hashRate: 1.5, totalMined: 150.30 },
  ];

  // Add the player
  const player: LeaderboardUser = {
    rank: 0, // calculated below
    username: 'Tú (Minero Kritical)',
    hashRate: playerHashRate,
    totalMined: playerTotalMined,
    isPlayer: true,
  };

  // Combine and sort
  const combined = [...bots, player];
  combined.sort((a, b) => b.totalMined - a.totalMined);

  // Assign correct ranks
  return combined.map((user, idx) => ({
    ...user,
    rank: idx + 1,
  }));
};

// Generate simulated referrals
export const INITIAL_REFERRALS: Referral[] = [
  { id: 'ref-1', username: 'CryptoBro_44', status: 'active', joinedAt: Date.now() - 86400000 * 3, contribution: 48.5 },
  { id: 'ref-2', username: 'Lara_Neon', status: 'active', joinedAt: Date.now() - 86400000 * 1.5, contribution: 12.2 },
  { id: 'ref-3', username: 'MinerX_Tokyo', status: 'inactive', joinedAt: Date.now() - 86400000 * 5, contribution: 95.4 },
];

// Calculate dynamic block rewards based on circulating mined supply
// The block reward decreases proportionally as circulating supply approaches mining cap (40M)
// This model keeps supply scarce and dynamic
export const calculateBlockReward = (circulatingMined: number): number => {
  const cap = MINER_ALLOCATION;
  if (circulatingMined >= cap) return 0;
  
  // Starting reward is 50 KRK
  const baseReward = 50.0;
  // Progress ratio (0 to 1)
  const progress = circulatingMined / cap;
  
  // Dynamic decay: reward halves progressively, or decays linearly down to 1 KRK
  const reward = Math.max(1.0, baseReward * (1 - progress));
  return parseFloat(reward.toFixed(4));
};

// Local storage management helpers
export const loadLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error loading local data for key ${key}:`, e);
  }
  return defaultValue;
};

export const saveLocalData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving local data for key ${key}:`, e);
  }
};
