import type { Response } from 'express';

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, 201);
}

export function paginated<T>(res: Response, items: T[], page: number, limit: number, total: number) {
  const payload: Paginated<T> = {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
  return ok(res, payload);
}

export function fail(res: Response, status: number, message: string, error?: unknown) {
  return res.status(status).json({ success: false, message, error: error ?? null });
}
