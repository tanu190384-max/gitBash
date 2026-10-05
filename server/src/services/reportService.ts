import type { FilterQuery } from 'mongoose';
import { DisasterReport, type IDisasterReport } from '../models/DisasterReport.js';
import { STATUS_TRANSITIONS, type ReportStatus } from '../types/domain.js';
import { ApiError } from '../utils/ApiError.js';
import { generateReportCode } from '../utils/reportCode.js';
import type { CreateReportInput } from '../validators/schemas.js';

export interface ReportFilters {
  status?: ReportStatus;
  disasterType?: string;
  severity?: string;
  urgency?: string;
  search?: string;
  userId?: string;
}

/** Creates the report, retrying only on a reference-code collision. */
export async function createReport(
  input: CreateReportInput & { imageUrl?: string },
  userId: string,
): Promise<IDisasterReport> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await DisasterReport.create({
        reportCode: generateReportCode(),
        userId,
        disasterType: input.disasterType,
        description: input.description,
        location: {
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
        },
        peopleAffected: input.peopleAffected,
        urgency: input.urgency,
        imageUrl: input.imageUrl,
        status: 'SUBMITTED',
      });
    } catch (err) {
      const duplicateCode =
        typeof err === 'object' &&
        err !== null &&
        (err as { code?: number }).code === 11000 &&
        'reportCode' in ((err as { keyValue?: Record<string, unknown> }).keyValue ?? {});
      if (!duplicateCode) throw err;
    }
  }
  throw ApiError.internal('Could not allocate a report reference. Please try again.');
}

export function buildReportQuery(filters: ReportFilters): FilterQuery<IDisasterReport> {
  const query: FilterQuery<IDisasterReport> = {};
  if (filters.status) query.status = filters.status;
  if (filters.disasterType) query.disasterType = filters.disasterType;
  if (filters.severity) query.severity = filters.severity;
  if (filters.urgency) query.urgency = filters.urgency;
  if (filters.userId) query.userId = filters.userId;
  if (filters.search) {
    const rx = new RegExp(escapeRegex(filters.search), 'i');
    query.$or = [{ reportCode: rx }, { description: rx }, { 'location.address': rx }];
  }
  return query;
}

export const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  severity: { severityScore: -1, createdAt: -1 },
};

/**
 * Guards the incident lifecycle. Returns the error message when a transition is
 * not allowed, or null when it is.
 */
export function validateStatusTransition(from: ReportStatus, to: ReportStatus): string | null {
  if (from === to) return `This report is already marked ${humanStatus(to)}.`;
  const allowed = STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return allowed.length
      ? `A ${humanStatus(from)} report can only move to: ${allowed.map(humanStatus).join(', ')}.`
      : `${humanStatus(from)} is a final state and cannot be changed.`;
  }
  return null;
}

/** Side-effects of a status change that belong on the report document itself. */
export function applyStatusSideEffects(report: IDisasterReport, status: ReportStatus) {
  report.status = status;
  if (status === 'VERIFIED' || status === 'RESPONSE_ASSIGNED' || status === 'IN_PROGRESS') {
    report.verified = true;
  }
  if (status === 'REJECTED') report.verified = false;
  if (status === 'RESOLVED') report.resolvedAt = new Date();
}

export const humanStatus = (s: string) =>
  s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
