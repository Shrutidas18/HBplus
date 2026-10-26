'use strict';

const { getAdmin } = require('./firebaseAdmin');
const {
  ACCESS_DENIED_MESSAGE,
  isAllowedEmail,
  parseAllowedDomains,
} = require('../shared/domain');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function bearerToken(event) {
  const header =
    (event.headers && (event.headers.authorization || event.headers.Authorization)) ||
    '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

/**
 * Server-side enforcement. Verifies, in order:
 *   1. a Bearer token is present
 *   2. the token is a genuine, unexpired Firebase ID token (signature checked)
 *   3. it was issued for a Google sign-in
 *   4. Google reports the email as verified
 *   5. the email belongs to the allowed domain
 *
 * Returns { ok: true, decoded } or { ok: false, response }.
 */
async function authenticate(event) {
  const token = bearerToken(event);
  if (!token) {
    return {
      ok: false,
      response: json(401, { code: 'unauthenticated', message: 'Missing bearer token.' }),
    };
  }

 
  let decoded;
  try {
    decoded = await getAdmin().auth().verifyIdToken(token);
  } catch (err) {
    console.error(
      'Firebase token verification failed:',
      err.code,
      err.message
    );

    return {
      ok: false,
      response: json(401, {
        code: 'invalid_token',
        message: 'Invalid or expired token.',
      }),
    };
  }


  const viaGoogle = decoded.firebase && decoded.firebase.sign_in_provider === 'google.com';
  const domains = parseAllowedDomains(process.env.ALLOWED_DOMAIN || 'hbplus.fit');

  if (!viaGoogle || decoded.email_verified !== true || !isAllowedEmail(decoded.email, domains)) {
    return {
      ok: false,
      response: json(403, { code: 'domain_restricted', message: ACCESS_DENIED_MESSAGE }),
    };
  }

  return { ok: true, decoded };
}

module.exports = { authenticate, json };
