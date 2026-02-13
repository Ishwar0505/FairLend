# FairLend Mobile — Project Specification

## Vision
A mobile-first Solana lending aggregator that lets users compare rates, deposit, borrow, and manage positions across Kamino, Save (Solend), and marginfi — all from one app with native Solana wallet support.

## Target Users
- Mobile-first Solana DeFi users who want one app for all lending
- Users who want to compare APYs across protocols without switching apps
- Android users who want native MWA wallet integration
- iOS users connecting via Phantom/Solflare deeplinks

---

## Integrated Protocols

### 1. Kamino Finance (K-Lend)
- **SDK:** `@kamino-finance/klend-sdk`
- **Main Market:** `7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF`
- **Features:** Deposit, Borrow, Withdraw, Repay
- **Data:** Reserves, Obligations, APYs, LTV ratios
- **Docs:** https://docs.kamino.finance/

### 2. Save Finance (formerly Solend)
- **SDK:** `@solendprotocol/solend-sdk`
- **Environment:** `production`
- **Features:** Deposit, Borrow, Withdraw, Repay
- **Data:** Markets, Reserves, Obligations, Rewards
- **Docs:** https://docs.save.finance/ | https://dev.solend.fi/

### 3. marginfi (mrgnlend)
- **SDK:** `@mrgnlabs/marginfi-client-v2` + `@mrgnlabs/mrgn-common`
- **Program:** `MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA`
- **Features:** Deposit, Borrow, Withdraw, Repay
- **Data:** Banks, Accounts, Lending/Borrowing rates, Health factor
- **Docs:** https://docs.marginfi.com/ts-sdk

---

## Core Features

### 1. Wallet Connection (Multi-Platform)
**Priority:** Critical

**Android (MWA):**
- Connect via Mobile Wallet Adapter protocol
- Support Phantom, Solflare, Seed Vault Wallet
- Authorize, reauthorize with auth tokens
- Sign and send transactions natively

**iOS / Fallback:**
- Deeplink to Phantom (`phantom://`)
- Deeplink to Solflare
- WalletConnect as fallback

**Acceptance Criteria:**
- [ ] Android: Connect via MWA to Phantom/Solflare
- [ ] Android: Sign and send transactions via MWA
- [ ] iOS: Connect via Phantom deeplink
- [ ] Display connected wallet address (truncated)
- [ ] Show SOL balance in header
- [ ] Handle disconnect and reconnection gracefully
- [ ] Persist auth token for MWA reauthorization

### 2. Markets Explorer
**Priority:** Critical

**Description:** Browse all lending markets across all 3 protocols in one view.

**Unified Market Data Model:**
```typescript
interface UnifiedMarket {
  protocol: 'kamino' | 'solend' | 'marginfi';
  asset: string;             // e.g., "SOL", "USDC"
  assetMint: string;         // Token mint address
  supplyAPY: number;         // Current lending APY
  borrowAPY: number;         // Current borrowing APY
  totalSupply: number;       // Total deposited (human-readable)
  totalBorrow: number;       // Total borrowed (human-readable)
  utilization: number;       // Utilization rate (0-1)
  ltv: number;               // Loan-to-value ratio
  liquidationThreshold: number;
  protocolName: string;      // Display name
  protocolIcon: string;      // Icon URI
  reserveAddress: string;    // On-chain address
}
```

**Acceptance Criteria:**
- [ ] Fetch and display markets from all 3 protocols
- [ ] Sort by: Best Supply APY, Best Borrow APY, Total Liquidity
- [ ] Filter by: Protocol, Asset, Minimum APY
- [ ] Search by asset name/symbol
- [ ] Pull-to-refresh
- [ ] Loading skeletons while fetching
- [ ] Color-code by protocol for easy identification
- [ ] Tap market card → navigate to detail screen

### 3. Market Detail Screen
**Priority:** Critical

**Description:** Detailed view of a specific lending market with deposit/borrow actions.

**Acceptance Criteria:**
- [ ] Show full market data (APY, LTV, utilization, etc.)
- [ ] APY history chart (if available from protocol)
- [ ] "Deposit" and "Borrow" action buttons
- [ ] Show user's existing position in this market (if any)
- [ ] Risk indicators (utilization bar, health factor)
- [ ] Link to protocol's web app for advanced features

### 4. Deposit Flow
**Priority:** Critical

**Description:** Deposit assets into any supported lending protocol.

**Acceptance Criteria:**
- [ ] Select amount (number pad + "MAX" button)
- [ ] Show estimated APY and daily/weekly/monthly earnings
- [ ] Show current wallet balance for the asset
- [ ] Build transaction using protocol SDK
- [ ] Sign and send via MWA (Android) or deeplink (iOS)
- [ ] Show transaction confirmation with Explorer link
- [ ] Update portfolio positions after success
- [ ] Handle errors: insufficient balance, slippage, tx failure

### 5. Borrow Flow
**Priority:** Critical

**Description:** Borrow assets against collateral from any protocol.

**Acceptance Criteria:**
- [ ] Show available collateral and borrowing power
- [ ] Select borrow amount with health factor preview
- [ ] Health factor indicator (green/yellow/red)
- [ ] Warn if health factor drops below 1.2
- [ ] Build transaction using protocol SDK
- [ ] Sign and send via MWA/deeplink
- [ ] Show transaction confirmation
- [ ] Update portfolio after success

### 6. Portfolio Dashboard
**Priority:** Critical

**Description:** Overview of all user positions across all protocols.

**Unified Position Data Model:**
```typescript
interface UnifiedPosition {
  protocol: 'kamino' | 'solend' | 'marginfi';
  type: 'deposit' | 'borrow';
  asset: string;
  assetMint: string;
  amount: number;            // Current amount (human-readable)
  amountUSD: number;         // USD value
  apy: number;               // Current APY
  earnings: number;          // Accumulated earnings
  healthFactor?: number;     // For borrow positions
}
```

**Acceptance Criteria:**
- [ ] Summary cards: Total Deposited, Total Borrowed, Net Worth (all USD)
- [ ] List of all deposit positions grouped by protocol
- [ ] List of all borrow positions grouped by protocol
- [ ] Per-position: asset, amount, APY, USD value
- [ ] Health factor for borrow positions
- [ ] Quick actions: Withdraw, Repay from position card
- [ ] Pull-to-refresh
- [ ] Empty state for new users with "Start Earning" CTA

### 7. Withdraw & Repay Flows
**Priority:** High

**Acceptance Criteria:**
- [ ] Withdraw: Select amount, show remaining position, execute via SDK
- [ ] Repay: Select amount (partial/full), show remaining debt, execute
- [ ] "Repay All" button for full repayment
- [ ] Transaction confirmation for both
- [ ] Health factor update preview for repayment

### 8. Rate Comparison Widget
**Priority:** High

**Description:** Side-by-side comparison of rates across protocols for the same asset.

**Acceptance Criteria:**
- [ ] Select asset → see all 3 protocols' rates
- [ ] Visual bar chart comparing supply/borrow APYs
- [ ] Highlight "Best Rate" with badge
- [ ] One-tap to deposit into the best-rate protocol
- [ ] Auto-suggestion: "You could earn X% more on Kamino"

### 9. Settings & Preferences
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Default network: Mainnet / Devnet toggle
- [ ] Custom RPC URL input
- [ ] Preferred protocol (for one-tap actions)
- [ ] Currency display: USD, EUR, SOL
- [ ] Notification preferences (future)
- [ ] Dark/Light theme toggle
- [ ] About & Version info

---

## Screens & Navigation

### Tab Navigator
| Tab | Screen | Description |
|---|---|---|
| 🏠 Home | Dashboard | Portfolio overview & quick actions |
| 📊 Markets | Markets Explorer | Browse all lending markets |
| 💼 Portfolio | Portfolio Detail | Detailed position management |
| ⚙️ Settings | Settings | App configuration |

### Stack Screens (Push)
| Route | Description |
|---|---|
| `market/[id]` | Market detail for specific asset+protocol |
| `deposit/[protocol]` | Deposit flow |
| `borrow/[protocol]` | Borrow flow |
| `withdraw/[protocol]` | Withdraw flow |
| `repay/[protocol]` | Repay flow |
| `compare/[asset]` | Rate comparison for an asset |

---

## Service Architecture

```
Components (UI)
    ↓ call hooks
Hooks (useMarkets, usePortfolio, useDeposit, etc.)
    ↓ call aggregator
Aggregator Service (src/services/aggregator.ts)
    ↓ normalizes data from
┌──────────────┬──────────────┬──────────────┐
│ Kamino SDK   │ Solend SDK   │ marginfi SDK │
│ klend-sdk    │ solend-sdk   │ marginfi-v2  │
└──────────────┴──────────────┴──────────────┘
    ↓ all use
Solana Connection (@solana/web3.js)
    ↓ signed by
Wallet (MWA on Android / Deeplink on iOS)
```

---

## Environment Variables
```
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_SOLANA_NETWORK=mainnet-beta
EXPO_PUBLIC_KAMINO_MARKET=7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF
EXPO_PUBLIC_MARGINFI_PROGRAM=MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA
EXPO_PUBLIC_COINGECKO_API_KEY=
```

---

## Future Enhancements (Post-MVP)
- Push notifications for health factor warnings
- Auto-rebalance: move deposits to highest APY protocol
- Loopscale integration (order-book based lending)
- Lulo integration (auto rate optimization)
- Swap integration (Jupiter) for collateral management
- Multi-wallet support
- Portfolio history & analytics charts
- Governance voting (SAVE, KMNO tokens)
- Fairyscale API for enhanced on-chain reputation data
