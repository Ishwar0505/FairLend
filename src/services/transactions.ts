import type { UnifiedAction, TransactionResult } from '@/lib/types';
import type { ProtocolId } from '@/lib/constants';
import { SOLANA_RPC_URL, EXPLORER_URL } from '@/lib/constants';

export type TxStatus = 'idle' | 'building' | 'signing' | 'confirming' | 'success' | 'error';

/**
 * Execute a deposit action against the appropriate protocol.
 *
 * Phase 5 architecture: each protocol gets a dedicated builder.
 * Currently uses a demo simulation — real SDK calls will replace
 * the per-protocol methods once SDK compatibility is confirmed in RN.
 */
export async function executeDeposit(
  action: UnifiedAction,
  _walletAddress: string,
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  return executeProtocolAction(action, 'deposit', onStatus);
}

/**
 * Execute a borrow action against the appropriate protocol.
 */
export async function executeBorrow(
  action: UnifiedAction,
  _walletAddress: string,
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  return executeProtocolAction(action, 'borrow', onStatus);
}

// ---------------------------------------------------------------------------
// Internal: per-protocol routing
// ---------------------------------------------------------------------------

async function executeProtocolAction(
  action: UnifiedAction,
  actionType: 'deposit' | 'borrow',
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  try {
    onStatus('building');

    // Protocol-specific transaction builders
    // Each returns a serialised transaction ready for signing.
    // For the hackathon demo we simulate the full flow.
    switch (action.protocol) {
      case 'kamino':
        return await buildAndSendKamino(action, actionType, onStatus);
      case 'solend':
        return await buildAndSendSolend(action, actionType, onStatus);
      case 'marginfi':
        return await buildAndSendMarginfi(action, actionType, onStatus);
      default:
        return { success: false, error: `Unknown protocol: ${action.protocol}` };
    }
  } catch (error) {
    onStatus('error');
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Kamino — TODO: replace with @kamino-finance/klend-sdk
// ---------------------------------------------------------------------------

async function buildAndSendKamino(
  action: UnifiedAction,
  actionType: string,
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  // TODO: Real implementation using klend-sdk:
  // 1. Create KaminoMarket from KAMINO_MAIN_MARKET
  // 2. Find reserve by action.reserveAddress
  // 3. Build deposit/borrow instruction
  // 4. Build VersionedTransaction with recent blockhash
  // 5. Sign via wallet adapter
  // 6. Send and confirm

  return simulateTransaction(action, actionType, onStatus);
}

// ---------------------------------------------------------------------------
// Save / Solend — TODO: replace with @solendprotocol/solend-sdk
// ---------------------------------------------------------------------------

async function buildAndSendSolend(
  action: UnifiedAction,
  actionType: string,
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  // TODO: Real implementation using solend-sdk:
  // 1. Create SolendMarket for 'production'
  // 2. Load reserves
  // 3. Build depositReserveLiquidityInstruction or borrowObligationLiquidityInstruction
  // 4. Build and sign transaction
  // 5. Send and confirm

  return simulateTransaction(action, actionType, onStatus);
}

// ---------------------------------------------------------------------------
// marginfi — TODO: replace with @mrgnlabs/marginfi-client-v2
// ---------------------------------------------------------------------------

async function buildAndSendMarginfi(
  action: UnifiedAction,
  actionType: string,
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  // TODO: Real implementation using marginfi-client-v2:
  // 1. Create MarginfiClient
  // 2. Find bank by action.assetMint
  // 3. Build deposit/borrow instruction
  // 4. Sign and send

  return simulateTransaction(action, actionType, onStatus);
}

// ---------------------------------------------------------------------------
// Demo simulation — used until SDK integration is complete
// ---------------------------------------------------------------------------

async function simulateTransaction(
  action: UnifiedAction,
  actionType: string,
  onStatus: (status: TxStatus) => void,
): Promise<TransactionResult> {
  // Simulate the flow: building → signing → confirming → success
  onStatus('building');
  await delay(800);

  onStatus('signing');
  await delay(1200);

  onStatus('confirming');
  await delay(1000);

  onStatus('success');

  // Generate a demo signature (real signatures are 88-char base58 strings)
  const demoSignature = `demo_${action.protocol}_${actionType}_${Date.now()}`;

  return {
    success: true,
    signature: demoSignature,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getExplorerUrl(signature: string): string {
  if (signature.startsWith('demo_')) {
    // Demo transactions don't have real explorer pages
    return `${EXPLORER_URL}`;
  }
  return `${EXPLORER_URL}/tx/${signature}`;
}
