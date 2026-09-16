import { createHash, timingSafeEqual } from 'node:crypto';
// Random 256-bit preproduction password; never accept client-supplied identity headers.
export function authenticate(header) {
  const expected = process.env.PREPROD_PASSWORD_SHA256;
  const email = process.env.PREPROD_ADMIN_EMAIL;
  if (!expected || !/^[a-f0-9]{64}$/.test(expected) || !email || !header?.startsWith('Basic ') || header.length > 2048) return null;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator < 0 || decoded.slice(0, separator) !== 'kevin') return null;
  const actual = createHash('sha256').update(decoded.slice(separator + 1)).digest();
  if (!timingSafeEqual(actual, Buffer.from(expected, 'hex'))) return null;
  return { userId: 'preprod-kevin', displayName: 'Kevin', email, fullName: 'Kevin' };
}
