/**
 * Truncate a Solana address for display: "AbCd...xYz1"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a number as a percentage: 0.0534 → "5.34%"
 */
export function formatAPY(apy: number): string {
  return `${(apy * 100).toFixed(2)}%`;
}

/**
 * Format a USD value: 1234.56 → "$1,234.56"
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a token amount with appropriate decimals.
 * Amounts > 1 get 2 decimals, < 1 get up to 6.
 */
export function formatAmount(amount: number): string {
  if (amount === 0) return '0';
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`;
  }
  if (amount >= 1) {
    return amount.toFixed(2);
  }
  return amount.toFixed(6);
}

/**
 * Convert lamports (or smallest unit) to human-readable token amount.
 */
export function fromBaseUnits(amount: number | bigint, decimals: number): number {
  return Number(amount) / 10 ** decimals;
}

/**
 * Convert human-readable token amount to base units (lamports, etc.).
 */
export function toBaseUnits(amount: number, decimals: number): number {
  return Math.floor(amount * 10 ** decimals);
}

/**
 * Return a color for a health factor value.
 */
export function healthFactorColor(hf: number): string {
  if (hf >= 2) return '#22c55e';   // green — safe
  if (hf >= 1.2) return '#f59e0b'; // yellow — caution
  return '#ef4444';                 // red — danger
}
