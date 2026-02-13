import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UnifiedMarket, UnifiedAction, TransactionResult } from '@/lib/types';
import { useWalletStore } from '@/stores/walletStore';
import { executeWithdraw, getExplorerUrl, type TxStatus } from '@/services/transactions';

interface WithdrawPreview {
  /** Remaining position after withdrawal (token units) */
  remaining: number;
  /** Earnings you stop earning per day after withdrawal */
  lostDailyEarnings: number;
}

export function useWithdraw(market: UnifiedMarket | undefined, currentAmount?: number) {
  const { connected, address } = useWalletStore();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const preview: WithdrawPreview = useMemo(() => {
    if (!market || parsedAmount === 0) {
      return { remaining: currentAmount ?? 0, lostDailyEarnings: 0 };
    }
    const remaining = Math.max(0, (currentAmount ?? 0) - parsedAmount);
    const apyDecimal = market.supplyAPY / 100;
    const lostDailyEarnings = (parsedAmount * apyDecimal) / 365;
    return { remaining, lostDailyEarnings };
  }, [market, parsedAmount, currentAmount]);

  const setMax = useCallback(() => {
    if (currentAmount != null && currentAmount > 0) {
      setAmount(currentAmount.toString());
    }
  }, [currentAmount]);

  const canSubmit = connected && !!address && parsedAmount > 0 && txStatus === 'idle' && !!market;

  const submit = useCallback(async () => {
    if (!market || !address || parsedAmount === 0) return;

    const action: UnifiedAction = {
      protocol: market.protocol,
      type: 'withdraw',
      asset: market.asset,
      assetMint: market.assetMint,
      amount: parsedAmount,
      reserveAddress: market.reserveAddress,
    };

    setTxResult(null);

    const result = await executeWithdraw(action, address, setTxStatus);
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
