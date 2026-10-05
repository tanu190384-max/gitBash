import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const disabled = env.isTest;

const make = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => disabled,
    handler: (_req, res) => res.status(429).json({ success: false, message, error: null }),
  });

/** Broad protection on every API route. */
export const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests. Please slow down.');

/** Credential endpoints get a much tighter budget. */
export const authLimiter = make(
  15 * 60 * 1000,
  20,
  'Too many authentication attempts. Please try again in a few minutes.',
);

/** Report submission — generous enough for a real emergency, tight enough to stop spam. */
export const reportLimiter = make(
  60 * 60 * 1000,
  30,
  'You have submitted a lot of reports recently. Please contact the control room directly.',
);
