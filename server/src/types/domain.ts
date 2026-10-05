export const DISASTER_TYPES = [
  'FLOOD',
  'EARTHQUAKE',
  'FIRE',
  'CYCLONE',
  'LANDSLIDE',
  'STORM',
  'HEATWAVE',
  'INDUSTRIAL_ACCIDENT',
  'MEDICAL_EMERGENCY',
  'OTHER',
] as const;
export type DisasterType = (typeof DISASTER_TYPES)[number];

export const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const SEVERITY_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number];

export const REPORT_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'RESPONSE_ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** Statuses that represent a closed incident. */
export const TERMINAL_STATUSES: ReportStatus[] = ['RESOLVED', 'REJECTED'];

/** Legal forward transitions for the incident lifecycle. */
export const STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['RESPONSE_ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  RESPONSE_ASSIGNED: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
  REJECTED: [],
};

export const RESOURCE_TYPES = [
  'HOSPITAL',
  'AMBULANCE',
  'POLICE_STATION',
  'FIRE_STATION',
  'SHELTER',
  'FOOD_CENTER',
  'WATER_SUPPLY',
  'RESCUE_TEAM',
  'BLOOD_BANK',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_STATUSES = ['ACTIVE', 'LIMITED', 'OFFLINE'] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export const ALERT_SEVERITIES = ['INFO', 'WARNING', 'DANGER', 'CRITICAL'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Human labels shared by API responses and seeded content. */
export const DISASTER_LABELS: Record<DisasterType, string> = {
  FLOOD: 'Flood',
  EARTHQUAKE: 'Earthquake',
  FIRE: 'Fire',
  CYCLONE: 'Cyclone',
  LANDSLIDE: 'Landslide',
  STORM: 'Storm',
  HEATWAVE: 'Heatwave',
  INDUSTRIAL_ACCIDENT: 'Industrial Accident',
  MEDICAL_EMERGENCY: 'Medical Emergency',
  OTHER: 'Other',
};
