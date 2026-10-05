import type { Types } from 'mongoose';
import { IncidentTimeline } from '../models/IncidentTimeline.js';
import type { ReportStatus } from '../types/domain.js';
import type { AuthUser } from '../middleware/auth.js';

export interface TimelineActor {
  id?: string | Types.ObjectId | null;
  name: string;
  role: string;
}

export const SYSTEM_ACTOR: TimelineActor = { id: null, name: 'RESQ System', role: 'system' };

export const actorFromUser = (user: AuthUser): TimelineActor => ({
  id: user.id,
  name: user.name,
  role: user.role,
});

export async function recordTimelineEvent(
  reportId: string | Types.ObjectId,
  status: ReportStatus,
  actor: TimelineActor = SYSTEM_ACTOR,
  note?: string,
) {
  return IncidentTimeline.create({
    reportId,
    status,
    note,
    actorId: actor.id ?? null,
    actorName: actor.name,
    actorRole: actor.role,
  });
}

export const getTimeline = (reportId: string | Types.ObjectId) =>
  IncidentTimeline.find({ reportId }).sort({ createdAt: 1 }).lean();
