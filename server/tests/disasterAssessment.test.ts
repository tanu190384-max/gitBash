import { describe, expect, it } from 'vitest';
import { assessDisaster, classifySeverity } from '../src/analyzers/disasterAssessment.js';
import { assessmentConfig } from '../src/analyzers/assessmentConfig.js';
import type { AssessmentInput } from '../src/analyzers/disasterAssessment.js';

/** Fixed daytime timestamp so the night-time modifier never makes tests flaky. */
const NOON = new Date('2026-06-15T12:00:00');

const base = (overrides: Partial<AssessmentInput> = {}): AssessmentInput => ({
  disasterType: 'FLOOD',
  description:
    'Water has entered the ground floor of several houses in the colony after heavy rain overnight.',
  peopleAffected: 20,
  urgency: 'MEDIUM',
  location: { address: 'Patiala, Punjab', latitude: 30.3398, longitude: 76.3869 },
  occurredAt: NOON,
  ...overrides,
});

describe('classifySeverity', () => {
  it('maps each band boundary to the documented severity', () => {
    expect(classifySeverity(0)).toBe('LOW');
    expect(classifySeverity(25)).toBe('LOW');
    expect(classifySeverity(26)).toBe('MODERATE');
    expect(classifySeverity(50)).toBe('MODERATE');
    expect(classifySeverity(51)).toBe('HIGH');
    expect(classifySeverity(75)).toBe('HIGH');
    expect(classifySeverity(76)).toBe('CRITICAL');
    expect(classifySeverity(100)).toBe('CRITICAL');
  });

  it('clamps out-of-range scores instead of returning undefined', () => {
    expect(classifySeverity(-40)).toBe('LOW');
    expect(classifySeverity(250)).toBe('CRITICAL');
  });
});

describe('assessDisaster — scoring', () => {
  it('always returns a score within 0–100 and a matching severity band', () => {
    const result = assessDisaster(base());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.severity).toBe(classifySeverity(result.score));
  });

  it('scores a mass-casualty earthquake as CRITICAL', () => {
    const result = assessDisaster(
      base({
        disasterType: 'EARTHQUAKE',
        description:
          'Multiple buildings have collapsed. People are trapped under the rubble and there are injuries and deaths reported. Children from the school are missing.',
        peopleAffected: 12000,
        urgency: 'CRITICAL',
      }),
    );
    expect(result.severity).toBe('CRITICAL');
    expect(result.score).toBeGreaterThanOrEqual(76);
  });

  it('scores a minor, low-urgency incident as LOW', () => {
    const result = assessDisaster(
      base({
        disasterType: 'OTHER',
        description:
          'A section of the footpath railing near the park entrance has come loose and should be repaired at some point.',
        peopleAffected: 0,
        urgency: 'LOW',
      }),
    );
    expect(result.severity).toBe('LOW');
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it('raises the score monotonically as urgency increases, all else equal', () => {
    const scores = (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(
      (urgency) => assessDisaster(base({ urgency })).score,
    );
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it('raises the score as the affected population grows', () => {
    const small = assessDisaster(base({ peopleAffected: 2 })).score;
    const medium = assessDisaster(base({ peopleAffected: 120 })).score;
    const large = assessDisaster(base({ peopleAffected: 25000 })).score;
    expect(medium).toBeGreaterThan(small);
    expect(large).toBeGreaterThan(medium);
  });

  it('weights a high-hazard type above a low-hazard one with identical inputs', () => {
    const shared = { description: base().description, peopleAffected: 50, urgency: 'HIGH' as const };
    const quake = assessDisaster(base({ ...shared, disasterType: 'EARTHQUAKE' })).score;
    const heat = assessDisaster(base({ ...shared, disasterType: 'HEATWAVE' })).score;
    expect(quake).toBeGreaterThan(heat);
  });

  it('breaks the score down into factors that sum to the total', () => {
    const result = assessDisaster(base({ urgency: 'HIGH', peopleAffected: 300 }));
    const summed = result.breakdown.reduce((total, entry) => total + entry.points, 0);
    // The total is rounded to an integer, so allow for sub-point rounding drift.
    expect(Math.abs(summed - result.score)).toBeLessThanOrEqual(1);
    expect(result.breakdown.map((b) => b.label)).toEqual([
      'Disaster type',
      'Reported urgency',
      'People affected',
      'Situation indicators',
      'Response context',
    ]);
  });

  it('never exceeds 100 even when every factor is maxed out', () => {
    const result = assessDisaster(
      base({
        disasterType: 'EARTHQUAKE',
        urgency: 'CRITICAL',
        peopleAffected: 1_000_000,
        description: assessmentConfig.signals.map((s) => s.label).join('. '),
        location: { address: 'Unknown' },
        occurredAt: new Date('2026-06-15T23:30:00'),
      }),
    );
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.severity).toBe('CRITICAL');
  });
});

describe('assessDisaster — risk factors', () => {
  it('detects casualties, trapped people and hazardous materials from the description', () => {
    const result = assessDisaster(
      base({
        description:
          'An explosion at the plant has left two workers dead and several others trapped inside. Toxic fumes are spreading towards the housing blocks.',
      }),
    );
    expect(result.matchedSignals).toEqual(
      expect.arrayContaining(['casualties', 'trapped', 'hazmat', 'spreading']),
    );
    expect(result.riskFactors).toEqual(
      expect.arrayContaining(['Casualties or fatalities reported', 'People trapped or missing']),
    );
  });

  it('honours explicit flags even when the description says nothing', () => {
    const plain = assessDisaster(base({ description: 'Situation reported at the location, details to follow.' }));
    const flagged = assessDisaster(
      base({
        description: 'Situation reported at the location, details to follow.',
        flags: { medicalEmergency: true, hazardousMaterials: true },
      }),
    );
    expect(flagged.matchedSignals).toEqual(expect.arrayContaining(['injuries', 'hazmat']));
    expect(flagged.score).toBeGreaterThan(plain.score);
  });

  it('flags a missing location and a thin description as response risks', () => {
    const result = assessDisaster(
      base({ description: 'Fire here', location: { address: 'Somewhere' } }),
    );
    expect(result.riskFactors).toEqual(
      expect.arrayContaining([
        'Imprecise location — responders may need to search for the site',
        'Limited detail in report — verification required',
      ]),
    );
  });

  it('adds a night-time risk factor for incidents reported after dark', () => {
    const night = assessDisaster(base({ occurredAt: new Date('2026-06-15T22:15:00') }));
    const day = assessDisaster(base({ occurredAt: NOON }));
    expect(night.riskFactors).toContain('Night-time incident — reduced visibility for responders');
    expect(day.riskFactors).not.toContain('Night-time incident — reduced visibility for responders');
    expect(night.score).toBeGreaterThan(day.score);
  });

  it('returns no duplicate risk factors when several signals overlap', () => {
    const result = assessDisaster(
      base({
        description:
          'Injured people are bleeding and several have burns. More injuries are being reported as the fire spreads.',
      }),
    );
    expect(new Set(result.riskFactors).size).toBe(result.riskFactors.length);
  });
});

describe('assessDisaster — recommendations', () => {
  it('always recommends the baseline resources and actions for the disaster type', () => {
    const result = assessDisaster(base({ disasterType: 'FIRE' }));
    for (const resource of assessmentConfig.baseResources.FIRE) {
      expect(result.recommendedResources).toContain(resource);
    }
    for (const action of assessmentConfig.baseActions.FIRE) {
      expect(result.recommendedActions).toContain(action);
    }
  });

  it('adds signal-specific resources on top of the baseline', () => {
    const result = assessDisaster(
      base({ description: 'Families have been displaced and evacuated, they have nowhere to go tonight.' }),
    );
    expect(result.recommendedResources).toEqual(
      expect.arrayContaining(['Temporary shelter', 'Food and water', 'Relief kits']),
    );
  });

  it('escalates to incident command for CRITICAL incidents only', () => {
    const critical = assessDisaster(
      base({
        disasterType: 'CYCLONE',
        description:
          'Severe damage across the district with casualties reported, people trapped, and the situation is still worsening. Families have been evacuated.',
        peopleAffected: 40000,
        urgency: 'CRITICAL',
      }),
    );
    const low = assessDisaster(base({ urgency: 'LOW', peopleAffected: 1 }));

    expect(critical.severity).toBe('CRITICAL');
    expect(critical.recommendedActions[0]).toBe(
      'Activate the emergency operations centre and notify district authorities',
    );
    expect(critical.recommendedResources).toContain('Incident command unit');
    expect(low.recommendedResources).not.toContain('Incident command unit');
  });

  it('returns no duplicate resources or actions', () => {
    const result = assessDisaster(
      base({
        disasterType: 'FIRE',
        description:
          'Burns and injuries reported, people trapped inside, and the fire is spreading to nearby buildings.',
        urgency: 'CRITICAL',
        peopleAffected: 500,
      }),
    );
    expect(new Set(result.recommendedResources).size).toBe(result.recommendedResources.length);
    expect(new Set(result.recommendedActions).size).toBe(result.recommendedActions.length);
  });
});

describe('assessDisaster — determinism and configurability', () => {
  it('produces identical output for identical input', () => {
    const input = base({ urgency: 'HIGH', peopleAffected: 450 });
    expect(assessDisaster(input)).toEqual(assessDisaster(input));
  });

  it('stamps the engine version from the active config', () => {
    expect(assessDisaster(base()).engineVersion).toBe(assessmentConfig.version);
  });

  it('respects an overridden config without code changes', () => {
    const quiet = {
      ...assessmentConfig,
      version: '2.0.0-test',
      // Ignore urgency entirely and redistribute nothing — scores should drop.
      weights: { ...assessmentConfig.weights, urgency: 0 },
    };
    const input = base({ urgency: 'CRITICAL' });
    const tuned = assessDisaster(input, quiet);
    expect(tuned.engineVersion).toBe('2.0.0-test');
    expect(tuned.score).toBeLessThan(assessDisaster(input).score);
  });

  it('handles a non-finite affected count without producing NaN', () => {
    const result = assessDisaster(base({ peopleAffected: Number.NaN }));
    expect(Number.isFinite(result.score)).toBe(true);
    expect(result.severity).toBe(classifySeverity(result.score));
  });
});
