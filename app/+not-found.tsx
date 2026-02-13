import { Redirect } from 'expo-router';

/**
 * Catch-all for unmatched routes.
 * Phantom wallet deeplinks redirect to /onConnect and /onDisconnect
 * which don't have route files — the actual handling happens via
 * Linking.addEventListener in useWallet.ts. This just redirects
 * back to the home screen so the user doesn't see a "Page not found" error.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
