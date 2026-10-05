import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Never trust the client filename — generate our own.
    const ext = ALLOWED_MIME.get(file.mimetype) ?? '.bin';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

export const uploadIncidentImage = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest('Only JPG, PNG and WebP images are accepted.'));
      return;
    }
    cb(null, true);
  },
}).single('image');

/** Public URL for a stored file. Swap this when moving to object storage. */
export const publicUrlForUpload = (filename: string) => `/uploads/${filename}`;

export const removeUpload = (filename: string) => {
  const target = path.join(env.UPLOAD_DIR, path.basename(filename));
  fs.promises.unlink(target).catch(() => undefined);
};
