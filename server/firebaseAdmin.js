'use strict';

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

/**
 * Initialises firebase-admin once per serverless container.
 * Credentials come from environment variables, never from the repo.
 *
 * Returns the same shape the rest of the code already uses:
 *   getAdmin().auth()
 *   getAdmin().firestore()
 *   getAdmin().firestore.FieldValue
 */
function getAdmin() {
  if (!getApps().length) {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
      process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error(
        'Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY'
      );
    }

    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Env vars store newlines as the two characters "\n"; restore them.
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  const firestore = () => getFirestore();
  firestore.FieldValue = FieldValue;

  return { auth: () => getAuth(), firestore };
}

module.exports = { getAdmin };