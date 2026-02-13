import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProtocolId } from '@/lib/constants';

interface WalletStore {
  // Connection state
  connected: boolean;
  address: string | null;
  authToken: string | null;
  balance: number; // SOL balance in lamports

  // Preferences
  preferredProtocol: ProtocolId | null;

  // Actions
  setConnected: (address: string, authToken?: string) => void;
  setDisconnected: () => void;
  setBalance: (balance: number) => void;
  setAuthToken: (token: string) => void;
  setPreferredProtocol: (protocol: ProtocolId) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      connected: false,
      address: null,
      authToken: null,
      balance: 0,
      preferredProtocol: null,

      setConnected: (address: string, authToken?: string) =>
        set({
          connected: true,
          address,
          authToken: authToken ?? null,
        }),

      setDisconnected: () =>
        set({
          connected: false,
          address: null,
          authToken: null,
          balance: 0,
        }),

      setBalance: (balance: number) =>
        set({ balance }),

      setAuthToken: (token: string) =>
        set({ authToken: token }),

      setPreferredProtocol: (protocol: ProtocolId) =>
        set({ preferredProtocol: protocol }),
    }),
    {
      name: 'fairlend-wallet',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        authToken: state.authToken,
        preferredProtocol: state.preferredProtocol,
      }),
    },
  ),
);
