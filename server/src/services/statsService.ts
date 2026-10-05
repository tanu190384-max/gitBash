import { DisasterReport } from '../models/DisasterReport.js';
import { EmergencyResource } from '../models/EmergencyResource.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import {
  DISASTER_TYPES,
  REPORT_STATUSES,
  RESOURCE_TYPES,
  SEVERITY_LEVELS,
  TERMINAL_STATUSES,
} from '../types/domain.js';

const ACTIVE_STATUSES = REPORT_STATUSES.filter((s) => !TERMINAL_STATUSES.includes(s));

export interface AdminStats {
  activeIncidents: number;
  criticalIncidents: number;
  peopleAffected: number;
  availableResources: number;
  totalResources: number;
  resolvedIncidents: number;
  pendingVerification: number;
  totalUsers: number;
  activeAlerts: number;
  /** Percentage of incidents resolved, 0–100. */
  resolutionRate: number;
  avgResponseHours: number | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    activeIncidents,
    criticalIncidents,
    resolvedIncidents,
    pendingVerification,
    totalIncidents,
    affectedAgg,
    resourceAgg,
    totalUsers,
    activeAlerts,
    responseAgg,
  ] = await Promise.all([
    DisasterReport.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
    DisasterReport.countDocuments({ severity: 'CRITICAL', status: { $in: ACTIVE_STATUSES } }),
    DisasterReport.countDocuments({ status: 'RESOLVED' }),
    DisasterReport.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
    DisasterReport.countDocuments({}),
    DisasterReport.aggregate<{ total: number }>([
      { $match: { status: { $in: ACTIVE_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$peopleAffected' } } },
    ]),
    EmergencyResource.aggregate<{ available: number; capacity: number; count: number }>([
      {
        $group: {
          _id: null,
          available: { $sum: { $cond: [{ $eq: ['$status', 'OFFLINE'] }, 0, '$availability'] } },
          capacity: { $sum: '$capacity' },
          count: { $sum: 1 },
        },
      },
    ]),
    User.countDocuments({}),
    Notification.countDocuments({ kind: 'BROADCAST', active: true }),
    DisasterReport.aggregate<{ avgMs: number }>([
      { $match: { resolvedAt: { $ne: null } } },
      { $group: { _id: null, avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } },
    ]),
  ]);

  const avgMs = responseAgg[0]?.avgMs;

  return {
    activeIncidents,
    criticalIncidents,
    peopleAffected: affectedAgg[0]?.total ?? 0,
    availableResources: resourceAgg[0]?.available ?? 0,
    totalResources: resourceAgg[0]?.count ?? 0,
    resolvedIncidents,
    pendingVerification,
    totalUsers,
    activeAlerts,
    resolutionRate: totalIncidents ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
    avgResponseHours: avgMs ? Math.round((avgMs / 3_600_000) * 10) / 10 : null,
  };
}

export interface AnalyticsPayload {
  byType: { key: string; label: string; count: number }[];
  bySeverity: { key: string; count: number }[];
  byStatus: { key: string; count: number }[];
  overTime: { date: string; reports: number; resolved: number }[];
  peopleByType: { key: string; people: number }[];
  resourceAvailability: { key: string; capacity: number; available: number }[];
}

export async function getAnalytics(days = 30): Promise<AnalyticsPayload> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const [typeAgg, severityAgg, statusAgg, timeAgg, peopleAgg, resourceAgg] = await Promise.all([
    DisasterReport.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$disasterType', count: { $sum: 1 } } },
    ]),
    DisasterReport.aggregate<{ _id: string | null; count: number }>([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]),
    DisasterReport.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    DisasterReport.aggregate<{ _id: string; reports: number; resolved: number }>([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          reports: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    DisasterReport.aggregate<{ _id: string; people: number }>([
      { $group: { _id: '$disasterType', people: { $sum: '$peopleAffected' } } },
      { $sort: { people: -1 } },
    ]),
    EmergencyResource.aggregate<{ _id: string; capacity: number; available: number }>([
      {
        $group: {
          _id: '$type',
          capacity: { $sum: '$capacity' },
          available: { $sum: { $cond: [{ $eq: ['$status', 'OFFLINE'] }, 0, '$availability'] } },
        },
      },
    ]),
  ]);

  const map = <T extends { _id: string | null }>(rows: T[]) =>
    new Map(rows.map((r) => [r._id ?? 'UNASSESSED', r]));

  const typeMap = map(typeAgg);
  const severityMap = map(severityAgg);
  const statusMap = map(statusAgg);
  const peopleMap = map(peopleAgg);
  const resourceMap = map(resourceAgg);

  return {
    // Every enum member is emitted (count 0 included) so charts have stable axes.
    byType: DISASTER_TYPES.map((key) => ({
      key,
      label: humanise(key),
      count: typeMap.get(key)?.count ?? 0,
    })).filter((d) => d.count > 0),
    bySeverity: SEVERITY_LEVELS.map((key) => ({ key, count: severityMap.get(key)?.count ?? 0 })),
    byStatus: REPORT_STATUSES.map((key) => ({ key, count: statusMap.get(key)?.count ?? 0 })),
    overTime: fillDateGaps(timeAgg, days),
    peopleByType: DISASTER_TYPES.map((key) => ({ key, people: peopleMap.get(key)?.people ?? 0 }))
      .filter((d) => d.people > 0)
      .sort((a, b) => b.people - a.people),
    resourceAvailability: RESOURCE_TYPES.map((key) => ({
      key,
      capacity: resourceMap.get(key)?.capacity ?? 0,
      available: resourceMap.get(key)?.available ?? 0,
    })).filter((r) => r.capacity > 0),
  };
}

/** Mongo only returns days that have data; charts need a continuous axis. */
function fillDateGaps(
  rows: { _id: string; reports: number; resolved: number }[],
  days: number,
): { date: string; reports: number; resolved: number }[] {
  const byDate = new Map(rows.map((r) => [r._id, r]));
  const out: { date: string; reports: number; resolved: number }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const row = byDate.get(key);
    out.push({ date: key, reports: row?.reports ?? 0, resolved: row?.resolved ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

const humanise = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
