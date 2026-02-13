import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UnifiedMarket, UnifiedAction, TransactionResult } from '@/lib/types';
import { useWalletStore } from '@/stores/walletStore';
import { executeRepay, getExplorerUrl, type TxStatus } from '@/services/transactions';

interface RepayPreview {
  /** Remaining debt after repayment (token units) */
  remainingDebt: number;
  /** Whether this is a full repayment */
  isFullRepay: boolean;
  /** Estimated health factor improvement (simplified) */
  healthFactorAfter: number;
}

export function useRepay(market: UnifiedMarket | undefined, currentDebt?: number) {
  const { connected, address } = useWalletStore();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const preview: RepayPreview = useMemo(() => {
    const debt = currentDebt ?? 0;
    if (!market || parsedAmount === 0) {
      return { remainingDebt: debt, isFullRepay: false, healthFactorAfter: 2.0 };
    }

    const remainingDebt = Math.max(0, debt - parsedAmount);
    const isFullRepay = parsedAmount >= debt;

    // Simplified: repaying reduces borrow, improving health factor
    // healthFactor improves proportionally as debt decreases
    const repayRatio = debt > 0 ? Math.min(1, parsedAmount / debt) : 0;
    const healthFactorAfter = isFullRepay ? Infinity : 2.0 / (1 - repayRatio * 0.5);

    return {
      remainingDebt,
      isFullRepay,
      healthFactorAfter: Number.isFinite(healthFactorAfter) ? healthFactorAfter : Infinity,
    };
  }, [market, parsedAmount, currentDebt]);

  const setMax = useCallback(() => {
    if (currentDebt != null && currentDebt > 0) {
      setAmount(currentDebt.toString());
    }
  }, [currentDebt]);

  const canSubmit = connected && !!address && parsedAmount > 0 && txStatus === 'idle' && !!market;

  const submit = useCallback(async () => {
    if (!market || !address || parsedAmount === 0) return;

    const action: UnifiedAction = {
      protocol: market.protocol,
      type: 'repay',
      asset: market.asset,
      assetMint: market.assetMint,
      amount: parsedAmount,
      reserveAddress: market.reserveAddress,
    };

    setTxResult(null);

    const result = await executeRepay(action, address, setTxStatus);
    setTxResult(result);

    if (result.success) {
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
    setMax,
    parsedAmount,
    preview,
    txStatus,
    txResult,
    explorerUrl,
    canSubmit,
    submit,
    reset,
  };
}
