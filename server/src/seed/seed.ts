import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { assessDisaster } from '../analyzers/disasterAssessment.js';
import {
  DisasterAssessment,
  DisasterReport,
  EmergencyInformation,
  EmergencyResource,
  IncidentTimeline,
  Notification,
  User,
} from '../models/index.js';
import { STATUS_TRANSITIONS, type ReportStatus } from '../types/domain.js';
import { generateReportCode } from '../utils/reportCode.js';
import { logger } from '../utils/logger.js';
import { demoAlerts, demoReports, demoResources } from './demoData.js';
import { emergencyGuides } from './emergencyGuides.js';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

/** Walks the lifecycle from SUBMITTED to the target so timelines look real. */
function pathToStatus(target: ReportStatus): ReportStatus[] {
  if (target === 'SUBMITTED') return ['SUBMITTED'];
  const queue: ReportStatus[][] = [['SUBMITTED']];
  const seen = new Set<ReportStatus>(['SUBMITTED']);
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === target) return path;
    for (const next of STATUS_TRANSITIONS[last]) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([...path, next]);
    }
  }
  return ['SUBMITTED', target];
}

async function seed() {
  const { ephemeral } = await connectDatabase();
  if (ephemeral) {
    logger.warn('Seeding an in-memory database — the data disappears when this process exits.');
    logger.warn('Start MongoDB and set MONGODB_URI to keep seeded data.');
  }

  logger.info('Clearing existing demo data…');
  await Promise.all([
    DisasterReport.deleteMany({ isDemo: true }),
    EmergencyResource.deleteMany({ isDemo: true }),
    Notification.deleteMany({ isDemo: true }),
    EmergencyInformation.deleteMany({}),
  ]);
  // Assessments and timelines belong to reports that were just removed.
  const orphanIds = await DisasterReport.find({}).distinct('_id');
  await Promise.all([
    DisasterAssessment.deleteMany({ reportId: { $nin: orphanIds } }),
    IncidentTimeline.deleteMany({ reportId: { $nin: orphanIds } }),
  ]);

  // ── Accounts ──────────────────────────────────────────────────────────────
  const admin = await upsertUser({
    name: 'Control Room Admin',
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: 'admin',
    phone: '0175-1077',
  });

  const demoUser = await upsertUser({
    name: 'Demo Reporter',
    email: env.SEED_USER_EMAIL,
    password: env.SEED_USER_PASSWORD,
    role: 'user',
    phone: '9876543210',
  });

  const extraReporters = await Promise.all(
    [
      { name: 'Harpreet Kaur', email: 'harpreet@example.com' },
      { name: 'Arjun Mehta', email: 'arjun@example.com' },
      { name: 'Simran Gill', email: 'simran@example.com' },
    ].map((r) =>
      upsertUser({ ...r, password: 'Demo@12345', role: 'user' as const, phone: '9800000000' }),
    ),
  );
  const reporters = [demoUser, ...extraReporters];

  // ── Resources ─────────────────────────────────────────────────────────────
  const resources = await EmergencyResource.insertMany(
    demoResources.map((r) => ({ ...r, isDemo: true })),
  );
  logger.info(`Seeded ${resources.length} emergency resources.`);

  // ── Emergency information ─────────────────────────────────────────────────
  await EmergencyInformation.insertMany(emergencyGuides.map((g) => ({ ...g, published: true })));
  logger.info(`Seeded ${emergencyGuides.length} emergency guides.`);

  // ── Reports, assessments and timelines ────────────────────────────────────
  let reportCount = 0;
  for (const [index, demo] of demoReports.entries()) {
    const createdAt = hoursAgo(demo.hoursAgo);
    const reporter = reporters[index % reporters.length];

    const report = await DisasterReport.create({
      reportCode: generateReportCode(),
      userId: reporter._id,
      disasterType: demo.disasterType,
      description: demo.description,
      location: { address: demo.address, latitude: demo.latitude, longitude: demo.longitude },
      peopleAffected: demo.peopleAffected,
      urgency: demo.urgency,
      status: demo.status,
      verified: !['SUBMITTED', 'UNDER_REVIEW', 'REJECTED'].includes(demo.status),
      isDemo: true,
      createdAt,
      updatedAt: createdAt,
      resolvedAt: demo.status === 'RESOLVED' ? hoursAgo(Math.max(0, demo.hoursAgo - 6)) : undefined,
    });

    // Deterministic engine only — seeding must not depend on a network call.
    const result = assessDisaster({
      disasterType: report.disasterType,
      description: report.description,
      peopleAffected: report.peopleAffected,
      urgency: report.urgency,
      location: report.location,
      occurredAt: createdAt,
    });

    await DisasterAssessment.create({
      reportId: report._id,
      severity: result.severity,
      score: result.score,
      breakdown: result.breakdown,
      riskFactors: result.riskFactors,
      recommendedResources: result.recommendedResources,
      recommendedActions: result.recommendedActions,
      engineVersion: result.engineVersion,
      ai: {
        available: false,
        error: 'AI insights were not generated for demo data. Configure AI_API_KEY and re-run the assessment.',
      },
    });

    await DisasterReport.updateOne(
      { _id: report._id },
      { severity: result.severity, severityScore: result.score },
    );

    // Assign resources to incidents that have progressed past verification.
    if (['RESPONSE_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(demo.status)) {
      const picked = resources.slice(index % 4, (index % 4) + 3).map((r) => r._id);
      await DisasterReport.updateOne({ _id: report._id }, { assignedResources: picked });
    }

    // Build a believable timeline across the incident's lifetime.
    const path = pathToStatus(demo.status);
    const span = Math.max(1, demo.hoursAgo);
    for (const [step, status] of path.entries()) {
      const at = hoursAgo(demo.hoursAgo - (span / Math.max(1, path.length)) * step);
      await IncidentTimeline.create({
        reportId: report._id,
        status,
        note: timelineNote(status, result.severity, result.score),
        actorId: status === 'SUBMITTED' ? reporter._id : admin._id,
        actorName: status === 'SUBMITTED' ? reporter.name : admin.name,
        actorRole: status === 'SUBMITTED' ? 'user' : 'admin',
        createdAt: at,
      });
    }

    reportCount++;
  }
  logger.info(`Seeded ${reportCount} incidents with assessments and timelines.`);

  // ── Alerts ────────────────────────────────────────────────────────────────
  await Notification.insertMany(
    demoAlerts.map((a) => ({
      kind: 'BROADCAST' as const,
      title: a.title,
      message: a.message,
      severity: a.severity,
      targetArea: a.targetArea,
      createdBy: admin._id,
      isDemo: true,
      createdAt: hoursAgo(a.hoursAgo),
    })),
  );
  logger.info(`Seeded ${demoAlerts.length} broadcast alerts.`);

  logger.info('');
  logger.info('─────────────────────────────────────────────');
  logger.info('  Seed complete. Development sign-in details:');
  logger.info(`  Admin →  ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
  logger.info(`  User  →  ${env.SEED_USER_EMAIL} / ${env.SEED_USER_PASSWORD}`);
  logger.info('─────────────────────────────────────────────');

  await disconnectDatabase();
}

function timelineNote(status: ReportStatus, severity: string, score: number): string {
  switch (status) {
    case 'SUBMITTED':
      return `Report received. Automated assessment: ${severity} severity (score ${score}/100).`;
    case 'UNDER_REVIEW':
      return 'Coordinator picked up the report for verification.';
    case 'VERIFIED':
      return 'Details confirmed with the field team.';
    case 'RESPONSE_ASSIGNED':
      return 'Emergency resources dispatched to the location.';
    case 'IN_PROGRESS':
      return 'Response team is on site and operations are underway.';
    case 'RESOLVED':
      return 'Situation stabilised and incident closed.';
    case 'REJECTED':
      return 'Could not be verified on the ground; closed as unconfirmed.';
    default:
      return '';
  }
}

/** Idempotent so the seed can be re-run without wiping real accounts. */
async function upsertUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone?: string;
}) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    existing.name = input.name;
    existing.role = input.role;
    existing.password = input.password; // re-hashed by the pre-save hook
    existing.active = true;
    await existing.save();
    return existing;
  }
  return User.create({ ...input, email: input.email.toLowerCase() });
}

seed().catch(async (err) => {
  logger.error('Seeding failed:', err);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
