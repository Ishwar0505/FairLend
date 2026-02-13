import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';

export function MarketSkeleton() {
  return (
    <View className="bg-surface-light rounded-2xl p-4 mb-3">
      <View className="flex-row items-center">
        <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
        <View className="flex-1">
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} className="mt-2" />
        </View>
        <View className="items-end">
          <Skeleton width={70} height={14} />
          <Skeleton width={70} height={14} className="mt-2" />
        </View>
      </View>
    </View>
  );
}
