import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCard } from '@/components/markets/MarketCard';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';
import type { UnifiedMarket } from '@/lib/types';
import type { ProtocolId } from '@/lib/constants';

type SortKey = 'supplyAPY' | 'borrowAPY' | 'totalSupplyUSD';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'supplyAPY', label: 'Supply APY' },
  { key: 'borrowAPY', label: 'Borrow APY' },
  { key: 'totalSupplyUSD', label: 'TVL' },
];

const PROTOCOL_FILTERS: { key: ProtocolId | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'kamino', label: 'Kamino' },
  { key: 'solend', label: 'Save' },
  { key: 'marginfi', label: 'marginfi' },
];

export default function MarketsScreen() {
  const router = useRouter();
  const { data: markets, isLoading, isError, refetch } = useMarkets();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('supplyAPY');
  const [protocolFilter, setProtocolFilter] = useState<ProtocolId | 'all'>('all');

  const filtered = useMemo(() => {
    if (!markets) return [];

    let result = markets;

    // Filter by protocol
    if (protocolFilter !== 'all') {
      result = result.filter((m) => m.protocol === protocolFilter);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.asset.toLowerCase().includes(q) ||
          m.protocolName.toLowerCase().includes(q),
      );
    }

    // Sort descending (highest first)
    result = [...result].sort((a, b) => b[sortKey] - a[sortKey]);

    return result;
  }, [markets, search, sortKey, protocolFilter]);

  const handleMarketPress = useCallback(
    (market: UnifiedMarket) => {
      router.push({
        pathname: '/market/[id]',
        params: { id: market.id },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: UnifiedMarket }) => (
      <MarketCard market={item} onPress={() => handleMarketPress(item)} />
    ),
    [handleMarketPress],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">Markets</Text>
        <Text className="text-sm text-slate-400 mt-1">
          {markets
            ? `${filtered.length} markets across ${new Set(markets.map((m) => m.protocol)).size} protocols`
            : 'Loading lending rates...'}
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-surface-light rounded-xl px-3 py-2.5">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            className="flex-1 text-white text-sm ml-2"
            placeholder="Search by asset or protocol..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Protocol filter */}
      <View className="px-4 mb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PROTOCOL_FILTERS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setProtocolFilter(item.key)}
              className={`mr-2 px-4 py-2 rounded-full ${
                protocolFilter === item.key
                  ? 'bg-primary-600'
                  : 'bg-surface-light'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  protocolFilter === item.key ? 'text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Sort bar */}
      <View className="px-4 mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SORT_OPTIONS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSortKey(item.key)}
              className="mr-3 flex-row items-center"
            >
              <Text
                className={`text-xs ${
                  sortKey === item.key
                    ? 'text-primary-400 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {item.label}
              </Text>
              {sortKey === item.key && (
                <Ionicons
                  name="arrow-down"
                  size={12}
                  color="#60a5fa"
                  style={{ marginLeft: 2 }}
                />
              )}
            </Pressable>
          )}
        />
      </View>

      {/* Market list */}
      {isLoading ? (
        <View className="px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MarketSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-lg text-white font-semibold mt-4">
            Failed to load markets
          </Text>
          <Text className="text-sm text-slate-400 text-center mt-2">
            Check your internet connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="search-outline" size={48} color="#64748b" />
          <Text className="text-lg text-white font-semibold mt-4">
            No markets found
          </Text>
          <Text className="text-sm text-slate-400 text-center mt-2">
            Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
