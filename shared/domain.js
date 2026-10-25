'use strict';

/**
 * Domain validation: the single source of truth.
 *
 * This file is plain CommonJS on purpose so that BOTH the React Native app
 * (bundled by Metro) and the Node.js serverless functions can import it.
 * The same rule therefore runs on the client and on the server.
 */

const ACCESS_DENIED_MESSAGE =
  'Access restricted. Please login using your official domain email.';

/**
 * Turns "hbplus.fit" or "@hbplus.fit, other.com" into ["hbplus.fit", "other.com"].
 */
function parseAllowedDomains(value) {
  return String(value || '')
    .split(',')
    .map((d) => d.trim().replace(/^@/, '').toLowerCase())
    .filter(Boolean);
}

/**
 * True only if the email has exactly one "@" and the part after it is EXACTLY
 * one of the allowed domains (case-insensitive).
 *
 * Why not `email.endsWith('hbplus.fit')`?  Because "me@evilhbplus.fit" would
 * pass. Comparing the full domain after the "@" avoids that class of bug,
 * and it is equivalent to `endsWith('@hbplus.fit')`.
 *
 * Fails closed: if no domain is configured, nobody is allowed in.
 */
function isAllowedEmail(email, allowedDomains) {
  if (typeof email !== 'string') return false;

  const domains = Array.isArray(allowedDomains)
    ? allowedDomains
    : parseAllowedDomains(allowedDomains);
  if (domains.length === 0) return false;

  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf('@');

  // needs a local part, and only one "@"
  if (at < 1 || value.indexOf('@') !== at) return false;

  return domains.includes(value.slice(at + 1));
}

module.exports = { ACCESS_DENIED_MESSAGE, parseAllowedDomains, isAllowedEmail };
