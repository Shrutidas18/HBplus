'use strict';

/**
 * POST /api/me
 *
 * Verifies the caller's Firebase ID token + email domain, then creates or
 * updates their profile document in Firestore and returns it (with role).
 *
 * Role handling:
 *   - first sign-in creates users/{uid} with role "user"
 *   - emails listed in ADMIN_EMAILS are promoted to "admin"
 *   - roles are only ever written here, on the server (see firestore.rules)
 */

const { getAdmin } = require('../../server/firebaseAdmin');
const { authenticate, json } = require('../../server/verify');
const { parseAllowedDomains } = require('../../shared/domain');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return json(405, { code: 'method_not_allowed', message: 'Use POST.' });
  }

  try {
    const result = await authenticate(event);
    if (!result.ok) return result.response;

    const { decoded } = result;
    const admin = getAdmin();
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;

    const email = decoded.email.toLowerCase();
    const adminEmails = parseAllowedDomains(process.env.ADMIN_EMAILS || ''); // same lower-case/comma parser
    const shouldBeAdmin = adminEmails.includes(email);

    const ref = db.collection('users').doc(decoded.uid);
    const snap = await ref.get();

    let role;
    if (!snap.exists) {
      role = shouldBeAdmin ? 'admin' : 'user';
      await ref.set({
        uid: decoded.uid,
        email,
        name: decoded.name || null,
        photoURL: decoded.picture || null,
        role,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      });
    } else {
      role = snap.data().role === 'admin' || shouldBeAdmin ? 'admin' : 'user';
      await ref.update({
        name: decoded.name || null,
        photoURL: decoded.picture || null,
        role,
        lastLoginAt: FieldValue.serverTimestamp(),
      });
    }

    return json(200, {
      user: {
        uid: decoded.uid,
        email,
        name: decoded.name || null,
        photoURL: decoded.picture || null,
        role,
        lastLoginAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('me function failed:', err);
    return json(500, { code: 'server_error', message: 'Something went wrong.' });
  }
};