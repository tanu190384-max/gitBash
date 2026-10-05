import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { REPORT_STATUSES, type ReportStatus } from '../types/domain.js';

export interface IIncidentTimeline extends Document {
  _id: mongoose.Types.ObjectId;
  reportId: mongoose.Types.ObjectId;
  status: ReportStatus;
  note?: string;
  actorId?: mongoose.Types.ObjectId | null;
  actorName: string;
  actorRole: string;
  createdAt: Date;
}

const timelineSchema = new Schema<IIncidentTimeline>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'DisasterReport', required: true, index: true },
    status: { type: String, enum: REPORT_STATUSES, required: true },
    note: { type: String, maxlength: 600 },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, default: 'System' },
    actorRole: { type: String, default: 'system' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

timelineSchema.index({ reportId: 1, createdAt: 1 });

export const IncidentTimeline: Model<IIncidentTimeline> =
  mongoose.models.IncidentTimeline ||
  mongoose.model<IIncidentTimeline>('IncidentTimeline', timelineSchema);
