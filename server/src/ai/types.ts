import { z } from 'zod';
import type { AssessmentResult } from '../analyzers/disasterAssessment.js';
import type { DisasterType, Urgency } from '../types/domain.js';

/** Exactly the fields the AI layer is allowed to see. Nothing else is sent. */
export interface AiAssessmentRequest {
  disasterType: DisasterType;
  description: string;
  peopleAffected: number;
  urgency: Urgency;
  locationAddress: string;
  deterministicAssessment: Pick<
    AssessmentResult,
    'severity' | 'score' | 'riskFactors' | 'recommendedResources' | 'recommendedActions'
  >;
  /** Resource names actually available nearby, so suggestions stay actionable. */
  availableResources: string[];
}

/** Schema the model's JSON reply must satisfy before we store or display it. */
export const aiAssessmentSchema = z.object({
  summary: z.string().min(20).max(1200),
  keyRisks: z.array(z.string().min(3).max(200)).min(1).max(6),
  immediateActions: z.array(z.string().min(3).max(240)).min(1).max(6),
  resourceRecommendation: z.array(z.string().min(2).max(120)).min(1).max(8),
  safetyGuidance: z.string().min(20).max(800),
});

export type AiAssessment = z.infer<typeof aiAssessmentSchema>;

export interface AiResult {
  available: boolean;
  data?: AiAssessment;
  model?: string;
  error?: string;
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  isConfigured(): boolean;
  generateAssessment(input: AiAssessmentRequest): Promise<AiAssessment>;
}
