import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { ALERT_SEVERITIES, type AlertSeverity } from '../types/domain.js';

export type NotificationKind = 'BROADCAST' | 'PERSONAL';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  kind: NotificationKind;
  title: string;
  message: string;
  severity: AlertSeverity;
  targetArea?: string;
  /** Null for broadcasts; set for status updates aimed at one reporter. */
  userId?: mongoose.Types.ObjectId | null;
  reportId?: mongoose.Types.ObjectId | null;
  createdBy?: mongoose.Types.ObjectId | null;
  readBy: mongoose.Types.ObjectId[];
  active: boolean;
  expiresAt?: Date;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    kind: { type: String, enum: ['BROADCAST', 'PERSONAL'], default: 'BROADCAST', index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    severity: { type: String, enum: ALERT_SEVERITIES, default: 'INFO', index: true },
    targetArea: { type: String, trim: true, maxlength: 140 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'DisasterReport', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    active: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema);
