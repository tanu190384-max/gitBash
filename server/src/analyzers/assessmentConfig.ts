import type { DisasterType, Severity, Urgency } from '../types/domain.js';

/**
 * Every number the assessment engine uses lives here so the scoring model can
 * be tuned (or swapped per-region) without touching the algorithm itself.
 */

export interface KeywordSignal {
  /** Stable id so risk factors and resource mapping can reference it. */
  id: string;
  label: string;
  points: number;
  patterns: RegExp[];
  /** Extra resources implied by this signal. */
  resources?: string[];
  /** Extra immediate actions implied by this signal. */
  actions?: string[];
}

export interface AssessmentConfig {
  version: string;
  weights: {
    disasterType: number;
    urgency: number;
    peopleAffected: number;
    descriptionSignals: number;
    contextModifiers: number;
  };
  /** 0–1 intrinsic hazard of each disaster type. */
  hazardIndex: Record<DisasterType, number>;
  /** 0–1 multiplier for reported urgency. */
  urgencyIndex: Record<Urgency, number>;
  /** People-affected breakpoints → 0–1 scale. */
  populationBands: { min: number; factor: number; label: string }[];
  signals: KeywordSignal[];
  thresholds: { max: number; severity: Severity }[];
  /** Baseline resources per disaster type, always recommended. */
  baseResources: Record<DisasterType, string[]>;
  /** Baseline immediate actions per disaster type. */
  baseActions: Record<DisasterType, string[]>;
}

export const assessmentConfig: AssessmentConfig = {
  version: '1.0.0',

  // Weights sum to 100 — each is the maximum points that factor can contribute.
  weights: {
    disasterType: 18,
    urgency: 26,
    peopleAffected: 24,
    descriptionSignals: 24,
    contextModifiers: 8,
  },

  hazardIndex: {
    EARTHQUAKE: 1.0,
    CYCLONE: 0.95,
    FLOOD: 0.85,
    FIRE: 0.85,
    INDUSTRIAL_ACCIDENT: 0.9,
    LANDSLIDE: 0.8,
    STORM: 0.6,
    HEATWAVE: 0.55,
    MEDICAL_EMERGENCY: 0.5,
    OTHER: 0.45,
  },

  urgencyIndex: {
    LOW: 0.15,
    MEDIUM: 0.45,
    HIGH: 0.78,
    CRITICAL: 1.0,
  },

  // Non-linear: the jump from 5 to 50 people matters more than 5,000 to 50,000.
  populationBands: [
    { min: 10000, factor: 1.0, label: 'Mass-casualty scale population affected (10,000+)' },
    { min: 1000, factor: 0.9, label: 'Very large affected population (1,000+)' },
    { min: 250, factor: 0.75, label: 'Large affected population (250+)' },
    { min: 50, factor: 0.55, label: 'Significant affected population (50+)' },
    { min: 10, factor: 0.35, label: 'Moderate affected population (10+)' },
    { min: 1, factor: 0.15, label: 'Small number of people affected' },
    { min: 0, factor: 0.0, label: 'No affected population reported' },
  ],

  signals: [
    {
      id: 'casualties',
      label: 'Casualties or fatalities reported',
      points: 10,
      patterns: [/\bdead\b/i, /\bdeaths?\b/i, /\bfatalit/i, /\bcasualt/i, /\bbodies\b/i, /\bkilled\b/i],
      resources: ['Medical team', 'Ambulance', 'Mortuary services'],
      actions: ['Establish a casualty collection point and triage area'],
    },
    {
      id: 'injuries',
      label: 'Injuries requiring medical attention',
      points: 7,
      patterns: [/\binjur/i, /\bwounded\b/i, /\bbleed/i, /\bfracture/i, /\bburns?\b/i, /\bunconscious\b/i],
      resources: ['Medical team', 'Ambulance', 'Blood bank support'],
      actions: ['Dispatch medical response and prioritise triage'],
    },
    {
      id: 'trapped',
      label: 'People trapped or missing',
      points: 9,
      patterns: [
        /\btrapped\b/i,
        /\bmissing\b/i,
        /\bburied\b/i,
        /\bstranded\b/i,
        /\bunder (the )?(rubble|debris|building)/i,
      ],
      resources: ['Search and rescue team', 'Heavy rescue equipment'],
      actions: ['Deploy search and rescue with structural assessment support'],
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure or structural damage',
      points: 6,
      patterns: [
        /\bcollaps/i,
        /\bdamaged?\b/i,
        /\bdestroy/i,
        /\bbridge\b/i,
        /\broad (is )?(blocked|closed|cut)/i,
      ],
      resources: ['Engineering assessment team', 'Heavy machinery'],
      actions: ['Cordon off unsafe structures and assess structural integrity'],
    },
    {
      id: 'hazmat',
      label: 'Hazardous materials, gas or chemical exposure',
      points: 8,
      patterns: [/\bgas leak/i, /\bchemical/i, /\btoxic\b/i, /\bexplos/i, /\bhazmat\b/i, /\bfumes?\b/i, /\bradiat/i],
      resources: ['Hazmat unit', 'Fire brigade', 'Medical team'],
      actions: ['Establish an exclusion zone and initiate hazmat protocol'],
    },
    {
      id: 'spreading',
      label: 'Situation actively escalating',
      points: 6,
      patterns: [/\bspread/i, /\bworsen/i, /\brising\b/i, /\bescalat/i, /\bout of control/i],
      resources: ['Additional response units on standby'],
      actions: ['Pre-position reserve units — the incident is still developing'],
    },
    {
      id: 'vulnerable',
      label: 'Vulnerable groups affected (children, elderly, patients)',
      points: 5,
      patterns: [
        /\bchildren\b/i,
        /\bkids?\b/i,
        /\binfants?\b/i,
        /\bbab(y|ies)\b/i,
        /\belderly\b/i,
        /\bdisabled\b/i,
        /\bpregnant\b/i,
        /\bpatients?\b/i,
        /\bschool\b/i,
      ],
      resources: ['Paediatric and geriatric care support', 'Temporary shelter'],
      actions: ['Prioritise evacuation of vulnerable individuals'],
    },
    {
      id: 'utilities',
      label: 'Utility or communications failure',
      points: 4,
      patterns: [
        /\bpower (cut|outage|failure)/i,
        /\bno electricity/i,
        /\bblackout\b/i,
        /\bwater supply/i,
        /\bno (network|signal|phone)/i,
      ],
      resources: ['Utility restoration crew', 'Mobile communication unit'],
      actions: ['Coordinate with utility providers to restore essential services'],
    },
    {
      id: 'displacement',
      label: 'Displacement — people need shelter',
      points: 5,
      patterns: [/\bhomeless\b/i, /\bevacuat/i, /\bdisplaced\b/i, /\bshelter\b/i, /\bnowhere to go/i],
      resources: ['Temporary shelter', 'Food and water', 'Relief kits'],
      actions: ['Open relief shelters and register displaced families'],
    },
    {
      id: 'access',
      label: 'Access to the site is restricted',
      points: 4,
      patterns: [/\binaccessible\b/i, /\bcut off\b/i, /\bcannot reach/i, /\bno access/i, /\bisolated\b/i],
      resources: ['Boat or off-road rescue transport'],
      actions: ['Identify alternate access routes for responders'],
    },
  ],

  // Upper bound of each severity band, evaluated in order.
  thresholds: [
    { max: 25, severity: 'LOW' },
    { max: 50, severity: 'MODERATE' },
    { max: 75, severity: 'HIGH' },
    { max: 100, severity: 'CRITICAL' },
  ],

  baseResources: {
    FLOOD: ['Rescue boats', 'Temporary shelter', 'Food and water', 'Medical team'],
    EARTHQUAKE: ['Search and rescue team', 'Medical team', 'Temporary shelter', 'Heavy machinery'],
    FIRE: ['Fire brigade', 'Ambulance', 'Water tanker'],
    CYCLONE: ['Temporary shelter', 'Food and water', 'Rescue team', 'Power restoration crew'],
    LANDSLIDE: ['Search and rescue team', 'Heavy machinery', 'Medical team'],
    STORM: ['Power restoration crew', 'Debris clearance team', 'Temporary shelter'],
    HEATWAVE: ['Water supply', 'Cooling centre', 'Medical team'],
    INDUSTRIAL_ACCIDENT: ['Hazmat unit', 'Fire brigade', 'Medical team', 'Ambulance'],
    MEDICAL_EMERGENCY: ['Ambulance', 'Medical team', 'Blood bank support'],
    OTHER: ['Field assessment team', 'Police unit'],
  },

  baseActions: {
    FLOOD: [
      'Move affected people to higher ground and away from flood water',
      'Shut off electricity in inundated areas',
    ],
    EARTHQUAKE: [
      'Evacuate damaged structures and prevent re-entry until cleared',
      'Begin a systematic search of collapsed buildings',
    ],
    FIRE: ['Evacuate the building and surrounding blocks', 'Establish a fire perimeter and secure a water source'],
    CYCLONE: [
      'Move people to designated cyclone shelters before landfall',
      'Secure loose structures and suspend outdoor movement',
    ],
    LANDSLIDE: [
      'Evacuate the slope and settlements below it',
      'Restrict traffic on affected roads until the slope is assessed',
    ],
    STORM: ['Advise residents to stay indoors and away from windows', 'Clear fallen debris from priority routes'],
    HEATWAVE: ['Open cooling centres and distribute drinking water', 'Check on elderly and isolated residents'],
    INDUSTRIAL_ACCIDENT: [
      'Evacuate downwind areas and establish an exclusion zone',
      'Notify the plant operator and the environmental authority',
    ],
    MEDICAL_EMERGENCY: [
      'Dispatch the nearest ambulance and alert the receiving hospital',
      'Provide first-aid guidance to the reporter',
    ],
    OTHER: ['Send a field team to verify conditions on the ground', 'Maintain contact with the reporter for updates'],
  },
};
