import type { Types } from 'mongoose';
import { assessDisaster } from '../analyzers/disasterAssessment.js';
import { generateAiAssessment } from '../ai/index.js';
import { DisasterAssessment } from '../models/DisasterAssessment.js';
import { DisasterReport, type IDisasterReport } from '../models/DisasterReport.js';
import { EmergencyResource } from '../models/EmergencyResource.js';

import { distanceKm } from '../utils/geo.js';
import { logger } from '../utils/logger.js';

const NEARBY_RADIUS_KM = 60;

/**
 * Runs the deterministic engine for a report, persists the assessment, and
 * mirrors severity onto the report for cheap list/map queries.
 *
 * The AI layer runs afterwards and is entirely optional: if it fails, the
 * stored assessment still has everything the UI needs.
 */
export async function runAssessment(
  report: IDisasterReport,
  options: { withAi?: boolean } = {},
) {
  const deterministic = assessDisaster({
    disasterType: report.disasterType,
    description: report.description,
    peopleAffected: report.peopleAffected,
    urgency: report.urgency,
    location: report.location,
    occurredAt: report.createdAt ?? new Date(),
  });

  const assessment = await DisasterAssessment.findOneAndUpdate(
    { reportId: report._id },
    {
      reportId: report._id,
      severity: deterministic.severity,
      score: deterministic.score,
      breakdown: deterministic.breakdown,
      riskFactors: deterministic.riskFactors,
      recommendedResources: deterministic.recommendedResources,
      recommendedActions: deterministic.recommendedActions,
      engineVersion: deterministic.engineVersion,
      // Reset the AI block; it is repopulated below when enabled.
      ai: { available: false },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await DisasterReport.updateOne(
    { _id: report._id },
    { severity: deterministic.severity, severityScore: deterministic.score },
  );
  report.severity = deterministic.severity;
  report.severityScore = deterministic.score;

  if (options.withAi !== false) {
    // Deliberately awaited so the caller can show AI results immediately, but
    // any failure is swallowed inside generateAiAssessment.
    const nearby = await findNearbyResourceNames(report.location);
    const ai = await generateAiAssessment({
      disasterType: report.disasterType,
      description: report.description,
      peopleAffected: report.peopleAffected,
      urgency: report.urgency,
      locationAddress: report.location.address,
      deterministicAssessment: {
        severity: deterministic.severity,
        score: deterministic.score,
        riskFactors: deterministic.riskFactors,
        recommendedResources: deterministic.recommendedResources,
        recommendedActions: deterministic.recommendedActions,
      },
      availableResources: nearby,
    });

    assessment.ai = ai.available
      ? {
          available: true,
          summary: ai.data?.summary,
          keyRisks: ai.data?.keyRisks ?? [],
          immediateActions: ai.data?.immediateActions ?? [],
          resourceRecommendation: ai.data?.resourceRecommendation ?? [],
          safetyGuidance: ai.data?.safetyGuidance,
          model: ai.model,
          generatedAt: new Date(),
        }
      : { available: false, error: ai.error, model: ai.model };

    await assessment.save();
  }

  return { assessment, deterministic };
}

/** Names of active resources within the nearby radius, capped for prompt size. */
async function findNearbyResourceNames(location: {
  latitude: number;
  longitude: number;
}): Promise<string[]> {
  try {
    const resources = await EmergencyResource.find({ status: { $ne: 'OFFLINE' } })
      .select('name type latitude longitude availability')
      .lean();

    return resources
      .map((r) => ({ ...r, km: distanceKm(location, r) }))
      .filter((r) => r.km <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.km - b.km)
      .slice(0, 12)
      .map((r) => `${r.name} (${humanise(r.type)}, ${r.km}km away, ${r.availability} available)`);
  } catch (err) {
    logger.warn('Could not load nearby resources for AI context:', err);
    return [];
  }
}

const humanise = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const getAssessmentForReport = (reportId: string | Types.ObjectId) =>
  DisasterAssessment.findOne({ reportId }).lean();
