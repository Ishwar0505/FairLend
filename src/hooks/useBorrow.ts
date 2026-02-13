import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UnifiedMarket, UnifiedAction, TransactionResult } from '@/lib/types';
import { useWalletStore } from '@/stores/walletStore';
import { executeBorrow, getExplorerUrl, type TxStatus } from '@/services/transactions';

interface BorrowPreview {
  /** Estimated health factor after this borrow (simplified) */
  healthFactor: number;
  /** Daily interest cost in token units */
  dailyInterest: number;
  /** Monthly interest cost in token units */
  monthlyInterest: number;
}

export function useBorrow(market: UnifiedMarket | undefined) {
  const { connected, address } = useWalletStore();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  // Simplified borrow preview
  // A real implementation would read the user's existing collateral + obligations on-chain
  const preview: BorrowPreview = useMemo(() => {
    if (!market || parsedAmount === 0) {
      return { healthFactor: Infinity, dailyInterest: 0, monthlyInterest: 0 };
    }

    const apyDecimal = market.borrowAPY / 100;
    const yearlyInterest = parsedAmount * apyDecimal;

    // Simplified health factor estimate:
    // Without knowing the user's actual collateral, we show a placeholder.
    // healthFactor = collateralValue * liquidationThreshold / borrowValue
    // For now, assume this is a new borrow against no existing positions.
    const healthFactor = market.ltv > 0 ? 1 / (parsedAmount / (parsedAmount * (1 / market.ltv))) : 2.0;

    return {
      healthFactor: Number.isFinite(healthFactor) ? healthFactor : 2.0,
      dailyInterest: yearlyInterest / 365,
      monthlyInterest: yearlyInterest / 12,
    };
  }, [market, parsedAmount]);

  const isHealthDanger = preview.healthFactor < 1.2;
  const canSubmit = connected && !!address && parsedAmount > 0 && txStatus === 'idle' && !!market;

  const submit = useCallback(async () => {
    if (!market || !address || parsedAmount === 0) return;

    const action: UnifiedAction = {
      protocol: market.protocol,
      type: 'borrow',
      asset: market.asset,
      assetMint: market.assetMint,
      amount: parsedAmount,
      reserveAddress: market.reserveAddress,
    };

    setTxResult(null);

    const result = await executeBorrow(action, address, setTxStatus);
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
    parsedAmount,
    preview,
    isHealthDanger,
    txStatus,
    txResult,
    explorerUrl,
    canSubmit,
    submit,
    reset,
  };
}
