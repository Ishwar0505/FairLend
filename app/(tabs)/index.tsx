import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWalletStore } from '@/stores/walletStore';
import { truncateAddress } from '@/lib/utils';

export default function HomeScreen() {
  const { connected, publicKey } = useWalletStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">FairLend</Text>
        <Text className="text-sm text-slate-400 mt-1">
          Solana Lending Aggregator
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {connected && publicKey ? (
          <View className="items-center">
            <Text className="text-lg text-white font-semibold">
              Welcome back
            </Text>
            <Text className="text-sm text-primary-400 mt-1">
              {truncateAddress(publicKey)}
            </Text>
            <View className="mt-8 w-full">
              <View className="bg-surface-light rounded-2xl p-6 items-center">
                <Text className="text-slate-400 text-sm">Net Worth</Text>
                <Text className="text-3xl font-bold text-white mt-2">
                  $0.00
                </Text>
                <Text className="text-xs text-slate-500 mt-1">
                  Connect positions to see your portfolio
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-5xl mb-4">🏦</Text>
            <Text className="text-xl font-bold text-white text-center">
              All Solana lending in one place
            </Text>
            <Text className="text-sm text-slate-400 text-center mt-2 px-4">
              Compare rates across Kamino, Save, and marginfi.
              Connect your wallet to get started.
            </Text>
            <View className="flex-row mt-6 gap-3">
              <View className="bg-kamino/20 px-3 py-1.5 rounded-full">
                <Text className="text-kamino text-xs font-medium">Kamino</Text>
              </View>
              <View className="bg-solend/20 px-3 py-1.5 rounded-full">
                <Text className="text-solend text-xs font-medium">Save</Text>
              </View>
              <View className="bg-marginfi/20 px-3 py-1.5 rounded-full">
                <Text className="text-marginfi text-xs font-medium">marginfi</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
