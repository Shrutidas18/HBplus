import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { googleClientIds } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

/**
 * Android / iOS: Google OAuth 2.0 (OpenID Connect) through expo-auth-session,
 * then the Google ID token is exchanged for a Firebase session.
 */
export default function useGoogleSignIn({ onError }) {
  const configured = Boolean(
    Platform.OS === 'ios' ? googleClientIds.ios : googleClientIds.android
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // The hook throws if a client id for the current platform is undefined,
    // so fall back to a placeholder and report a friendly error on press.
    webClientId: googleClientIds.web || 'missing-web-client-id',
    androidClientId: googleClientIds.android || 'missing-android-client-id',
    iosClientId: googleClientIds.ios || 'missing-ios-client-id',
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params && response.params.id_token;
      if (!idToken) {
        onError({ code: 'missing-id-token' });
        return;
      }
      signInWithCredential(auth, GoogleAuthProvider.credential(idToken)).catch(onError);
    } else if (response.type === 'error') {
      onError(response.error || { code: 'oauth-error' });
    } else {
      // dismiss / cancel / locked
      onError({ code: 'cancelled' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signInWithGoogle = async () => {
    if (!configured) {
      onError({ code: 'config-missing' });
      return;
    }
    try {
      await promptAsync();
    } catch (e) {
      onError(e);
    }
  };

  return { signInWithGoogle, ready: Boolean(request) };
}
