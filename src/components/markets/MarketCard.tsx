import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatUSD } from '@/lib/utils';
import type { UnifiedMarket } from '@/lib/types';

interface MarketCardProps {
  market: UnifiedMarket;
  onPress: () => void;
}

export function MarketCard({ market, onPress }: MarketCardProps) {
  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-surface-lighter items-center justify-center mr-3">
            <Text className="text-lg font-bold text-white">
              {market.asset.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-white">
                {market.asset}
              </Text>
              <Badge
                label={market.protocolName}
                color={market.protocolColor}
              />
            </View>
            <Text className="text-xs text-slate-400 mt-0.5">
              TVL {formatUSD(market.totalSupplyUSD)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-slate-400">Supply</Text>
            <Text className="text-sm font-semibold text-success">
              {market.supplyAPY.toFixed(2)}%
            </Text>
          </View>
          <View className="flex-row items-center gap-1 mt-1">
            <Text className="text-xs text-slate-400">Borrow</Text>
            <Text className="text-sm font-semibold text-warning">
              {market.borrowAPY.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
