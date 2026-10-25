import { parseAllowedDomains } from '../../shared/domain';

// Expo inlines variables named EXPO_PUBLIC_* at build time. They must be
// referenced statically (process.env.EXPO_PUBLIC_X), not via a dynamic key.
// Nothing secret belongs in here: these values end up in the client bundle.

export const ALLOWED_DOMAINS = parseAllowedDomains(
  process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit'
);

// '' means "same origin" (the deployed website). Native builds need the full
// URL of the deployed site, e.g. https://your-site.netlify.app
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

// Development convenience only: set to "false" to let the client continue when
// the API is unreachable (e.g. running `expo start` without Netlify Functions).
// Keep it unset in production so the server check is always enforced.
export const REQUIRE_API = process.env.EXPO_PUBLIC_REQUIRE_API !== 'false';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const googleClientIds = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};
