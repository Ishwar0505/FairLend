import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MarketsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">Markets</Text>
        <Text className="text-sm text-slate-400 mt-1">
          Compare lending rates across protocols
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl mb-4">📊</Text>
        <Text className="text-lg text-white font-semibold text-center">
          Markets coming soon
        </Text>
        <Text className="text-sm text-slate-400 text-center mt-2">
          Browse and compare supply/borrow APYs across Kamino, Save, and marginfi.
        </Text>
      </View>
    </SafeAreaView>
  );
}
