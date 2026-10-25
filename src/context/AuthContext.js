import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ALLOWED_DOMAINS, REQUIRE_API } from '../config/env';
import { ACCESS_DENIED_MESSAGE, isAllowedEmail } from '../../shared/domain';
import { ApiError, fetchProfile } from '../services/api';
import useGoogleSignIn from '../hooks/useGoogleSignIn';

const AuthContext = createContext(null);

const IGNORED_ERRORS = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'cancelled',
];

function friendlyMessage(error) {
  switch (error && error.code) {
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Please allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/unauthorized-domain':
      return 'This website is not authorised for sign-in yet. Add it to Firebase authorised domains.';
    case 'config-missing':
      return 'Google sign-in is not configured for this platform yet.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // verified profile incl. role
  const [initializing, setInitializing] = useState(true); // restoring a saved session
  const [busy, setBusy] = useState(false); // sign-in / verification in progress
  const [error, setError] = useState(null);

  // Reject a user: clear state, show the message, end the Firebase session.
  const reject = useCallback(async (message) => {
    setUser(null);
    setError(message);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // nothing else to do
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!cancelled) {
          setUser(null);
          setBusy(false);
          setInitializing(false);
        }
        return;
      }

      setBusy(true);
      try {
        // Layer 2: client-side check (fast feedback; not a security boundary).
        if (
          !firebaseUser.emailVerified ||
          !isAllowedEmail(firebaseUser.email, ALLOWED_DOMAINS)
        ) {
          await reject(ACCESS_DENIED_MESSAGE);
          return;
        }

        // Layer 3: the server verifies the token signature and the domain again,
        // then returns the profile and role.
        const idToken = await firebaseUser.getIdToken();
        let profile;
        try {
          profile = await fetchProfile(idToken);
        } catch (e) {
          if (e instanceof ApiError && e.status === 403) {
            await reject(ACCESS_DENIED_MESSAGE);
            return;
          }
          if (e instanceof ApiError && e.status === 401) {
            await reject('Your session could not be verified. Please sign in again.');
            return;
          }
          if (REQUIRE_API) {
            await reject('Unable to verify your account right now. Please try again.');
            return;
          }
          // dev-only fallback (EXPO_PUBLIC_REQUIRE_API=false)
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'user',
          };
        }

        if (!cancelled) {
          setError(null);
          setUser(profile);
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
          setInitializing(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [reject]);

  const handleSignInError = useCallback((e) => {
    setBusy(false);
    if (e && IGNORED_ERRORS.includes(e.code)) return; // user closed the popup
    setError(friendlyMessage(e));
  }, []);

  const { signInWithGoogle, ready } = useGoogleSignIn({ onError: handleSignInError });

  const signIn = useCallback(async () => {
    setError(null);
    setBusy(true);
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  const getIdToken = useCallback(
    async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
    []
  );

  const value = useMemo(
    () => ({ user, initializing, busy, error, ready, signIn, signOut, getIdToken }),
    [user, initializing, busy, error, ready, signIn, signOut, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
