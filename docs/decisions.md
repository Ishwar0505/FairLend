# FairLend Mobile — Architecture Decision Log

---

## ADR-001: React Native with Expo over Native Android/iOS
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Need a mobile framework for a Solana dApp targeting both Android and iOS.

**Options Considered:**
1. React Native (Expo) — Cross-platform with JS/TS
2. Native Android (Kotlin) + iOS (Swift) — Two separate apps
3. Flutter — Cross-platform with Dart

**Decision:** React Native with Expo

**Reasoning:**
- ZenX's strongest stack is MERN/React — minimal learning curve
- All protocol SDKs (Kamino, Solend, marginfi) are TypeScript-first
- Expo simplifies builds, OTA updates, and device testing
- Cross-platform from one codebase
- Solana MWA has official React Native SDK
- NativeWind gives Tailwind-like styling (already familiar)

**Trade-offs:**
- Slightly less performant than native for animations
- MWA is Android-only regardless of framework choice

---

## ADR-002: Aggregator Pattern — No Custom Smart Contracts
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Should we build custom lending contracts or integrate existing protocols?

**Decision:** Integrate existing protocols via their TypeScript SDKs.

**Reasoning:**
- Kamino ($3.6B TVL), marginfi, Save are battle-tested and audited
- No Rust/Anchor development needed — ship faster
- Real liquidity from day one (not empty pools)
- Users interact with proven protocols through a better UX
- Focus engineering time on mobile UX, not contract security
- Fairathon deadline is tight — SDK integration is 10x faster

**Trade-offs:**
- Dependent on third-party SDK updates and breaking changes
- Can't customize protocol behavior (rates, collateral types)
- Need to maintain compatibility with 3 different SDK interfaces

---

## ADR-003: Kamino, Save (Solend), and marginfi as Initial Protocols
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Which Solana lending protocols should we integrate?

**Decision:** Start with Kamino, Save (Solend), and marginfi.

**Reasoning:**
- **Kamino:** Largest on Solana (~$3.6B TVL), excellent TS SDK, well-documented
- **Save/Solend:** One of the oldest, stable SDK, large user base, 129+ assets
- **marginfi:** Strong developer tooling, active community, distinct market types
- All three have mature TypeScript SDKs on npm
- Together they cover ~80%+ of Solana lending TVL
- Different enough to make comparison valuable to users

**Future:** Add Loopscale (order-book), Lulo (auto-optimizer) post-MVP

---

## ADR-004: MWA + Deeplink Dual Wallet Strategy
**Date:** 2026-02-13
**Status:** Accepted

**Context:** How to handle wallet connection on both Android and iOS?

**Decision:** MWA as primary on Android, Phantom deeplink as fallback everywhere.

**Reasoning:**
- MWA is the best UX on Android (native wallet popup, no browser redirect)
- MWA does NOT work on iOS (Apple platform restrictions)
- Phantom deeplink works on both platforms as a universal fallback
- Auth tokens allow MWA reauthorization without reconnecting
- Most Solana mobile users have Phantom installed

**Implementation:**
```
Platform.OS === 'android' → try MWA first → fallback to deeplink
Platform.OS === 'ios' → deeplink to Phantom/Solflare only
```

---

## ADR-005: Zustand + TanStack Query for State Management
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Need state management for wallet state + protocol data.

**Decision:** Zustand for client state, TanStack Query for server/chain state.

**Reasoning:**
- **Zustand** (wallet store): Lightweight, no provider needed, persists with AsyncStorage
  - Wallet address, auth token, connected state, preferred protocol
- **TanStack Query** (protocol data): Caching, refetching, stale-while-revalidate
  - Market data, positions, prices — all async chain data
  - Auto-refetch on focus, configurable staleTime
- No Redux boilerplate, no context provider nesting
- Both are React Native compatible and well-maintained

---

## ADR-006: NativeWind for Styling
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Styling approach for React Native components.

**Decision:** NativeWind (Tailwind CSS for React Native)

**Reasoning:**
- Familiar Tailwind syntax (ZenX uses Tailwind for web)
- className prop instead of StyleSheet objects
- Dark mode support built-in
- Consistent design tokens
- Faster iteration than manual StyleSheet

---

## ADR-007: Expo Router for Navigation
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Navigation library choice.

**Decision:** Expo Router (file-based routing built on React Navigation)

**Reasoning:**
- File-based routing similar to Next.js (familiar pattern)
- Built-in deep linking support
- Tab navigator and stack navigator coexist naturally
- TypeScript route typing out of the box
- Better Expo integration than raw React Navigation

---

## ADR-008: REST APIs over Protocol SDKs for Market Data
**Date:** 2026-02-13
**Status:** Accepted

**Context:** How should we fetch lending market data (APYs, TVL, utilization) from the three protocols?

**Options Considered:**
1. Native protocol SDKs (`@kamino-finance/klend-sdk`, `@solendprotocol/solend-sdk`, `@mrgnlabs/marginfi-client-v2`)
2. REST APIs (protocol-specific + DeFi Llama as fallback)
3. Direct Solana RPC account reads

**Decision:** Use REST APIs for reading market data. Protocol SDKs deferred to Phase 5 (transaction building).

**Reasoning:**
- Protocol SDKs have Node.js/browser dependencies (fs, crypto, native modules) that may break in React Native
- REST APIs are simpler, more reliable in RN, and sufficient for read-only data
- Kamino has a clean REST API (`api.kamino.finance`) with all needed data in one call
- Save/Solend data available via DeFi Llama yields API (project = "save")
- marginfi has NO public REST API and is absent from DeFi Llama yields — returns empty for Phase 2
- SDKs will only be evaluated in Phase 5 when we need to build transactions

**Data Sources:**
- **Kamino:** `https://api.kamino.finance/kamino-market/{market}/reserves/metrics`
- **Save/Solend:** DeFi Llama `/pools` + `/lendBorrow` (project = "save", chain = "Solana")
- **marginfi:** Deferred (no REST API, not in DeFi Llama)
- **Prices:** CoinGecko free API

**Trade-offs:**
- marginfi integration deferred — only 2 of 3 protocols have live data
- DeFi Llama data for Solend may be slightly delayed vs direct API
- No position (obligation) data from REST APIs — on-chain reads needed in Phase 4

---

## ADR-009: Demo Simulation for Transaction Flows
**Date:** 2026-02-13
**Status:** Accepted

**Context:** Phase 5 requires building deposit and borrow transactions. Protocol SDKs (@kamino-finance/klend-sdk, @solendprotocol/solend-sdk, @mrgnlabs/marginfi-client-v2) have heavy Node.js/browser dependencies (fs, crypto, native Buffer) that may break in React Native/Expo.

**Options Considered:**
1. Install protocol SDKs and debug RN compatibility issues
2. Build transactions manually with raw Solana instructions
3. Demo simulation with full UI + clean service abstraction for SDK drop-in

**Decision:** Demo simulation with per-protocol service stubs that are ready for real SDK integration.

**Reasoning:**
- Protocol SDKs have complex dependency trees that could take days to debug in RN
- The UI/UX is the core hackathon deliverable — complete, polished deposit/borrow flows
- Transaction service has clear per-protocol methods (`buildAndSendKamino`, etc.) that just need real SDK calls swapped in
- Demo simulation shows the full flow: building → signing → confirming → success
- Demo signatures are clearly labelled in the UI ("Demo mode — SDK integration pending")
- `useDeposit`/`useBorrow` hooks already invalidate TanStack Query caches on success

**Trade-offs:**
- No actual on-chain transactions until SDK integration
- Demo signatures don't appear on Solscan
- Health factor calculation is simplified (no actual collateral reads)

---

## Template for New Decisions

```
## ADR-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX

**Context:** [What problem?]
**Options Considered:** [List]
**Decision:** [What we chose]
**Reasoning:** [Why]
**Trade-offs:** [What we give up]
```
