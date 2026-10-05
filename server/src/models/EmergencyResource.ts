import mongoose, { Schema, type Document, type Model } from 'mongoose';
import {
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  type ResourceStatus,
  type ResourceType,
} from '../types/domain.js';

export interface IEmergencyResource extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: ResourceType;
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  capacity: number;
  availability: number;
  status: ResourceStatus;
  notes?: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IEmergencyResource>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: RESOURCE_TYPES, required: true, index: true },
    address: { type: String, required: true, trim: true, maxlength: 240 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    contact: { type: String, required: true, trim: true, maxlength: 60 },
    capacity: { type: Number, required: true, min: 0, max: 1_000_000 },
    availability: { type: Number, required: true, min: 0, max: 1_000_000 },
    status: { type: String, enum: RESOURCE_STATUSES, default: 'ACTIVE', index: true },
    notes: { type: String, maxlength: 500 },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Availability can never exceed capacity — clamp rather than reject so admin
// edits that lower capacity stay consistent.
resourceSchema.pre('save', function clamp(next) {
  if (this.availability > this.capacity) this.availability = this.capacity;
  next();
});

export const EmergencyResource: Model<IEmergencyResource> =
  mongoose.models.EmergencyResource ||
  mongoose.model<IEmergencyResource>('EmergencyResource', resourceSchema);
