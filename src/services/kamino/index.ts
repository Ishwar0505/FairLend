import type { UnifiedMarket } from '@/lib/types';
import { KAMINO_MAIN_MARKET, PROTOCOL_DISPLAY, TOKEN_MINTS } from '@/lib/constants';

const KAMINO_API = 'https://api.kamino.finance';

interface KaminoReserveMetric {
  reserve: string;
  liquidityToken: string;
  liquidityTokenMint: string;
  maxLtv: string;
  liquidationLtv?: string;
  borrowApy: string;
  supplyApy: string;
  totalSupply: string;
  totalBorrow: string;
  totalSupplyUsd: string;
  totalBorrowUsd: string;
}

export async function fetchKaminoMarkets(): Promise<UnifiedMarket[]> {
  const url = `${KAMINO_API}/kamino-market/${KAMINO_MAIN_MARKET}/reserves/metrics?env=mainnet-beta`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Kamino API error: ${response.status} ${response.statusText}`);
  }

  const reserves: KaminoReserveMetric[] = await response.json();

  return reserves.map((r) => {
    const mintInfo = TOKEN_MINTS[r.liquidityTokenMint];
    const supplyApy = parseFloat(r.supplyApy) * 100; // decimal → percentage
    const borrowApy = parseFloat(r.borrowApy) * 100;
    const totalSupply = parseFloat(r.totalSupply);
    const totalBorrow = parseFloat(r.totalBorrow);
    const totalSupplyUSD = parseFloat(r.totalSupplyUsd);
    const totalBorrowUSD = parseFloat(r.totalBorrowUsd);
    const ltv = parseFloat(r.maxLtv);
    const liquidationThreshold = r.liquidationLtv
      ? parseFloat(r.liquidationLtv)
      : Math.min(ltv + 0.05, 0.95);
    const utilization = totalSupplyUSD > 0 ? totalBorrowUSD / totalSupplyUSD : 0;

    return {
      id: `kamino-${r.reserve}`,
      protocol: 'kamino' as const,
      asset: r.liquidityToken,
      assetMint: r.liquidityTokenMint,
      assetDecimals: mintInfo?.decimals ?? 9,
      supplyAPY: supplyApy,
      borrowAPY: borrowApy,
      totalSupply,
      totalSupplyUSD,
      totalBorrow,
      totalBorrowUSD,
      utilization,
      ltv,
      liquidationThreshold,
      protocolName: PROTOCOL_DISPLAY.kamino.name,
      protocolColor: PROTOCOL_DISPLAY.kamino.color,
      reserveAddress: r.reserve,
    };
  });
}
