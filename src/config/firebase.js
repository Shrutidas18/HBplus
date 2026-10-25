import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './env';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Token handling: we never touch tokens ourselves. The Firebase SDK keeps and
// refreshes them:
//   web    -> IndexedDB (browser default)
//   mobile -> AsyncStorage via getReactNativePersistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // Fast Refresh re-runs this module; auth is already initialised then.
    auth = getAuth(app);
  }
}

export { app, auth };
