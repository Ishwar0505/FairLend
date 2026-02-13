import { useQuery } from '@tanstack/react-query';
import { fetchAllMarkets } from '@/services/aggregator';
import type { UnifiedMarket } from '@/lib/types';

export function useMarkets() {
  return useQuery<UnifiedMarket[]>({
    queryKey: ['markets'],
    queryFn: fetchAllMarkets,
    staleTime: 30_000,
  });
}
