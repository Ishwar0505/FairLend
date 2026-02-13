import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/lib/utils';

export function WalletButton() {
  const { connected, address, connect, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      if (connected) {
        disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-indigo-600 rounded-full px-4 py-2">
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  if (connected && address) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-surface-light rounded-full px-4 py-2 flex-row items-center"
      >
        <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
        <Text className="text-white text-sm font-medium">
          {truncateAddress(address)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-indigo-600 rounded-full px-4 py-2"
    >
      <Text className="text-white text-sm font-semibold">Connect Wallet</Text>
    </TouchableOpacity>
  );
}
