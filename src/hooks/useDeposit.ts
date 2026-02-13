import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UnifiedMarket, UnifiedAction, TransactionResult } from '@/lib/types';
import { useWalletStore } from '@/stores/walletStore';
import { executeDeposit, getExplorerUrl, type TxStatus } from '@/services/transactions';

interface EarningsEstimate {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export function useDeposit(market: UnifiedMarket | undefined) {
  const { connected, address } = useWalletStore();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  // Estimated earnings based on current APY
  const earnings: EarningsEstimate = useMemo(() => {
    if (!market || parsedAmount === 0) {
      return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    }
    const apyDecimal = market.supplyAPY / 100; // Convert percentage back to decimal
    const yearly = parsedAmount * apyDecimal;
    return {
      daily: yearly / 365,
      weekly: yearly / 52,
      monthly: yearly / 12,
      yearly,
    };
  }, [market, parsedAmount]);

  const canSubmit = connected && !!address && parsedAmount > 0 && txStatus === 'idle' && !!market;

  const submit = useCallback(async () => {
    if (!market || !address || parsedAmount === 0) return;

    const action: UnifiedAction = {
      protocol: market.protocol,
      type: 'deposit',
      asset: market.asset,
      assetMint: market.assetMint,
      amount: parsedAmount,
      reserveAddress: market.reserveAddress,
    };

    setTxResult(null);

    const result = await executeDeposit(action, address, setTxStatus);
    setTxResult(result);

    if (result.success) {
      // Invalidate market + portfolio data so they refresh
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  }, [market, address, parsedAmount, queryClient]);

  const reset = useCallback(() => {
    setAmount('');
    setTxStatus('idle');
    setTxResult(null);
  }, []);

  const explorerUrl = txResult?.signature ? getExplorerUrl(txResult.signature) : null;

  return {
    amount,
    setAmount,
    parsedAmount,
    earnings,
    txStatus,
    txResult,
    explorerUrl,
    canSubmit,
    submit,
    reset,
  };
}
