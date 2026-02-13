import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWalletStore } from '@/stores/walletStore';
import { truncateAddress } from '@/lib/utils';

export default function SettingsScreen() {
  const { network, setNetwork, theme, setTheme } = useSettingsStore();
  const { connected, address, setDisconnected } = useWalletStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">Settings</Text>
      </View>

      <View className="px-4 mt-4 gap-4">
        {/* Wallet Section */}
        <View className="bg-surface-light rounded-2xl p-4">
          <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">
            Wallet
          </Text>
          {connected && address ? (
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white font-medium">Connected</Text>
                <Text className="text-sm text-primary-400 mt-0.5">
                  {truncateAddress(address)}
                </Text>
              </View>
              <Pressable
                onPress={setDisconnected}
                className="bg-danger/20 px-4 py-2 rounded-xl"
              >
                <Text className="text-danger font-medium text-sm">
                  Disconnect
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text className="text-slate-400">No wallet connected</Text>
          )}
        </View>

        {/* Network Section */}
        <View className="bg-surface-light rounded-2xl p-4">
          <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">
            Network
          </Text>
          <View className="flex-row gap-2">
            {(['mainnet-beta', 'devnet'] as const).map((net) => (
              <Pressable
                key={net}
                onPress={() => setNetwork(net)}
                className={`px-4 py-2 rounded-xl ${
                  network === net ? 'bg-primary-600' : 'bg-surface-lighter'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    network === net ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {net === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Theme Section */}
        <View className="bg-surface-light rounded-2xl p-4">
          <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">
            Theme
          </Text>
          <View className="flex-row gap-2">
            {(['dark', 'light', 'system'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTheme(t)}
                className={`px-4 py-2 rounded-xl ${
                  theme === t ? 'bg-primary-600' : 'bg-surface-lighter'
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    theme === t ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View className="bg-surface-light rounded-2xl p-4">
          <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">
            About
          </Text>
          <Text className="text-white font-medium">FairLend</Text>
          <Text className="text-sm text-slate-400 mt-1">
            Version 1.0.0
          </Text>
          <Text className="text-xs text-slate-500 mt-2">
            Solana Lending Aggregator — Kamino, Save, marginfi
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
