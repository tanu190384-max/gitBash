import { z } from 'zod';
import {
  ALERT_SEVERITIES,
  DISASTER_TYPES,
  REPORT_STATUSES,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  URGENCY_LEVELS,
} from '../types/domain.js';

// ─── Shared primitives ──────────────────────────────────────────────────────

const email = z.string().trim().toLowerCase().email('Enter a valid email address.');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.')
  .regex(/[A-Za-z]/, 'Password must contain a letter.')
  .regex(/[0-9]/, 'Password must contain a number.');

const latitude = z.coerce.number().min(-90, 'Latitude must be between -90 and 90.').max(90);
const longitude = z.coerce.number().min(-180, 'Longitude must be between -180 and 180.').max(180);

/** Multipart bodies arrive as strings, so every numeric field coerces. */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ─── Auth ───────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email,
  password,
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[\d+\-\s()]*$/, 'Enter a valid phone number.')
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: password,
});

// ─── Reports ────────────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  disasterType: z.enum(DISASTER_TYPES, { errorMap: () => ({ message: 'Choose a disaster type.' }) }),
  description: z
    .string()
    .trim()
    .min(15, 'Describe the situation in at least 15 characters.')
    .max(2000, 'Description must be under 2000 characters.'),
  address: z.string().trim().min(3, 'Enter a location.').max(240),
  latitude,
  longitude,
  peopleAffected: z.coerce
    .number({ invalid_type_error: 'Enter a number.' })
    .int('Enter a whole number.')
    .min(0, 'Cannot be negative.')
    .max(1_000_000, 'That number looks too large.'),
  urgency: z.enum(URGENCY_LEVELS, { errorMap: () => ({ message: 'Choose an urgency level.' }) }),
});

export const reportQuerySchema = paginationSchema.extend({
  status: z.enum(REPORT_STATUSES).optional(),
  disasterType: z.enum(DISASTER_TYPES).optional(),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
  urgency: z.enum(URGENCY_LEVELS).optional(),
  search: z.string().trim().max(120).optional(),
  mine: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'severity']).default('newest'),
});

export const updateStatusSchema = z.object({
  status: z.enum(REPORT_STATUSES),
  note: z.string().trim().max(600).optional(),
});

export const assignResourcesSchema = z.object({
  resourceIds: z.array(objectId).min(1, 'Select at least one resource.').max(20),
  note: z.string().trim().max(600).optional(),
});

// ─── Resources ──────────────────────────────────────────────────────────────

export const resourceSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(120),
  type: z.enum(RESOURCE_TYPES, { errorMap: () => ({ message: 'Choose a resource type.' }) }),
  address: z.string().trim().min(3, 'Enter an address.').max(240),
  latitude,
  longitude,
  contact: z.string().trim().min(3, 'Enter a contact number.').max(60),
  capacity: z.coerce.number().int().min(0).max(1_000_000),
  availability: z.coerce.number().int().min(0).max(1_000_000),
  status: z.enum(RESOURCE_STATUSES).default('ACTIVE'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export const resourceUpdateSchema = resourceSchema.partial();

export const resourceQuerySchema = paginationSchema.extend({
  type: z.enum(RESOURCE_TYPES).optional(),
  status: z.enum(RESOURCE_STATUSES).optional(),
  search: z.string().trim().max(120).optional(),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(24),
});

// ─── Emergency information ──────────────────────────────────────────────────

const bulletList = (label: string) =>
  z.array(z.string().trim().min(3).max(300)).min(1, `Add at least one ${label} step.`).max(12);

export const emergencyInfoSchema = z.object({
  disasterType: z.enum(DISASTER_TYPES),
  title: z.string().trim().min(3, 'Enter a title.').max(140),
  summary: z.string().trim().min(20, 'Write a short summary.').max(600),
  before: bulletList('"before"'),
  during: bulletList('"during"'),
  after: bulletList('"after"'),
  checklist: z.array(z.string().trim().min(2).max(200)).max(15).default([]),
  contacts: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(60),
        number: z.string().trim().min(2).max(30),
      }),
    )
    .max(10)
    .default([]),
  published: z.boolean().default(true),
});

export const emergencyInfoUpdateSchema = emergencyInfoSchema.partial();

// ─── Alerts ─────────────────────────────────────────────────────────────────

export const alertSchema = z.object({
  title: z.string().trim().min(4, 'Enter a headline.').max(140),
  message: z.string().trim().min(10, 'Write the announcement body.').max(1000),
  severity: z.enum(ALERT_SEVERITIES).default('INFO'),
  targetArea: z.string().trim().max(140).optional().or(z.literal('')),
  expiresAt: z.coerce.date().optional(),
});

// ─── Admin ──────────────────────────────────────────────────────────────────

export const userQuerySchema = paginationSchema.extend({
  role: z.enum(['user', 'admin']).optional(),
  search: z.string().trim().max(120).optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  active: z.boolean().optional(),
});

export const idParamSchema = z.object({ id: objectId });

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type EmergencyInfoInput = z.infer<typeof emergencyInfoSchema>;
