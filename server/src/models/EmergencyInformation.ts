import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { DISASTER_TYPES, type DisasterType } from '../types/domain.js';

export interface IEmergencyContact {
  label: string;
  number: string;
}

export interface IEmergencyInformation extends Document {
  _id: mongoose.Types.ObjectId;
  disasterType: DisasterType;
  title: string;
  summary: string;
  before: string[];
  during: string[];
  after: string[];
  checklist: string[];
  contacts: IEmergencyContact[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const infoSchema = new Schema<IEmergencyInformation>(
  {
    disasterType: { type: String, enum: DISASTER_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    before: [String],
    during: [String],
    after: [String],
    checklist: [String],
    contacts: [{ _id: false, label: String, number: String }],
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const EmergencyInformation: Model<IEmergencyInformation> =
  mongoose.models.EmergencyInformation ||
  mongoose.model<IEmergencyInformation>('EmergencyInformation', infoSchema);
