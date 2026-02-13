import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarkets } from '@/hooks/useMarkets';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatUSD } from '@/lib/utils';

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-surface-lighter">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className={`text-sm font-semibold ${color ?? 'text-white'}`}>
        {value}
      </Text>
    </View>
  );
}

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: markets, isLoading } = useMarkets();

  const market = markets?.find((m) => m.id === id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-4 pt-4">
          <Skeleton width={200} height={24} />
          <Skeleton width={120} height={16} className="mt-3" />
          <View className="mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={44} className="mt-2" />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!market) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-lg text-white font-semibold mt-4">
          Market not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#60a5fa" />
            <Text className="text-primary-400 ml-2 text-sm">Markets</Text>
          </Pressable>

          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-surface-light items-center justify-center">
              <Text className="text-xl font-bold text-white">
                {market.asset.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">
                {market.asset}
              </Text>
              <Badge
                label={market.protocolName}
                color={market.protocolColor}
                className="mt-1 self-start"
              />
            </View>
          </View>
        </View>

        {/* APY highlight cards */}
        <View className="flex-row px-4 mt-4 gap-3">
          <View className="flex-1 bg-surface-light rounded-2xl p-4 items-center">
            <Text className="text-xs text-slate-400">Supply APY</Text>
            <Text className="text-2xl font-bold text-success mt-1">
              {market.supplyAPY.toFixed(2)}%
            </Text>
          </View>
          <View className="flex-1 bg-surface-light rounded-2xl p-4 items-center">
            <Text className="text-xs text-slate-400">Borrow APY</Text>
            <Text className="text-2xl font-bold text-warning mt-1">
              {market.borrowAPY.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-4 mt-6">
          <Text className="text-sm font-semibold text-slate-300 mb-2">
            Market Details
          </Text>
          <View className="bg-surface-light rounded-2xl px-4">
            <StatRow
              label="Total Supply"
              value={formatUSD(market.totalSupplyUSD)}
            />
            <StatRow
              label="Total Borrow"
              value={formatUSD(market.totalBorrowUSD)}
            />
            <StatRow
              label="Utilization"
              value={`${(market.utilization * 100).toFixed(1)}%`}
            />
            <StatRow
              label="LTV"
              value={market.ltv > 0 ? `${(market.ltv * 100).toFixed(0)}%` : '—'}
            />
            <StatRow
              label="Liquidation Threshold"
              value={
                market.liquidationThreshold > 0
                  ? `${(market.liquidationThreshold * 100).toFixed(0)}%`
                  : '—'
              }
            />
            <StatRow
              label="Protocol"
              value={market.protocolName}
              color={`text-white`}
            />
          </View>
        </View>

        {/* Action buttons */}
        <View className="px-4 mt-6 gap-3">
          <Button
            title="Deposit"
            onPress={() =>
              router.push({
                pathname: '/deposit/[protocol]',
                params: { protocol: market.protocol, marketId: market.id },
              })
            }
            size="lg"
          />
          <Button
            title="Borrow"
            onPress={() =>
              router.push({
                pathname: '/borrow/[protocol]',
                params: { protocol: market.protocol, marketId: market.id },
              })
            }
            variant="secondary"
            size="lg"
          />
        </View>

        {/* Manage position buttons */}
        <View className="px-4 mt-3 mb-8 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Withdraw"
                onPress={() =>
                  router.push({
                    pathname: '/withdraw/[protocol]',
                    params: { protocol: market.protocol, marketId: market.id },
                  })
                }
                variant="ghost"
                size="md"
              />
            </View>
            <View className="flex-1">
              <Button
                title="Repay"
                onPress={() =>
                  router.push({
                    pathname: '/repay/[protocol]',
                    params: { protocol: market.protocol, marketId: market.id },
                  })
                }
                variant="ghost"
                size="md"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
