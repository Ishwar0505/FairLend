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
