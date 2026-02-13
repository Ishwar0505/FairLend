import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PositionCard } from '@/components/portfolio/PositionCard';
import { WalletButton } from '@/components/wallet/WalletButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatUSD } from '@/lib/utils';

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View className="flex-1 bg-surface-light rounded-2xl p-4 items-center">
      <Text className="text-xs text-slate-400">{label}</Text>
      <Text className={`text-xl font-bold mt-1 ${color ?? 'text-white'}`}>
        {value}
      </Text>
    </View>
  );
}

export default function PortfolioScreen() {
  const router = useRouter();
  const { connected } = useWallet();
  const {
    positions,
    deposits,
    borrows,
    totalDeposited,
    totalBorrowed,
    netWorth,
    isLoading,
    refetch,
  } = usePortfolio();

  // Not connected state
  if (!connected) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Portfolio</Text>
            <Text className="text-sm text-slate-400 mt-1">
              Your lending positions
            </Text>
          </View>
          <WalletButton />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="wallet-outline" size={48} color="#64748b" />
          <Text className="text-lg text-white font-semibold text-center mt-4">
            Connect your wallet
          </Text>
          <Text className="text-sm text-slate-400 text-center mt-2">
            Connect a Solana wallet to view your lending positions across all
            protocols.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Portfolio</Text>
            <Text className="text-sm text-slate-400 mt-1">
              Your lending positions
            </Text>
          </View>
          <WalletButton />
        </View>

        {/* Summary cards */}
        {isLoading ? (
          <View className="flex-row px-4 mt-4 gap-3">
            <View className="flex-1">
              <Skeleton height={80} borderRadius={16} />
            </View>
            <View className="flex-1">
              <Skeleton height={80} borderRadius={16} />
            </View>
            <View className="flex-1">
              <Skeleton height={80} borderRadius={16} />
            </View>
          </View>
        ) : (
          <View className="flex-row px-4 mt-4 gap-3">
            <SummaryCard
              label="Net Worth"
              value={formatUSD(netWorth)}
              color="text-white"
            />
            <SummaryCard
              label="Deposited"
              value={formatUSD(totalDeposited)}
              color="text-success"
            />
            <SummaryCard
              label="Borrowed"
              value={formatUSD(totalBorrowed)}
              color="text-warning"
            />
          </View>
        )}

        {/* Positions */}
        <View className="px-4 mt-6">
          {positions.length === 0 ? (
            <View className="bg-surface-light rounded-2xl p-8 items-center mt-2">
              <Ionicons name="layers-outline" size={48} color="#64748b" />
              <Text className="text-lg text-white font-semibold text-center mt-4">
                No positions yet
              </Text>
              <Text className="text-sm text-slate-400 text-center mt-2">
                Deposit into a lending market to start earning yield.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/markets')}
                className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Browse Markets</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Deposits section */}
              {deposits.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-slate-300 mb-2">
                    Deposits ({deposits.length})
                  </Text>
                  {deposits.map((position) => (
                    <PositionCard key={position.id} position={position} />
                  ))}
                </View>
              )}

              {/* Borrows section */}
              {borrows.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-slate-300 mb-2">
                    Borrows ({borrows.length})
                  </Text>
                  {borrows.map((position) => (
                    <PositionCard key={position.id} position={position} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
