import { View, Text, ScrollView, Pressable, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarkets } from '@/hooks/useMarkets';
import { useRepay } from '@/hooks/useRepay';
import { useWalletStore } from '@/stores/walletStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatUSD, formatAmount, healthFactorColor } from '@/lib/utils';
import type { TxStatus } from '@/services/transactions';

const STATUS_LABELS: Record<TxStatus, string> = {
  idle: '',
  building: 'Building transaction...',
  signing: 'Awaiting wallet signature...',
  confirming: 'Confirming on-chain...',
  success: 'Repayment successful!',
  error: 'Transaction failed',
};

export default function RepayScreen() {
  const { protocol, marketId, positionAmount } = useLocalSearchParams<{
    protocol: string;
    marketId: string;
    positionAmount?: string;
  }>();
  const router = useRouter();
  const { connected } = useWalletStore();
  const { data: markets, isLoading: marketsLoading } = useMarkets();

  const market = markets?.find((m) => m.id === marketId);
  const currentDebt = positionAmount ? parseFloat(positionAmount) : undefined;

  const {
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
  } = useRepay(market, currentDebt);

  const isProcessing = txStatus !== 'idle' && txStatus !== 'success' && txStatus !== 'error';
  const hfAfterColor = Number.isFinite(preview.healthFactorAfter)
    ? healthFactorColor(preview.healthFactorAfter)
    : '#22c55e';

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (marketsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-4 pt-4">
          <Skeleton width={200} height={24} />
          <Skeleton width={120} height={16} className="mt-3" />
          <Skeleton height={56} className="mt-6" />
          <Skeleton height={120} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Market not found
  // ---------------------------------------------------------------------------
  if (!market) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-lg text-white font-semibold mt-4">Market not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------
  if (txStatus === 'success' && txResult?.success) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <ScrollView className="flex-1" contentContainerClassName="items-center justify-center px-6 py-12">
          <View className="w-20 h-20 rounded-full bg-success/20 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>

          <Text className="text-2xl font-bold text-white">Repayment Successful!</Text>

          <Text className="text-sm text-slate-400 mt-3 text-center">
            You repaid {formatAmount(parsedAmount)} {market.asset} to {market.protocolName}
            {preview.isFullRepay ? ' (Full Repayment)' : ''}
          </Text>

          <View className="w-full bg-surface-light rounded-2xl p-4 mt-6">
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-slate-400">Amount Repaid</Text>
              <Text className="text-sm font-semibold text-white">
                {formatAmount(parsedAmount)} {market.asset}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-slate-400">Protocol</Text>
              <Text className="text-sm font-semibold text-white">{market.protocolName}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-slate-400">Remaining Debt</Text>
              <Text className="text-sm font-semibold text-white">
                {preview.isFullRepay
                  ? 'Fully Repaid'
                  : `${formatAmount(preview.remainingDebt)} ${market.asset}`}
              </Text>
            </View>
            {txResult.signature?.startsWith('demo_') && (
              <View className="mt-3 py-2 px-3 bg-warning/10 rounded-lg">
                <Text className="text-xs text-warning text-center">
                  Demo mode — SDK integration pending
                </Text>
              </View>
            )}
          </View>

          <View className="w-full mt-6 gap-3">
            <Button title="Done" onPress={() => router.back()} size="lg" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Main repay form
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#60a5fa" />
            <Text className="text-primary-400 ml-2 text-sm">Back</Text>
          </Pressable>

          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-surface-light items-center justify-center">
              <Text className="text-xl font-bold text-white">
                {market.asset.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                Repay {market.asset}
              </Text>
              <Badge
                label={market.protocolName}
                color={market.protocolColor}
                className="mt-1 self-start"
              />
            </View>
          </View>
        </View>

        {/* Current debt */}
        {currentDebt != null && (
          <View className="mx-4 mt-4 bg-surface-light rounded-2xl p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-slate-400">Outstanding Debt</Text>
                <Text className="text-lg font-bold text-warning mt-1">
                  {formatAmount(currentDebt)} {market.asset}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-slate-400">Borrow APY</Text>
                <Text className="text-sm font-semibold text-warning mt-1">
                  {market.borrowAPY.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Wallet not connected warning */}
        {!connected && (
          <View className="mx-4 mt-4 bg-warning/10 rounded-xl p-3 flex-row items-center gap-2">
            <Ionicons name="wallet-outline" size={20} color="#f59e0b" />
            <Text className="text-sm text-warning flex-1">
              Connect your wallet to repay
            </Text>
          </View>
        )}

        {/* Amount input */}
        <View className="px-4 mt-6">
          <Text className="text-sm font-semibold text-slate-300 mb-2">
            Repay Amount
          </Text>
          <View className="bg-surface-light rounded-2xl flex-row items-center px-4">
            <TextInput
              className="flex-1 text-white text-xl font-semibold py-4"
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              editable={!isProcessing}
            />
            {currentDebt != null && (
              <Pressable
                onPress={setMax}
                className="bg-primary-600/20 px-3 py-1.5 rounded-lg mr-2"
              >
                <Text className="text-primary-400 text-xs font-semibold">REPAY ALL</Text>
              </Pressable>
            )}
            <Text className="text-slate-400 font-semibold">{market.asset}</Text>
          </View>
        </View>

        {/* Repayment preview */}
        {parsedAmount > 0 && (
          <View className="px-4 mt-4">
            <Text className="text-sm font-semibold text-slate-300 mb-2">
              Repayment Preview
            </Text>
            <View className="bg-surface-light rounded-2xl px-4">
              <View className="flex-row justify-between py-3 border-b border-surface-lighter">
                <Text className="text-sm text-slate-400">Repaying</Text>
                <Text className="text-sm font-medium text-white">
                  {formatAmount(parsedAmount)} {market.asset}
                </Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-surface-lighter">
                <Text className="text-sm text-slate-400">Remaining Debt</Text>
                <Text className="text-sm font-medium text-white">
                  {preview.isFullRepay
                    ? 'Fully Repaid'
                    : `${formatAmount(preview.remainingDebt)} ${market.asset}`}
                </Text>
              </View>
              {!preview.isFullRepay && (
                <View className="flex-row justify-between py-3 items-center">
                  <Text className="text-sm text-slate-400">Health Factor After</Text>
                  <Text className="text-sm font-bold" style={{ color: hfAfterColor }}>
                    {preview.healthFactorAfter.toFixed(2)}
                  </Text>
                </View>
              )}
              {preview.isFullRepay && (
                <View className="py-3 items-center">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                    <Text className="text-sm font-medium text-success">
                      Debt fully cleared — no liquidation risk
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Market info */}
        <View className="px-4 mt-4">
          <View className="bg-surface-light rounded-2xl px-4">
            <View className="flex-row justify-between py-3 border-b border-surface-lighter">
              <Text className="text-sm text-slate-400">Borrow APY</Text>
              <Text className="text-sm font-medium text-warning">
                {market.borrowAPY.toFixed(2)}%
              </Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-sm text-slate-400">Utilization</Text>
              <Text className="text-sm font-medium text-white">
                {(market.utilization * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction status */}
        {txStatus !== 'idle' && txStatus !== 'success' && (
          <View className="mx-4 mt-4 bg-surface-light rounded-2xl p-4 items-center gap-2">
            {txStatus === 'error' ? (
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            ) : (
              <Ionicons name="hourglass-outline" size={24} color="#60a5fa" />
            )}
            <Text
              className={`text-sm font-medium ${
                txStatus === 'error' ? 'text-danger' : 'text-primary-400'
              }`}
            >
              {STATUS_LABELS[txStatus]}
            </Text>
            {txResult?.error && (
              <Text className="text-xs text-slate-400 text-center mt-1">
                {txResult.error}
              </Text>
            )}
          </View>
        )}

        {/* Submit button */}
        <View className="px-4 mt-6 mb-8">
          {txStatus === 'error' ? (
            <View className="gap-3">
              <Button title="Try Again" onPress={reset} size="lg" />
              <Button title="Go Back" onPress={() => router.back()} variant="secondary" size="lg" />
            </View>
          ) : (
            <Button
              title={
                !connected
                  ? 'Connect Wallet'
                  : parsedAmount === 0
                    ? 'Enter Amount'
                    : preview.isFullRepay
                      ? `Repay All ${market.asset}`
                      : `Repay ${formatAmount(parsedAmount)} ${market.asset}`
              }
              onPress={submit}
              disabled={!canSubmit}
              loading={isProcessing}
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
