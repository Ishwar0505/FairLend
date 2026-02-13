import type { ProtocolId } from './constants';

export interface UnifiedMarket {
  id: string;
  protocol: ProtocolId;
  asset: string;
  assetMint: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
  totalBorrow: number;
  utilization: number;
  ltv: number;
  liquidationThreshold: number;
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
  publicKey: string | null;
  authToken: string | null;
}

export interface PriceData {
  [mint: string]: {
    usd: number;
    change24h: number;
  };
}
