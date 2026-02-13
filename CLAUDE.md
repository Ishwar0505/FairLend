# FairLend — CLAUDE.md

## Project Overview
FairLend is a React Native mobile dApp that aggregates Solana lending protocols (Kamino, Save/Solend, marginfi) into a single unified interface. Users connect via Solana Mobile Wallet Adapter (MWA) on Android or standard wallet adapters (Phantom, Solflare, Backpack) on web/mobile. No custom smart contracts — we integrate existing battle-tested protocol SDKs.

**Core Value Prop:** One app to compare rates, deposit, borrow, and manage positions across ALL major Solana lending protocols.

## Tech Stack
- **Mobile:** React Native (Expo), TypeScript
- **Navigation:** React Navigation v6
- **Wallet (Mobile):** @solana-mobile/mobile-wallet-adapter-protocol-web3js
- **Wallet (Web/Desktop):** @solana/wallet-adapter-react
- **Blockchain:** @solana/web3.js
- **Protocol SDKs:**
  - Kamino: `@kamino-finance/klend-sdk`
  - Save/Solend: `@solendprotocol/solend-sdk`
  - marginfi: `@mrgnlabs/marginfi-client-v2` + `@mrgnlabs/mrgn-common`
- **State Management:** Zustand (lightweight global state) + TanStack Query (server/chain state)
- **Styling:** NativeWind (Tailwind for React Native)
- **Testing:** Jest + React Native Testing Library
- **Price Data:** Pyth Network / CoinGecko API

## Folder Structure
```
fairlend/
├── app/                        # Expo Router app directory
│   ├── (tabs)/                 # Tab navigator screens
│   │   ├── index.tsx           # Home/Dashboard
│   │   ├── markets.tsx         # Lending markets explorer
│   │   ├── portfolio.tsx       # User positions
│   │   └── settings.tsx        # App settings
│   ├── market/[id].tsx         # Individual market detail
│   ├── deposit/[protocol].tsx  # Deposit flow
│   ├── borrow/[protocol].tsx   # Borrow flow
│   └── _layout.tsx             # Root layout
├── src/
│   ├── components/             # React Native components
│   │   ├── ui/                 # Reusable primitives (Button, Card, Input, etc.)
│   │   ├── markets/            # Market-related components
│   │   ├── portfolio/          # Portfolio components
│   │   ├── wallet/             # Wallet connection components
│   │   └── common/             # Shared components (Header, TabBar, etc.)
│   ├── hooks/                  # Custom hooks
│   ├── services/               # Protocol SDK wrappers
│   │   ├── kamino/             # Kamino SDK integration
│   │   ├── solend/             # Save/Solend SDK integration
│   │   ├── marginfi/           # marginfi SDK integration
│   │   └── aggregator.ts       # Unified aggregation layer
│   ├── stores/                 # Zustand stores
│   ├── lib/                    # Utilities, constants, types
│   │   ├── constants.ts        # Protocol addresses, RPC URLs
│   │   ├── types.ts            # Shared TypeScript types
│   │   └── utils.ts            # Helper functions
│   └── config/                 # App configuration
├── docs/                       # Project documentation
│   ├── spec.md
│   ├── tracker.md
│   ├── decisions.md
│   └── skills/
│       ├── protocol-integration.md
│       └── wallet-patterns.md
├── assets/                     # Images, fonts, icons
└── __tests__/                  # Test files
```

## Coding Conventions
- **Components:** Functional with hooks. PascalCase filenames.
- **Hooks:** Prefix with `use`. camelCase filenames.
- **Services:** Each protocol gets its own folder with index.ts entry point.
- **Types:** PascalCase. Prefix protocol-specific types: `KaminoReserve`, `SolendMarket`, `MarginfiBank`.
- **Unified types:** Use `UnifiedMarket`, `UnifiedPosition`, `UnifiedAction` for cross-protocol data.
- **Imports:** Use `@/` alias for `src/`.
- **Error handling:** All SDK calls wrapped in try/catch with protocol-specific error parsing.
- **No `any`** — use `unknown` and type narrow.
- **Platform checks:** Use `Platform.OS` for Android-specific MWA code.

## Key Commands
```bash
npx expo start                  # Start dev server
npx expo start --android        # Start on Android
npx expo start --ios            # Start on iOS
npx expo run:android            # Build and run on Android
npm run test                    # Run Jest tests
npm run lint                    # ESLint
npm run typecheck               # TypeScript check
```

## Important Rules
1. Always read spec.md before implementing features.
2. Always update tracker.md after completing a task.
3. Always update decisions.md for architectural choices.
4. Commit with conventional commits: feat:, fix:, refactor:, docs:, test:
5. Never hardcode RPC URLs — use env vars via expo-constants.
6. All amounts stored in native decimals (lamports/base units), display as human-readable.
7. Always handle wallet-not-connected state in every screen.
8. MWA is Android-only — always provide fallback for iOS (deeplink to Phantom, etc.).
9. All protocol calls must go through the aggregator service, never called directly from components.
10. Use the Solana MWA skill at docs/skills/wallet-patterns.md for wallet code.
