# Skill: Protocol Integration Patterns for FairLend

> Read this file before writing any protocol SDK integration code.

---

## Unified Types (Always use these in components/hooks)

```typescript
// src/lib/types.ts

export type Protocol = 'kamino' | 'solend' | 'marginfi';

export interface UnifiedMarket {
  id: string;                    // `${protocol}-${assetMint}`
  protocol: Protocol;
  asset: string;                 // "SOL", "USDC"
  assetMint: string;
  assetDecimals: number;
  assetIcon?: string;
  supplyAPY: number;             // As percentage: 5.25 means 5.25%
  borrowAPY: number;
  totalSupply: number;           // Human-readable (not lamports)
  totalSupplyUSD: number;
  totalBorrow: number;
  totalBorrowUSD: number;
  utilization: number;           // 0 to 1
  ltv: number;                   // 0 to 1
  liquidationThreshold: number;  // 0 to 1
  protocolName: string;          // "Kamino", "Save", "marginfi"
  reserveAddress: string;        // On-chain account address
}

export interface UnifiedPosition {
  id: string;
  protocol: Protocol;
  type: 'deposit' | 'borrow';
  asset: string;
  assetMint: string;
  assetDecimals: number;
  amount: number;                // Human-readable
  amountUSD: number;
  apy: number;
  healthFactor?: number;         // Only for borrow positions
  reserveAddress: string;
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}
```

---

## Kamino SDK Integration Pattern

```typescript
// src/services/kamino/index.ts

import { KaminoMarket, KaminoAction, VanillaObligation, PROGRAM_ID } from '@kamino-finance/klend-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { UnifiedMarket, UnifiedPosition } from '@/lib/types';

const KAMINO_MAIN_MARKET = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';

export class KaminoService {
  private market: KaminoMarket | null = null;

  constructor(private connection: Connection) {}

  async initialize(): Promise<void> {
    this.market = await KaminoMarket.load(
      this.connection,
      new PublicKey(KAMINO_MAIN_MARKET)
    );
  }

  async getMarkets(): Promise<UnifiedMarket[]> {
    if (!this.market) await this.initialize();
    await this.market!.loadReserves();
    
    return this.market!.reserves.map(reserve => ({
      id: `kamino-${reserve.address.toBase58()}`,
      protocol: 'kamino',
      asset: reserve.getTokenSymbol(),
      assetMint: reserve.getLiquidityMint().toBase58(),
      assetDecimals: reserve.getMintDecimals(),
      supplyAPY: reserve.calculateSupplyAPY() * 100,
      borrowAPY: reserve.calculateBorrowAPY() * 100,
      totalSupply: reserve.getTotalSupply(),
      totalSupplyUSD: reserve.getTotalSupplyUSD(),
      totalBorrow: reserve.getTotalBorrow(),
      totalBorrowUSD: reserve.getTotalBorrowUSD(),
      utilization: reserve.calculateUtilizationRatio(),
      ltv: reserve.config.loanToValueRatio / 100,
      liquidationThreshold: reserve.config.liquidationThreshold / 100,
      protocolName: 'Kamino',
      reserveAddress: reserve.address.toBase58(),
    }));
  }

  async getPositions(walletAddress: string): Promise<UnifiedPosition[]> {
    if (!this.market) await this.initialize();
    const wallet = new PublicKey(walletAddress);
    const obligation = await this.market!.getObligationByWallet(
      wallet,
      new VanillaObligation(PROGRAM_ID)
    );
    if (!obligation) return [];

    const positions: UnifiedPosition[] = [];
    // Map deposits and borrows to UnifiedPosition...
    return positions;
  }

  async buildDepositTx(amount: number, assetMint: string, walletAddress: string) {
    if (!this.market) await this.initialize();
    const action = await KaminoAction.buildDepositTxns(
      this.market!,
      new BN(amount),
      new PublicKey(assetMint),
      new PublicKey(walletAddress),
      new VanillaObligation(PROGRAM_ID)
    );
    return action;
  }

  async buildBorrowTx(amount: number, assetMint: string, walletAddress: string) {
    if (!this.market) await this.initialize();
    const action = await KaminoAction.buildBorrowTxns(
      this.market!,
      new BN(amount),
      new PublicKey(assetMint),
      new PublicKey(walletAddress),
      new VanillaObligation(PROGRAM_ID)
    );
    return action;
  }
}
```

---

## Solend SDK Integration Pattern

```typescript
// src/services/solend/index.ts

import { SolendMarket, SolendAction } from '@solendprotocol/solend-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { UnifiedMarket, UnifiedPosition } from '@/lib/types';

export class SolendService {
  private market: SolendMarket | null = null;

  constructor(private connection: Connection) {}

  async initialize(): Promise<void> {
    this.market = await SolendMarket.initialize(
      this.connection,
      'production'
    );
  }

  async getMarkets(): Promise<UnifiedMarket[]> {
    if (!this.market) await this.initialize();
    await this.market!.loadReserves();

    return this.market!.reserves.map(reserve => ({
      id: `solend-${reserve.config.mintAddress}`,
      protocol: 'solend',
      asset: reserve.config.symbol,
      assetMint: reserve.config.mintAddress,
      assetDecimals: reserve.config.decimals,
      supplyAPY: (reserve.stats?.supplyInterestAPY || 0) * 100,
      borrowAPY: (reserve.stats?.borrowInterestAPY || 0) * 100,
      totalSupply: Number(reserve.stats?.totalDepositsWads || 0) / 1e18,
      totalSupplyUSD: 0, // Calculate from price
      totalBorrow: Number(reserve.stats?.totalBorrowsWads || 0) / 1e18,
      totalBorrowUSD: 0,
      utilization: reserve.stats?.utilizationRatio || 0,
      ltv: reserve.config.loanToValueRatio / 100,
      liquidationThreshold: reserve.config.liquidationThreshold / 100,
      protocolName: 'Save',
      reserveAddress: reserve.config.address,
    }));
  }

  async buildDepositTx(
    amount: number,
    symbol: string,
    walletAddress: string
  ) {
    const action = await SolendAction.buildDepositTxns(
      this.connection,
      amount,
      symbol,
      new PublicKey(walletAddress),
      'production'
    );
    return action;
  }

  async buildBorrowTx(
    amount: number,
    symbol: string,
    walletAddress: string
  ) {
    const action = await SolendAction.buildBorrowTxns(
      this.connection,
      amount,
      symbol,
      new PublicKey(walletAddress),
      'production'
    );
    return action;
  }
}
```

---

## marginfi SDK Integration Pattern

```typescript
// src/services/marginfi/index.ts

import { Connection, PublicKey } from '@solana/web3.js';
import { MarginfiClient, getConfig } from '@mrgnlabs/marginfi-client-v2';
import { UnifiedMarket, UnifiedPosition } from '@/lib/types';

export class MarginfiService {
  private client: MarginfiClient | null = null;

  constructor(private connection: Connection) {}

  async initialize(wallet: any): Promise<void> {
    const config = getConfig('production');
    this.client = await MarginfiClient.fetch(config, wallet, this.connection);
  }

  async getMarkets(): Promise<UnifiedMarket[]> {
    if (!this.client) throw new Error('marginfi client not initialized');

    const banks = this.client.banks;
    return Array.from(banks.values()).map(bank => ({
      id: `marginfi-${bank.address.toBase58()}`,
      protocol: 'marginfi',
      asset: bank.tokenSymbol || 'Unknown',
      assetMint: bank.mint.toBase58(),
      assetDecimals: bank.mintDecimals,
      supplyAPY: bank.computeInterestRates().lendingRate.toNumber() * 100,
      borrowAPY: bank.computeInterestRates().borrowingRate.toNumber() * 100,
      totalSupply: bank.computeAssetUsdValue(
        bank.totalAssetShares
      ).toNumber(),
      totalSupplyUSD: 0,
      totalBorrow: bank.computeLiabilityUsdValue(
        bank.totalLiabilityShares
      ).toNumber(),
      totalBorrowUSD: 0,
      utilization: bank.computeUtilizationRate().toNumber(),
      ltv: bank.config.assetWeightInit.toNumber(),
      liquidationThreshold: bank.config.liabilityWeightInit.toNumber(),
      protocolName: 'marginfi',
      reserveAddress: bank.address.toBase58(),
    }));
  }

  async deposit(bankAddress: string, amount: number) {
    if (!this.client) throw new Error('Not initialized');
    const accounts = await this.client.getMarginfiAccountsForAuthority();
    let account = accounts[0];
    if (!account) {
      account = await this.client.createMarginfiAccount();
    }
    return await account.deposit(amount, new PublicKey(bankAddress));
  }

  async borrow(bankAddress: string, amount: number) {
    if (!this.client) throw new Error('Not initialized');
    const accounts = await this.client.getMarginfiAccountsForAuthority();
    const account = accounts[0];
    if (!account) throw new Error('No marginfi account found');
    return await account.borrow(amount, new PublicKey(bankAddress));
  }
}
```

---

## Aggregator Pattern

```typescript
// src/services/aggregator.ts

import { Connection } from '@solana/web3.js';
import { KaminoService } from './kamino';
import { SolendService } from './solend';
import { MarginfiService } from './marginfi';
import { UnifiedMarket, UnifiedPosition, Protocol } from '@/lib/types';

export class LendingAggregator {
  private kamino: KaminoService;
  private solend: SolendService;
  private marginfi: MarginfiService;

  constructor(connection: Connection) {
    this.kamino = new KaminoService(connection);
    this.solend = new SolendService(connection);
    this.marginfi = new MarginfiService(connection);
  }

  async getAllMarkets(): Promise<UnifiedMarket[]> {
    const results = await Promise.allSettled([
      this.kamino.getMarkets(),
      this.solend.getMarkets(),
      this.marginfi.getMarkets(),
    ]);

    // Collect successful results, log failures
    return results
      .filter((r): r is PromiseFulfilledResult<UnifiedMarket[]> => 
        r.status === 'fulfilled'
      )
      .flatMap(r => r.value);
  }

  async getAllPositions(wallet: string): Promise<UnifiedPosition[]> {
    const results = await Promise.allSettled([
      this.kamino.getPositions(wallet),
      this.solend.getPositions(wallet),
      this.marginfi.getPositions(wallet),
    ]);

    return results
      .filter((r): r is PromiseFulfilledResult<UnifiedPosition[]> =>
        r.status === 'fulfilled'
      )
      .flatMap(r => r.value);
  }

  // Get best rate for a specific asset across all protocols
  getBestSupplyRate(markets: UnifiedMarket[], assetMint: string): UnifiedMarket | null {
    return markets
      .filter(m => m.assetMint === assetMint)
      .sort((a, b) => b.supplyAPY - a.supplyAPY)[0] || null;
  }

  getBestBorrowRate(markets: UnifiedMarket[], assetMint: string): UnifiedMarket | null {
    return markets
      .filter(m => m.assetMint === assetMint)
      .sort((a, b) => a.borrowAPY - b.borrowAPY)[0] || null;
  }
}
```

**Key Pattern: Always use `Promise.allSettled`** — if one protocol SDK fails, the others still return data. Never let one broken integration break the whole app.

---

## Error Handling per Protocol

```typescript
export function parseProtocolError(protocol: Protocol, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  // Common errors
  if (message.includes('User rejected')) return 'Transaction cancelled';
  if (message.includes('insufficient funds')) return 'Insufficient balance';
  if (message.includes('Blockhash not found')) return 'Transaction expired, try again';

  // Protocol-specific
  switch (protocol) {
    case 'kamino':
      if (message.includes('obligation')) return 'No active Kamino account found';
      break;
    case 'solend':
      if (message.includes('borrow limit')) return 'Borrow limit reached on Save';
      break;
    case 'marginfi':
      if (message.includes('health')) return 'Position would be unhealthy';
      break;
  }

  return `Transaction failed: ${message.slice(0, 100)}`;
}
```

---

## Amount Conversion Helpers

```typescript
// Always use these — never do manual decimal math

export function toBaseUnits(amount: number, decimals: number): number {
  return Math.round(amount * 10 ** decimals);
}

export function fromBaseUnits(amount: number, decimals: number): number {
  return amount / 10 ** decimals;
}

export function formatAmount(amount: number, decimals: number = 4): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
```
