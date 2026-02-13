import type { UnifiedMarket, UnifiedPosition } from '@/lib/types';
import { fetchKaminoMarkets } from '@/services/kamino';
import { fetchSolendMarkets } from '@/services/solend';
import { fetchMarginfiMarkets } from '@/services/marginfi';
import { safeProtocolFetch } from '@/services/errors';

/**
 * Aggregator service — the single entry point for all protocol data.
 * Components/hooks should NEVER call protocol services directly.
 *
 * Uses safeProtocolFetch so one failing protocol doesn't break the app.
 */

export async function fetchAllMarkets(): Promise<UnifiedMarket[]> {
  const [kaminoMarkets, solendMarkets, marginfiMarkets] = await Promise.all([
    safeProtocolFetch('kamino', fetchKaminoMarkets),
    safeProtocolFetch('solend', fetchSolendMarkets),
    safeProtocolFetch('marginfi', fetchMarginfiMarkets),
  ]);

  return [...kaminoMarkets, ...solendMarkets, ...marginfiMarkets];
}

/**
 * Get the best supply rate for a given asset across all protocols.
 */
export function getBestSupplyRate(
  markets: UnifiedMarket[],
  assetMint: string,
): UnifiedMarket | undefined {
  return markets
    .filter((m) => m.assetMint === assetMint)
    .sort((a, b) => b.supplyAPY - a.supplyAPY)[0];
}

/**
 * Get the best (lowest) borrow rate for a given asset across all protocols.
 */
export function getBestBorrowRate(
  markets: UnifiedMarket[],
  assetMint: string,
): UnifiedMarket | undefined {
  return markets
    .filter((m) => m.assetMint === assetMint && m.borrowAPY > 0)
    .sort((a, b) => a.borrowAPY - b.borrowAPY)[0];
}

/**
 * Fetch positions for a connected wallet across all protocols.
 * Requires on-chain reads — deferred to Phase 4.
 */
export async function fetchAllPositions(
  _walletAddress: string,
): Promise<UnifiedPosition[]> {
  // Phase 4: Fetch obligations/accounts from each protocol
  return [];
}
