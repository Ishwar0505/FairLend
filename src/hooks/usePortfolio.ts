import { useQuery } from '@tanstack/react-query';
import { fetchAllPositions } from '@/services/aggregator';
import { useWalletStore } from '@/stores/walletStore';
import type { UnifiedPosition } from '@/lib/types';

export function usePortfolio() {
  const { connected, address } = useWalletStore();

  const query = useQuery<UnifiedPosition[]>({
    queryKey: ['portfolio', address],
    queryFn: () => fetchAllPositions(address!),
    enabled: connected && !!address,
    staleTime: 30_000,
  });

  const positions = query.data ?? [];
  const deposits = positions.filter((p) => p.type === 'deposit');
  const borrows = positions.filter((p) => p.type === 'borrow');

  const totalDeposited = deposits.reduce((sum, p) => sum + p.amountUSD, 0);
  const totalBorrowed = borrows.reduce((sum, p) => sum + p.amountUSD, 0);
  const netWorth = totalDeposited - totalBorrowed;

  return {
    ...query,
    positions,
    deposits,
    borrows,
    totalDeposited,
    totalBorrowed,
    netWorth,
  };
}
