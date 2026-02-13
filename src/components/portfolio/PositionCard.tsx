import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatUSD } from '@/lib/utils';
import { PROTOCOL_DISPLAY } from '@/lib/constants';
import { healthFactorColor } from '@/lib/utils';
import type { UnifiedPosition } from '@/lib/types';

interface PositionCardProps {
  position: UnifiedPosition;
  onPress?: () => void;
  onAction?: () => void;
}

export function PositionCard({ position, onPress, onAction }: PositionCardProps) {
  const display = PROTOCOL_DISPLAY[position.protocol];
  const isDeposit = position.type === 'deposit';

  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-surface-lighter items-center justify-center mr-3">
            <Text className="text-lg font-bold text-white">
              {position.asset.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-white">
                {position.asset}
              </Text>
              <Badge label={display.name} color={display.color} />
            </View>
            <Text
              className={`text-xs mt-0.5 ${isDeposit ? 'text-success' : 'text-warning'}`}
            >
              {isDeposit ? 'Deposited' : 'Borrowed'}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-sm font-semibold text-white">
            {formatUSD(position.amountUSD)}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${isDeposit ? 'text-success' : 'text-warning'}`}
          >
            {position.apy.toFixed(2)}% APY
          </Text>
          {position.healthFactor != null && (
            <Text
              className="text-xs mt-0.5 font-medium"
              style={{ color: healthFactorColor(position.healthFactor) }}
            >
              HF {position.healthFactor.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {/* Quick action button */}
      {onAction && (
        <Pressable
          onPress={onAction}
          className={`mt-3 py-2 rounded-xl items-center ${
            isDeposit ? 'bg-surface-lighter' : 'bg-warning/10'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              isDeposit ? 'text-white' : 'text-warning'
            }`}
          >
            {isDeposit ? 'Withdraw' : 'Repay'}
          </Text>
        </Pressable>
      )}
    </Card>
  );
}
