import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ALLOWED_DOMAINS } from '../config/env';

/**
 * Web: Google OAuth 2.0 through a Firebase popup.
 * Metro picks this file on web and useGoogleSignIn.native.js on Android/iOS.
 */
export default function useGoogleSignIn({ onError }) {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account',
        // `hd` only nudges Google's account picker towards the company domain.
        // It is a hint, NOT security: the real checks run after sign-in.
        ...(ALLOWED_DOMAINS.length === 1 ? { hd: ALLOWED_DOMAINS[0] } : {}),
      });
      await signInWithPopup(auth, provider);
    } catch (e) {
      onError(e);
    }
  };

  return { signInWithGoogle, ready: true };
}
