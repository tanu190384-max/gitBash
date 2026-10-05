import type { Types } from 'mongoose';
import { Notification } from '../models/Notification.js';
import type { AlertSeverity, ReportStatus, Severity } from '../types/domain.js';
import { logger } from '../utils/logger.js';

const SEVERITY_TO_ALERT: Record<Severity, AlertSeverity> = {
  LOW: 'INFO',
  MODERATE: 'WARNING',
  HIGH: 'DANGER',
  CRITICAL: 'CRITICAL',
};

const STATUS_COPY: Record<ReportStatus, string> = {
  SUBMITTED: 'has been received and is queued for review',
  UNDER_REVIEW: 'is being reviewed by the response team',
  VERIFIED: 'has been verified by a coordinator',
  RESPONSE_ASSIGNED: 'has emergency resources assigned to it',
  IN_PROGRESS: 'has an active response underway',
  RESOLVED: 'has been marked resolved',
  REJECTED: 'could not be verified and was closed',
};

/** Tells the reporter their incident moved to a new stage. Never throws. */
export async function notifyReporterOfStatus(params: {
  userId: Types.ObjectId | string;
  reportId: Types.ObjectId | string;
  reportCode: string;
  status: ReportStatus;
  note?: string;
}) {
  try {
    await Notification.create({
      kind: 'PERSONAL',
      title: `Report ${params.reportCode} — ${humanStatus(params.status)}`,
      message: `Your report ${params.reportCode} ${STATUS_COPY[params.status]}.${
        params.note ? ` Coordinator note: ${params.note}` : ''
      }`,
      severity: params.status === 'REJECTED' ? 'WARNING' : 'INFO',
      userId: params.userId,
      reportId: params.reportId,
    });
  } catch (err) {
    logger.warn('Failed to create status notification:', err);
  }
}

/** Raises a broadcast alert when an incident lands as HIGH or CRITICAL. */
export async function notifyHighSeverityIncident(params: {
  reportId: Types.ObjectId | string;
  reportCode: string;
  severity: Severity;
  disasterLabel: string;
  address: string;
}) {
  if (params.severity !== 'HIGH' && params.severity !== 'CRITICAL') return;
  try {
    await Notification.create({
      kind: 'BROADCAST',
      title: `${params.severity} severity ${params.disasterLabel.toLowerCase()} reported`,
      message: `Incident ${params.reportCode} near ${params.address} has been assessed as ${params.severity} severity. Avoid the area and follow instructions from local authorities.`,
      severity: SEVERITY_TO_ALERT[params.severity],
      targetArea: params.address,
      reportId: params.reportId,
    });
  } catch (err) {
    logger.warn('Failed to create severity broadcast:', err);
  }
}

const humanStatus = (s: ReportStatus) =>
  s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
