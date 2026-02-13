import * as Linking from 'expo-linking';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

const onConnectRedirectLink = Linking.createURL('onConnect');
const onDisconnectRedirectLink = Linking.createURL('onDisconnect');

const buildUrl = (path: string, params: URLSearchParams) =>
  `https://phantom.app/ul/v1/${path}?${params.toString()}`;

const dappKeyPair = nacl.box.keyPair();

let sharedSecret: Uint8Array | null = null;
let session: string | null = null;

export async function connectPhantom(): Promise<void> {
  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    cluster: 'mainnet-beta',
    app_url: 'https://phantom.app',
    redirect_link: onConnectRedirectLink,
  });

  await Linking.openURL(buildUrl('connect', params));
}

export function handlePhantomConnect(url: string): {
  publicKey: string;
  session: string;
} {
  const parsed = new URL(url);
  const params = parsed.searchParams;

  const phantomPubKey = params.get('phantom_encryption_public_key')!;
  const nonce = params.get('nonce')!;
  const data = params.get('data')!;

  const secret = nacl.box.before(
    bs58.decode(phantomPubKey),
    dappKeyPair.secretKey,
  );

  const decrypted = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    secret,
  );

  if (!decrypted) throw new Error('Failed to decrypt Phantom payload');

  const payload = JSON.parse(Buffer.from(decrypted).toString('utf8'));

  sharedSecret = secret;
  session = payload.session;

  return {
    publicKey: payload.public_key,
    session: payload.session,
  };
}

export async function disconnectPhantom(): Promise<void> {
  if (!session || !sharedSecret) return;

  const payload = { session };
  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret,
  );

  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    nonce: bs58.encode(nonce),
    redirect_link: onDisconnectRedirectLink,
    payload: bs58.encode(encryptedPayload),
  });

  await Linking.openURL(buildUrl('disconnect', params));

  session = null;
  sharedSecret = null;
}
