import type { ProtocolId } from './constants';

export interface UnifiedMarket {
  id: string;
  protocol: ProtocolId;
  asset: string;
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
  protocolName: string;
  protocolColor: string;
  reserveAddress: string;
}

export interface UnifiedPosition {
  id: string;
  protocol: ProtocolId;
  type: 'deposit' | 'borrow';
  asset: string;
  assetMint: string;
  amount: number;
  amountUSD: number;
  apy: number;
  earnings: number;
  healthFactor?: number;
}

export interface UnifiedAction {
  protocol: ProtocolId;
  type: 'deposit' | 'borrow' | 'withdraw' | 'repay';
  asset: string;
  assetMint: string;
  amount: number;
  reserveAddress: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  authToken: string | null;
  balance: number;
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export interface PriceData {
  [mint: string]: {
    usd: number;
    change24h: number;
  };
}
