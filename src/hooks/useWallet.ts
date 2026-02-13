import { Platform } from 'react-native';
import { useCallback, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useWalletStore } from '@/stores/walletStore';
import { connectMWA, signAndSendMWA } from '@/services/wallet/mwa';
import {
  connectPhantom,
  handlePhantomConnect,
  disconnectPhantom,
} from '@/services/wallet/phantom';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

export function useWallet() {
  const {
    connected,
    address,
    authToken,
    balance,
    setConnected,
    setDisconnected,
  } = useWalletStore();

  // Listen for Phantom deep link callbacks
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.includes('onConnect')) {
        try {
          const result = handlePhantomConnect(url);
          setConnected(result.publicKey);
        } catch (error) {
          console.error('Phantom connect callback failed:', error);
        }
      }
      if (url.includes('onDisconnect')) {
        setDisconnected();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [setConnected, setDisconnected]);

  const connect = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const result = await connectMWA();
        setConnected(result.address, result.authToken);
      } else {
        // iOS + Expo Go: Phantom deeplink
        await connectPhantom();
        // Connection result handled via deep link callback above
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }, [setConnected]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectPhantom();
    } catch {
      // Ignore disconnect errors
    }
    setDisconnected();
  }, [setDisconnected]);

  const signAndSend = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
    ): Promise<string> => {
      if (!connected) throw new Error('Wallet not connected');

      if (Platform.OS === 'android') {
        return signAndSendMWA(transaction, authToken ?? undefined);
      } else {
        throw new Error('iOS transaction signing not yet implemented');
      }
    },
    [connected, authToken],
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
