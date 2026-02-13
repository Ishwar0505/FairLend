import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWalletStore } from '@/stores/walletStore';

export default function PortfolioScreen() {
  const { connected } = useWalletStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">Portfolio</Text>
        <Text className="text-sm text-slate-400 mt-1">
          Your lending positions
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {connected ? (
          <View className="items-center">
            <Text className="text-4xl mb-4">💼</Text>
            <Text className="text-lg text-white font-semibold text-center">
              No positions yet
            </Text>
            <Text className="text-sm text-slate-400 text-center mt-2">
              Deposit into a lending market to start earning yield.
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-4xl mb-4">🔒</Text>
            <Text className="text-lg text-white font-semibold text-center">
              Connect your wallet
            </Text>
            <Text className="text-sm text-slate-400 text-center mt-2">
              Connect a Solana wallet to view your lending positions.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
