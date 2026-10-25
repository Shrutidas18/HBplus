'use strict';

/**
 * GET /api/users   (admin only)
 *
 * Lists the people who have signed in. Role-based access is enforced HERE on
 * the server by reading the caller's role from Firestore; hiding the panel in
 * the UI is only a convenience.
 */

const { getAdmin } = require('../../server/firebaseAdmin');
const { authenticate, json } = require('../../server/verify');

function toIso(value) {
  return value && typeof value.toDate === 'function' ? value.toDate().toISOString() : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { code: 'method_not_allowed', message: 'Use GET.' });
  }

  try {
    const result = await authenticate(event);
    if (!result.ok) return result.response;

    const db = getAdmin().firestore();

    const me = await db.collection('users').doc(result.decoded.uid).get();
    if (!me.exists || me.data().role !== 'admin') {
      return json(403, { code: 'forbidden', message: 'Admin access required.' });
    }

    const snap = await db.collection('users').orderBy('lastLoginAt', 'desc').limit(50).get();
    const users = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        uid: doc.id,
        email: d.email,
        name: d.name || null,
        photoURL: d.photoURL || null,
        role: d.role || 'user',
        createdAt: toIso(d.createdAt),
        lastLoginAt: toIso(d.lastLoginAt),
      };
    });

    return json(200, { users });
  } catch (err) {
    console.error('users function failed:', err);
    return json(500, { code: 'server_error', message: 'Something went wrong.' });
  }
};
