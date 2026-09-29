export interface UserStats {
  balance: number;
  minedBalance: number;
  stakedBalance: number;
  totalMined: number;
  totalBurned: number;
  baseHashRate: number; // in MH/s
  boostMultiplier: number; // multiplier from tapping, ads, referrals
  activeSession: MiningSession | null;
  referralCode: string;
  referredBy: string | null;
  referralsCount: number;
  referralBonus: number; // percentage boost (e.g., 0.15 for 15%)
  adBoostUntil: number | null; // timestamp of ad boost expiration
  dailyAdBoostsCount?: number; // count of daily ad boosts used
  lastAdBoostReset?: number; // last reset timestamp for daily ad boosts
}

export interface MiningSession {
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export interface StakingPosition {
  id: string;
  amount: number;
  apy: number;
  lockupDays: number;
  startTime: number;
  endTime: number;
  claimed: boolean;
  accruedInterest: number;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  hashRate: number;
  totalMined: number;
  isPlayer?: boolean;
}

export interface Referral {
  id: string;
  username: string;
  status: 'active' | 'inactive';
  joinedAt: number;
  contribution: number; // how much KRK they generated for user
}

export interface BlockchainStats {
  blockHeight: number;
  circulatingMined: number; // goes up to 40M max
  totalBurned: number; // goes up to 5M max
  devAllocation: number; // goes up to 5M max
  currentRewardPerBlock: number;
  totalActiveHashRate: number; // user + network
  timeToNextBlock: number; // seconds count down
}
