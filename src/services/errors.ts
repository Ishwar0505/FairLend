import type { ProtocolId } from '@/lib/constants';

export class ProtocolError extends Error {
  protocol: ProtocolId;
  originalError: unknown;

  constructor(protocol: ProtocolId, message: string, originalError?: unknown) {
    super(`[${protocol}] ${message}`);
    this.name = 'ProtocolError';
    this.protocol = protocol;
    this.originalError = originalError;
  }
}

/**
 * Wrap a protocol fetch call with standardized error handling.
 * Returns an empty array on failure so one protocol doesn't break the aggregator.
 */
export async function safeProtocolFetch<T>(
  protocol: ProtocolId,
  fn: () => Promise<T[]>,
): Promise<T[]> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[FairLend] ${protocol} fetch failed: ${message}`);
    return [];
  }
}
