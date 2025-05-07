import type { DriverTierName } from '@/types';

interface TierDefinition {
  minRating: number;
  name: DriverTierName;
  icon?: string; // e.g., emoji or lucide icon name
  colorClass?: string; // Tailwind color class
}

export const DRIVER_TIERS_CONFIG: Record<Exclude<DriverTierName, 'Unranked'>, TierDefinition> = {
  DIAMOND: { minRating: 4.8, name: 'Diamond', icon: '💎', colorClass: 'text-cyan-400' },
  PLATINUM: { minRating: 4.5, name: 'Platinum', icon: '💠', colorClass: 'text-purple-400' },
  GOLD: { minRating: 4.0, name: 'Gold', icon: '🌟', colorClass: 'text-yellow-400' },
  SILVER: { minRating: 3.5, name: 'Silver', icon: '🥈', colorClass: 'text-slate-400' },
  BRONZE: { minRating: 0, name: 'Bronze', icon: '🥉', colorClass: 'text-orange-400' },
};

export const UNRANKED_TIER: TierDefinition = { minRating: 0, name: 'Unranked', icon: '⚫', colorClass: 'text-gray-500' };

export function getDriverTier(averageRating: number): TierDefinition {
  if (averageRating === 0) return UNRANKED_TIER;
  if (averageRating >= DRIVER_TIERS_CONFIG.DIAMOND.minRating) return DRIVER_TIERS_CONFIG.DIAMOND;
  if (averageRating >= DRIVER_TIERS_CONFIG.PLATINUM.minRating) return DRIVER_TIERS_CONFIG.PLATINUM;
  if (averageRating >= DRIVER_TIERS_CONFIG.GOLD.minRating) return DRIVER_TIERS_CONFIG.GOLD;
  if (averageRating >= DRIVER_TIERS_CONFIG.SILVER.minRating) return DRIVER_TIERS_CONFIG.SILVER;
  return DRIVER_TIERS_CONFIG.BRONZE;
}
