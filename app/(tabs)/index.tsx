import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import { useMarkets } from '@/hooks/useMarkets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { WalletButton } from '@/components/wallet/WalletButton';
import { MarketCard } from '@/components/markets/MarketCard';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';
import { Badge } from '@/components/ui/Badge';
import { truncateAddress, formatUSD } from '@/lib/utils';
import type { UnifiedMarket } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { connected, address } = useWallet();
  const { data: markets, isLoading } = useMarkets();
  const { netWorth, positions, totalDeposited, totalBorrowed } = usePortfolio();

  // Top 5 by supply APY
  const topSupply = markets
    ? [...markets].sort((a, b) => b.supplyAPY - a.supplyAPY).slice(0, 5)
    : [];

  const handleMarketPress = (market: UnifiedMarket) => {
    router.push({ pathname: '/market/[id]', params: { id: market.id } });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">FairLend</Text>
            <Text className="text-sm text-slate-400 mt-1">
              Solana Lending Aggregator
            </Text>
          </View>
          <WalletButton />
        </View>

        {connected && address ? (
          <Pressable
            className="px-4 mt-4"
            onPress={() => router.push('/(tabs)/portfolio')}
          >
            <View className="bg-surface-light rounded-2xl p-5">
              <Text className="text-slate-400 text-xs">Connected Wallet</Text>
              <Text className="text-primary-400 text-sm font-medium mt-1">
                {truncateAddress(address)}
              </Text>
              <View className="flex-row mt-4 gap-3">
                <View className="flex-1 items-center">
                  <Text className="text-slate-400 text-xs">Net Worth</Text>
                  <Text className="text-xl font-bold text-white mt-1">
                    {formatUSD(netWorth)}
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-slate-400 text-xs">Deposited</Text>
                  <Text className="text-xl font-bold text-success mt-1">
                    {formatUSD(totalDeposited)}
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-slate-400 text-xs">Borrowed</Text>
                  <Text className="text-xl font-bold text-warning mt-1">
                    {formatUSD(totalBorrowed)}
                  </Text>
                </View>
              </View>
              {positions.length > 0 && (
                <Text className="text-xs text-slate-500 text-center mt-3">
                  {positions.length} position{positions.length !== 1 ? 's' : ''} across protocols
                </Text>
              )}
            </View>
          </Pressable>
        ) : (
          <View className="px-4 mt-4">
            <View className="bg-surface-light rounded-2xl p-6 items-center">
              <Text className="text-xl font-bold text-white text-center">
                All Solana lending in one place
              </Text>
              <Text className="text-sm text-slate-400 text-center mt-2 px-4">
                Compare rates across Kamino, Save, and marginfi.
                Connect your wallet to get started.
              </Text>
              <View className="flex-row mt-4 gap-3">
                <Badge label="Kamino" color="#6366f1" />
                <Badge label="Save" color="#14b8a6" />
                <Badge label="marginfi" color="#f97316" />
              </View>
            </View>
          </View>
        )}

        {/* Top rates */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-white">
              Top Supply Rates
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/markets')}>
              <Text className="text-sm text-primary-400">View all</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <MarketSkeleton key={i} />
              ))}
            </>
          ) : topSupply.length > 0 ? (
            topSupply.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onPress={() => handleMarketPress(market)}
              />
            ))
          ) : (
            <View className="bg-surface-light rounded-2xl p-6 items-center">
              <Text className="text-sm text-slate-400">
                No market data available
              </Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
