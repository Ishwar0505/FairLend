# Skill: Wallet Connection Patterns for FairLend

> Read this file + the Solana MWA SKILL.md before writing any wallet code.
> MWA reference: /mnt/skills/user/solana-mobile-wallet-adapter/SKILL.md

---

## Wallet Store (Zustand)

```typescript
// src/stores/walletStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletState {
  // State
  connected: boolean;
  address: string | null;
  authToken: string | null;  // MWA reauthorization token
  balance: number;           // SOL balance in lamports

  // Actions
  setConnected: (address: string, authToken?: string) => void;
  setDisconnected: () => void;
  setBalance: (balance: number) => void;
  setAuthToken: (token: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      connected: false,
      address: null,
      authToken: null,
      balance: 0,

      setConnected: (address, authToken) =>
        set({ connected: true, address, authToken }),
      setDisconnected: () =>
        set({ connected: false, address: null, authToken: null, balance: 0 }),
      setBalance: (balance) => set({ balance }),
      setAuthToken: (authToken) => set({ authToken }),
    }),
    {
      name: 'fairlend-wallet',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## MWA Connection (Android)

```typescript
// src/services/wallet/mwa.ts

import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

const APP_IDENTITY = {
  name: 'FairLend',
  uri: 'https://fairlend.app',
  icon: 'favicon.ico',
};

export async function connectMWA(): Promise<{ address: string; authToken: string }> {
  const result = await transact(async (wallet: Web3MobileWallet) => {
    const authResult = await wallet.authorize({
      cluster: 'solana:mainnet-beta',
      identity: APP_IDENTITY,
    });
    return {
      address: authResult.accounts[0].address,
      authToken: authResult.auth_token,
    };
  });
  return result;
}

export async function reauthorizeMWA(
  authToken: string
): Promise<{ address: string; authToken: string }> {
  const result = await transact(async (wallet: Web3MobileWallet) => {
    const authResult = await wallet.reauthorize({
      auth_token: authToken,
      identity: APP_IDENTITY,
    });
    return {
      address: authResult.accounts[0].address,
      authToken: authResult.auth_token,
    };
  });
  return result;
}

export async function signAndSendMWA(
  transaction: Transaction | VersionedTransaction,
  authToken?: string
): Promise<string> {
  const signature = await transact(async (wallet: Web3MobileWallet) => {
    // Reauthorize if we have a token, otherwise fresh authorize
    if (authToken) {
      await wallet.reauthorize({
        auth_token: authToken,
        identity: APP_IDENTITY,
      });
    } else {
      await wallet.authorize({
        cluster: 'solana:mainnet-beta',
        identity: APP_IDENTITY,
      });
    }

    const result = await wallet.signAndSendTransactions({
      transactions: [transaction],
    });

    return result.signatures[0];
  });

  // Convert Uint8Array signature to base58 string
  return Buffer.from(signature).toString('base64');
}

export async function signMessageMWA(
  message: Uint8Array,
  authToken?: string
): Promise<Uint8Array> {
  const result = await transact(async (wallet: Web3MobileWallet) => {
    const authResult = authToken
      ? await wallet.reauthorize({ auth_token: authToken, identity: APP_IDENTITY })
      : await wallet.authorize({ cluster: 'solana:mainnet-beta', identity: APP_IDENTITY });

    const signed = await wallet.signMessages({
      addresses: [authResult.accounts[0].address],
      payloads: [message],
    });

    return signed[0];
  });

  return result;
}
```

---

## Phantom Deeplink (iOS Fallback)

```typescript
// src/services/wallet/phantom.ts

import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const PHANTOM_DEEPLINK = 'phantom://';
const PHANTOM_CONNECT_URL = 'https://phantom.app/ul/v1/connect';
const APP_URL = 'https://fairlend.app';
const REDIRECT_URL = 'fairlend://callback';

// Generate a keypair for encryption with Phantom
const dappKeyPair = nacl.box.keyPair();

export function getPhantomConnectURL(): string {
  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    cluster: 'mainnet-beta',
    app_url: APP_URL,
    redirect_link: REDIRECT_URL,
  });

  return `${PHANTOM_CONNECT_URL}?${params.toString()}`;
}

export async function connectPhantom(): Promise<void> {
  const url = getPhantomConnectURL();
  
  // Check if Phantom is installed
  const canOpen = await Linking.canOpenURL(PHANTOM_DEEPLINK);
  if (!canOpen) {
    // Open Phantom download page
    await WebBrowser.openBrowserAsync('https://phantom.app/download');
    throw new Error('Phantom wallet not installed');
  }

  await Linking.openURL(url);
  // Handle the callback in the deep link handler
}

// Handle Phantom callback
export function parsePhantomCallback(url: string): {
  publicKey: string;
  session: string;
} | null {
  try {
    const parsedUrl = new URL(url);
    const data = parsedUrl.searchParams.get('data');
    const nonce = parsedUrl.searchParams.get('nonce');
    const phantomPublicKey = parsedUrl.searchParams.get('phantom_encryption_public_key');

    if (!data || !nonce || !phantomPublicKey) return null;

    // Decrypt the response
    const sharedSecret = nacl.box.before(
      bs58.decode(phantomPublicKey),
      dappKeyPair.secretKey
    );

    const decrypted = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      sharedSecret
    );

    if (!decrypted) return null;

    const parsed = JSON.parse(Buffer.from(decrypted).toString('utf-8'));
    return {
      publicKey: parsed.public_key,
      session: parsed.session,
    };
  } catch {
    return null;
  }
}
```

---

## Unified Wallet Hook

```typescript
// src/hooks/useWallet.ts

import { Platform } from 'react-native';
import { useCallback } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { connectMWA, signAndSendMWA } from '@/services/wallet/mwa';
import { connectPhantom } from '@/services/wallet/phantom';
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';

export function useWallet() {
  const { connected, address, authToken, balance, setConnected, setDisconnected } = 
    useWalletStore();

  const connect = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Try MWA first on Android
        const result = await connectMWA();
        setConnected(result.address, result.authToken);
      } else {
        // iOS: deeplink to Phantom
        await connectPhantom();
        // Connection result handled via deep link callback
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }, [setConnected]);

  const disconnect = useCallback(() => {
    setDisconnected();
  }, [setDisconnected]);

  const signAndSend = useCallback(
    async (transaction: Transaction | VersionedTransaction): Promise<string> => {
      if (!connected) throw new Error('Wallet not connected');

      if (Platform.OS === 'android') {
        return signAndSendMWA(transaction, authToken || undefined);
      } else {
        // iOS: build and send via Phantom deeplink
        throw new Error('iOS transaction signing not yet implemented');
      }
    },
    [connected, authToken]
  );

  return {
    connected,
    address,
    balance,
    connect,
    disconnect,
    signAndSend,
  };
}
```

---

## WalletButton Component

```typescript
// src/components/wallet/WalletButton.tsx

import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/lib/utils';
import { formatSol } from '@/lib/utils';

export function WalletButton() {
  const { connected, address, balance, connect, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      if (connected) {
        disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-indigo-600 rounded-full px-4 py-2">
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  if (connected && address) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-gray-800 rounded-full px-4 py-2 flex-row items-center"
      >
        <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
        <Text className="text-white text-sm font-medium">
          {truncateAddress(address)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-indigo-600 rounded-full px-4 py-2"
    >
      <Text className="text-white text-sm font-semibold">
        Connect Wallet
      </Text>
    </TouchableOpacity>
  );
}
```

---

## Transaction Flow Pattern

```
User taps "Deposit 10 SOL on Kamino"
    ↓
1. Hook calls aggregator → builds transaction via Kamino SDK
2. Transaction returned as Transaction/VersionedTransaction object
3. Hook calls useWallet().signAndSend(transaction)
4. Platform check:
   - Android → MWA popup → user approves in Phantom → signature returned
   - iOS → Phantom deeplink → user approves → callback with signature
5. Show success toast with Explorer link
6. Invalidate portfolio queries (TanStack Query)
```

---

## Critical Platform Notes

| Feature | Android | iOS |
|---|---|---|
| MWA | ✅ Native support | ❌ Not available |
| Phantom deeplink | ✅ Fallback | ✅ Primary method |
| Solflare deeplink | ✅ Fallback | ✅ Supported |
| Transaction signing | MWA popup | App switch via deeplink |
| Reauthorization | Auth token | Session token |

**Always wrap wallet code in Platform.OS checks.** Never assume MWA is available.
