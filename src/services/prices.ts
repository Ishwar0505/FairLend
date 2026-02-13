import type { PriceData } from '@/lib/types';
import { TOKEN_MINTS, COINGECKO_API_KEY } from '@/lib/constants';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Fetch USD prices for all known tokens from CoinGecko.
 * Returns a map of mint address → { usd, change24h }.
 */
export async function fetchPrices(): Promise<PriceData> {
  // Build coingeckoId → mint reverse map
  const idToMint = new Map<string, string>();
  const ids: string[] = [];

  for (const [mint, info] of Object.entries(TOKEN_MINTS)) {
    if (info.coingeckoId) {
      idToMint.set(info.coingeckoId, mint);
      ids.push(info.coingeckoId);
    }
  }

  if (ids.length === 0) return {};

  const params = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: 'usd',
    include_24hr_change: 'true',
  });

  const url = COINGECKO_API_KEY
    ? `https://pro-api.coingecko.com/api/v3/simple/price?${params}&x_cg_pro_api_key=${COINGECKO_API_KEY}`
    : `${COINGECKO_BASE}/simple/price?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data: Record<string, { usd?: number; usd_24h_change?: number }> = await response.json();

  const prices: PriceData = {};
  for (const [cgId, priceInfo] of Object.entries(data)) {
    const mint = idToMint.get(cgId);
    if (mint && priceInfo.usd != null) {
      prices[mint] = {
        usd: priceInfo.usd,
        change24h: priceInfo.usd_24h_change ?? 0,
      };
    }
  }

  return prices;
}
