import type { UnifiedMarket } from '@/lib/types';
import { PROTOCOL_DISPLAY, TOKEN_MINTS } from '@/lib/constants';

/**
 * Save (formerly Solend) service.
 * Uses DeFi Llama yields API (project = "save") which provides
 * supply APY via /pools and borrow APY via /lendBorrow.
 */

const LLAMA_POOLS_URL = 'https://yields.llama.fi/pools';
const LLAMA_LEND_BORROW_URL = 'https://yields.llama.fi/lendBorrow';

interface LlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apy: number | null;
  pool: string;
  underlyingTokens: string[] | null;
  stablecoin: boolean;
}

interface LlamaLendBorrow {
  pool: string;
  apyBaseBorrow: number | null;
  totalSupplyUsd: number | null;
  totalBorrowUsd: number | null;
  ltv: number | null;
}

export async function fetchSolendMarkets(): Promise<UnifiedMarket[]> {
  const [poolsRes, lendBorrowRes] = await Promise.all([
    fetch(LLAMA_POOLS_URL),
    fetch(LLAMA_LEND_BORROW_URL),
  ]);

  if (!poolsRes.ok) {
    throw new Error(`DeFi Llama pools error: ${poolsRes.status}`);
  }
  if (!lendBorrowRes.ok) {
    throw new Error(`DeFi Llama lendBorrow error: ${lendBorrowRes.status}`);
  }

  const poolsData: { data: LlamaPool[] } = await poolsRes.json();
  const lendBorrowData: LlamaLendBorrow[] = await lendBorrowRes.json();

  // Filter for Save (Solend) pools on Solana
  const savePools = poolsData.data.filter(
    (p) => p.project === 'save' && p.chain === 'Solana',
  );

  // Build lookup for lendBorrow data by pool UUID
  const lbMap = new Map<string, LlamaLendBorrow>();
  for (const lb of lendBorrowData) {
    lbMap.set(lb.pool, lb);
  }

  return savePools
    .filter((p) => p.tvlUsd > 1000) // Skip dust pools
    .map((p) => {
      const lb = lbMap.get(p.pool);
      const mint = p.underlyingTokens?.[0] ?? '';
      const mintInfo = TOKEN_MINTS[mint];
      const supplyAPY = p.apyBase ?? p.apy ?? 0;
      const borrowAPY = lb?.apyBaseBorrow ?? 0;
      const totalSupplyUSD = lb?.totalSupplyUsd ?? p.tvlUsd;
      const totalBorrowUSD = lb?.totalBorrowUsd ?? 0;
      const utilization = totalSupplyUSD > 0 ? totalBorrowUSD / totalSupplyUSD : 0;

      return {
        id: `solend-${p.pool}`,
        protocol: 'solend' as const,
        asset: mintInfo?.symbol ?? p.symbol,
        assetMint: mint,
        assetDecimals: mintInfo?.decimals ?? 9,
        supplyAPY,
        borrowAPY,
        totalSupply: 0,  // DeFi Llama only gives USD values
        totalSupplyUSD,
        totalBorrow: 0,
        totalBorrowUSD,
        utilization,
        ltv: lb?.ltv ?? 0,
        liquidationThreshold: lb?.ltv ? Math.min(lb.ltv + 0.05, 0.95) : 0,
        protocolName: PROTOCOL_DISPLAY.solend.name,
        protocolColor: PROTOCOL_DISPLAY.solend.color,
        reserveAddress: p.pool, // DeFi Llama pool UUID
      };
    });
}
