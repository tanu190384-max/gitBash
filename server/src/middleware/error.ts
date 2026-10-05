import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { fail } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req: Request, res: Response) {
  return fail(res, 404, `No API route matches ${req.method} ${req.originalUrl}`);
}

/** Single place where every thrown error becomes a consistent JSON envelope. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return fail(res, err.status, err.message, err.details ?? null);
  }

  if (err instanceof ZodError) {
    return fail(res, 422, 'Please correct the highlighted fields.', flattenZod(err));
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Image is too large. Maximum size is ${env.MAX_UPLOAD_MB}MB.`
        : `Upload failed: ${err.message}`;
    return fail(res, 400, message);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
    return fail(res, 422, 'Please correct the highlighted fields.', details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return fail(res, 400, `"${err.value}" is not a valid ${err.path}.`);
  }

  // Duplicate key
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    const keys = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {});
    return fail(res, 409, `That ${keys[0] ?? 'value'} is already in use.`);
  }

  logger.error('Unhandled error:', err);
  return fail(
    res,
    500,
    'Something went wrong on our side. Please try again.',
    env.isProd ? null : { message: (err as Error)?.message, stack: (err as Error)?.stack },
  );
}

/** field -> first message, which is what the client forms render. */
function flattenZod(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
