import crypto from 'node:crypto';

/**
 * Human-friendly incident reference, e.g. RSQ-7K3F. Collisions are handled by a
 * unique index on the field plus a bounded retry at insert time.
 */
export function generateReportCode(): string {
  const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O to avoid misreads
  let out = '';
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) out += alphabet[bytes[i] % alphabet.length];
  return `RSQ-${out}`;
}
