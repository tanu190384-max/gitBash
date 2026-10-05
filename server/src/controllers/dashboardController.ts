import type { Request, Response } from 'express';
import { isAiEnabled } from '../ai/index.js';
import { isEphemeral } from '../config/db.js';
import { DisasterReport } from '../models/DisasterReport.js';
import { EmergencyResource } from '../models/EmergencyResource.js';
import { Notification } from '../models/Notification.js';
import { TERMINAL_STATUSES, REPORT_STATUSES } from '../types/domain.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { distanceKm } from '../utils/geo.js';

const ACTIVE_STATUSES = REPORT_STATUSES.filter((s) => !TERMINAL_STATUSES.includes(s));

/** Everything the user dashboard needs, in one round trip. */
export const userDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const lat = Number(req.query.latitude);
  const lng = Number(req.query.longitude);
  const hasOrigin = Number.isFinite(lat) && Number.isFinite(lng);

  const [active, resolved, total, recentReports, alerts, resources] = await Promise.all([
    DisasterReport.countDocuments({ userId, status: { $in: ACTIVE_STATUSES } }),
    DisasterReport.countDocuments({ userId, status: 'RESOLVED' }),
    DisasterReport.countDocuments({ userId }),
    DisasterReport.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('reportCode disasterType status severity severityScore location peopleAffected urgency createdAt')
      .lean(),
    Notification.find({
      active: true,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] },
        { $or: [{ kind: 'BROADCAST' }, { userId }] },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    EmergencyResource.find({ status: { $ne: 'OFFLINE' } })
      .select('name type address contact latitude longitude availability capacity status')
      .lean(),
  ]);

  const nearbyResources = hasOrigin
    ? resources
        .map((r) => ({ ...r, distanceKm: distanceKm({ latitude: lat, longitude: lng }, r) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 5)
    : resources.slice(0, 5);

  return ok(res, {
    stats: {
      activeReports: active,
      resolvedReports: resolved,
      totalReports: total,
      nearbyResources: resources.length,
      activeAlerts: alerts.filter((a) => a.kind === 'BROADCAST').length,
    },
    recentReports,
    alerts,
    nearbyResources,
    hasLocation: hasOrigin,
  });
});

/** Public capability probe — lets the client label demo mode and AI status. */
export const systemStatus = asyncHandler(async (_req: Request, res: Response) => {
  const demoReports = await DisasterReport.countDocuments({ isDemo: true });
  const totalReports = await DisasterReport.countDocuments({});
  return ok(res, {
    aiEnabled: isAiEnabled(),
    ephemeralDatabase: isEphemeral(),
    demoMode: totalReports > 0 && demoReports === totalReports,
    demoRecords: demoReports,
  });
});
