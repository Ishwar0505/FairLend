import { Transaction, VersionedTransaction } from '@solana/web3.js';

const APP_IDENTITY = {
  name: 'FairLend',
  uri: 'https://fairlend.app',
  icon: 'favicon.ico',
};

async function getMWA() {
  const mwa = await import(
    '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
  );
  return mwa;
}

export async function connectMWA(): Promise<{
  address: string;
  authToken: string;
}> {
  const { transact } = await getMWA();
  const result = await transact(async (wallet) => {
    const authResult = await wallet.authorize({
      chain: 'solana:mainnet',
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
  authToken: string,
): Promise<{ address: string; authToken: string }> {
  const { transact } = await getMWA();
  const result = await transact(async (wallet) => {
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
  authToken?: string,
): Promise<string> {
  const { transact } = await getMWA();
  const signatures = await transact(async (wallet) => {
    if (authToken) {
      await wallet.reauthorize({
        auth_token: authToken,
        identity: APP_IDENTITY,
      });
    } else {
      await wallet.authorize({
        chain: 'solana:mainnet',
        identity: APP_IDENTITY,
      });
    }

    return wallet.signAndSendTransactions({
      transactions: [transaction],
    });
  });

  return signatures[0];
}

export async function signMessageMWA(
  message: Uint8Array,
  authToken?: string,
): Promise<Uint8Array> {
  const { transact } = await getMWA();
  const result = await transact(async (wallet) => {
    const authResult = authToken
      ? await wallet.reauthorize({
          auth_token: authToken,
          identity: APP_IDENTITY,
        })
      : await wallet.authorize({
          chain: 'solana:mainnet',
          identity: APP_IDENTITY,
        });

    const signed = await wallet.signMessages({
      addresses: [authResult.accounts[0].address],
      payloads: [message],
    });

    return signed[0];
  });

  return result;
}
