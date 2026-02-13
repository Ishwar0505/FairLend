import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProtocolId } from '@/lib/constants';

interface WalletStore {
  // Connection state
  connected: boolean;
  publicKey: string | null;
  authToken: string | null;

  // Preferences
  preferredProtocol: ProtocolId | null;

  // Actions
  connect: (publicKey: string, authToken?: string) => void;
  disconnect: () => void;
  setAuthToken: (token: string) => void;
  setPreferredProtocol: (protocol: ProtocolId) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      connected: false,
      publicKey: null,
      authToken: null,
      preferredProtocol: null,

      connect: (publicKey: string, authToken?: string) =>
        set({
          connected: true,
          publicKey,
          authToken: authToken ?? null,
        }),

      disconnect: () =>
        set({
          connected: false,
          publicKey: null,
          authToken: null,
        }),

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
