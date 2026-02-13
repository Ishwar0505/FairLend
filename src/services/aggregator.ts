import type { UnifiedMarket, UnifiedPosition } from '@/lib/types';

/**
 * Aggregator service — the single entry point for all protocol data.
 * Components/hooks should NEVER call protocol services directly.
 *
 * TODO (Phase 2): Wire up to real Kamino, Solend, marginfi services.
 */

export async function fetchAllMarkets(): Promise<UnifiedMarket[]> {
  // Phase 2: aggregate from all 3 protocol services
  return [];
}

export async function fetchAllPositions(
  _walletAddress: string,
): Promise<UnifiedPosition[]> {
  // Phase 2: aggregate from all 3 protocol services
  return [];
}
