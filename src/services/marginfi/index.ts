import type { UnifiedMarket } from '@/lib/types';

/**
 * marginfi service.
 *
 * marginfi does not have a public REST API and is not present in
 * DeFi Llama's yields API. Full integration requires the
 * @mrgnlabs/marginfi-client-v2 SDK which reads on-chain accounts
 * directly. This SDK has Node.js dependencies that may not work
 * in React Native.
 *
 * For Phase 2, this returns an empty array. Real integration
 * will be added in Phase 5 when we evaluate SDK compatibility
 * for transaction building.
 */

export async function fetchMarginfiMarkets(): Promise<UnifiedMarket[]> {
  // marginfi has no REST API — SDK integration deferred to Phase 5
  console.warn('[FairLend] marginfi: no REST API available, returning empty. SDK integration pending.');
  return [];
}
