import Constants from 'expo-constants';

const env = Constants.expoConfig?.extra ?? {};

export const SOLANA_RPC_URL =
  process.env.EXPO_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

export const SOLANA_NETWORK =
  (process.env.EXPO_PUBLIC_SOLANA_NETWORK as 'mainnet-beta' | 'devnet') ?? 'mainnet-beta';

export const KAMINO_MAIN_MARKET =
  process.env.EXPO_PUBLIC_KAMINO_MARKET ?? '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';

export const MARGINFI_PROGRAM =
  process.env.EXPO_PUBLIC_MARGINFI_PROGRAM ?? 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA';

export const COINGECKO_API_KEY =
  process.env.EXPO_PUBLIC_COINGECKO_API_KEY ?? '';

export const PROTOCOLS = ['kamino', 'solend', 'marginfi'] as const;
export type ProtocolId = (typeof PROTOCOLS)[number];

export const PROTOCOL_DISPLAY: Record<ProtocolId, { name: string; color: string }> = {
  kamino: { name: 'Kamino', color: '#6366f1' },
  solend: { name: 'Save (Solend)', color: '#14b8a6' },
  marginfi: { name: 'marginfi', color: '#f97316' },
};

export const EXPLORER_URL = 'https://solscan.io';

// Common Solana token mints
export const TOKEN_MINTS: Record<string, { symbol: string; decimals: number; coingeckoId: string }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9, coingeckoId: 'solana' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6, coingeckoId: 'usd-coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', decimals: 6, coingeckoId: 'tether' },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', decimals: 9, coingeckoId: 'msol' },
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': { symbol: 'stSOL', decimals: 9, coingeckoId: 'lido-staked-sol' },
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': { symbol: 'JitoSOL', decimals: 9, coingeckoId: 'jito-staked-sol' },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': { symbol: 'bSOL', decimals: 9, coingeckoId: 'blazestake-staked-sol' },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'ETH', decimals: 8, coingeckoId: 'ethereum' },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': { symbol: 'wBTC', decimals: 8, coingeckoId: 'bitcoin' },
};

// DeFi Llama project identifiers
export const DEFI_LLAMA_PROJECTS: Record<ProtocolId, string> = {
  kamino: 'kamino-lend',
  solend: 'save',        // Solend rebranded to "Save" — DeFi Llama uses 'save'
  marginfi: 'marginfi',  // Not currently in DeFi Llama yields API
};
