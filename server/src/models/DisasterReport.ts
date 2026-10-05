import mongoose, { Schema, type Document, type Model } from 'mongoose';
import {
  DISASTER_TYPES,
  REPORT_STATUSES,
  SEVERITY_LEVELS,
  URGENCY_LEVELS,
  type DisasterType,
  type ReportStatus,
  type Severity,
  type Urgency,
} from '../types/domain.js';

export interface IDisasterReport extends Document {
  _id: mongoose.Types.ObjectId;
  reportCode: string;
  userId: mongoose.Types.ObjectId;
  disasterType: DisasterType;
  description: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  peopleAffected: number;
  urgency: Urgency;
  imageUrl?: string;
  status: ReportStatus;
  verified: boolean;
  /** Denormalised from the latest assessment so lists and maps stay a single query. */
  severity?: Severity;
  severityScore?: number;
  assignedResources: mongoose.Types.ObjectId[];
  responseNote?: string;
  isDemo: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IDisasterReport>(
  {
    reportCode: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    disasterType: { type: String, enum: DISASTER_TYPES, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    location: {
      address: { type: String, required: true, trim: true, maxlength: 240 },
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
    },
    peopleAffected: { type: Number, required: true, min: 0, max: 1_000_000 },
    urgency: { type: String, enum: URGENCY_LEVELS, required: true, index: true },
    imageUrl: { type: String },
    status: { type: String, enum: REPORT_STATUSES, default: 'SUBMITTED', index: true },
    verified: { type: Boolean, default: false },
    severity: { type: String, enum: SEVERITY_LEVELS, index: true },
    severityScore: { type: Number, min: 0, max: 100 },
    assignedResources: [{ type: Schema.Types.ObjectId, ref: 'EmergencyResource' }],
    responseNote: { type: String, maxlength: 1000 },
    isDemo: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1, severity: 1 });

export const DisasterReport: Model<IDisasterReport> =
  mongoose.models.DisasterReport ||
  mongoose.model<IDisasterReport>('DisasterReport', reportSchema);
