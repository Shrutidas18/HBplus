'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ACCESS_DENIED_MESSAGE,
  isAllowedEmail,
  parseAllowedDomains,
} = require('../shared/domain');

const DOMAIN = 'hbplus.fit';

test('allows an email on the allowed domain', () => {
  assert.equal(isAllowedEmail('example@hbplus.fit', DOMAIN), true);
});

test('is case-insensitive and ignores surrounding whitespace', () => {
  assert.equal(isAllowedEmail('  Example@HBPlus.FIT ', DOMAIN), true);
});

test('rejects a personal gmail address', () => {
  assert.equal(isAllowedEmail('example@gmail.com', DOMAIN), false);
});

test('rejects look-alike domains (suffix attack)', () => {
  assert.equal(isAllowedEmail('me@evilhbplus.fit', DOMAIN), false);
  assert.equal(isAllowedEmail('me@hbplus.fit.evil.com', DOMAIN), false);
});

test('rejects subdomains unless explicitly allowed', () => {
  assert.equal(isAllowedEmail('me@mail.hbplus.fit', DOMAIN), false);
});

test('rejects malformed addresses', () => {
  assert.equal(isAllowedEmail('@hbplus.fit', DOMAIN), false);
  assert.equal(isAllowedEmail('a@b@hbplus.fit', DOMAIN), false);
  assert.equal(isAllowedEmail('hbplus.fit', DOMAIN), false);
  assert.equal(isAllowedEmail('', DOMAIN), false);
});

test('rejects non-string input', () => {
  assert.equal(isAllowedEmail(null, DOMAIN), false);
  assert.equal(isAllowedEmail(undefined, DOMAIN), false);
  assert.equal(isAllowedEmail(42, DOMAIN), false);
});

test('fails closed when no domain is configured', () => {
  assert.equal(isAllowedEmail('example@hbplus.fit', ''), false);
  assert.equal(isAllowedEmail('example@hbplus.fit', undefined), false);
  assert.equal(isAllowedEmail('example@hbplus.fit', []), false);
});

test('parseAllowedDomains handles "@", spaces and multiple values', () => {
  assert.deepEqual(parseAllowedDomains('@HBPlus.fit, other.com ,'), [
    'hbplus.fit',
    'other.com',
  ]);
  assert.deepEqual(parseAllowedDomains(''), []);
});

test('supports more than one allowed domain', () => {
  const domains = parseAllowedDomains('hbplus.fit,partner.com');
  assert.equal(isAllowedEmail('a@partner.com', domains), true);
  assert.equal(isAllowedEmail('a@gmail.com', domains), false);
});

test('exposes the exact error message required by the assignment', () => {
  assert.equal(
    ACCESS_DENIED_MESSAGE,
    'Access restricted. Please login using your official domain email.'
  );
});
