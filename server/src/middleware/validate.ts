import type { RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

type Source = 'body' | 'query' | 'params';

/**
 * Parses and REPLACES the request segment with the validated result, so
 * controllers always work with coerced, trusted values.
 */
export const validate =
  <T extends ZodTypeAny>(schema: T, source: Source = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    // req.query is a getter in Express 5-style setups; assign defensively.
    Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true });
    next();
  };

export type Infer<T extends ZodTypeAny> = z.infer<T>;
