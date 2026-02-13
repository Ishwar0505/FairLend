import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Network = 'mainnet-beta' | 'devnet';
type Theme = 'light' | 'dark' | 'system';

interface SettingsStore {
  network: Network;
  customRpcUrl: string | null;
  theme: Theme;

  setNetwork: (network: Network) => void;
  setCustomRpcUrl: (url: string | null) => void;
  setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      network: 'mainnet-beta',
      customRpcUrl: null,
      theme: 'dark',

      setNetwork: (network) => set({ network }),
      setCustomRpcUrl: (url) => set({ customRpcUrl: url }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'fairlend-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
