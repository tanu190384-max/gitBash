import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { SEVERITY_LEVELS, type Severity } from '../types/domain.js';

export interface IAiInsight {
  available: boolean;
  summary?: string;
  keyRisks?: string[];
  immediateActions?: string[];
  resourceRecommendation?: string[];
  safetyGuidance?: string;
  model?: string;
  error?: string;
  generatedAt?: Date;
}

export interface IDisasterAssessment extends Document {
  _id: mongoose.Types.ObjectId;
  reportId: mongoose.Types.ObjectId;
  severity: Severity;
  score: number;
  /** Per-factor contribution, kept so the UI can explain the score. */
  breakdown: { label: string; points: number; detail: string }[];
  riskFactors: string[];
  recommendedResources: string[];
  recommendedActions: string[];
  engineVersion: string;
  ai: IAiInsight;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IDisasterAssessment>(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'DisasterReport',
      required: true,
      unique: true,
      index: true,
    },
    severity: { type: String, enum: SEVERITY_LEVELS, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    breakdown: [
      {
        _id: false,
        label: String,
        points: Number,
        detail: String,
      },
    ],
    riskFactors: [String],
    recommendedResources: [String],
    recommendedActions: [String],
    engineVersion: { type: String, default: '1.0.0' },
    ai: {
      available: { type: Boolean, default: false },
      summary: String,
      keyRisks: [String],
      immediateActions: [String],
      resourceRecommendation: [String],
      safetyGuidance: String,
      model: String,
      error: String,
      generatedAt: Date,
    },
  },
  { timestamps: true },
);

export const DisasterAssessment: Model<IDisasterAssessment> =
  mongoose.models.DisasterAssessment ||
  mongoose.model<IDisasterAssessment>('DisasterAssessment', assessmentSchema);
