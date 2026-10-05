import type { DisasterType, ResourceStatus, ResourceType, Urgency } from '../types/domain.js';

/**
 * Demo dataset centred on Patiala, Punjab. Every record created from this file
 * is flagged `isDemo: true` so it can be identified and cleared independently
 * of anything a real user submits.
 */

export const DEMO_ORIGIN = { latitude: 30.3398, longitude: 76.3869, label: 'Patiala, Punjab' };

export interface DemoReport {
  disasterType: DisasterType;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  peopleAffected: number;
  urgency: Urgency;
  /** Hours before "now" that the report was filed. */
  hoursAgo: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESPONSE_ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
}

export const demoReports: DemoReport[] = [
  {
    disasterType: 'FLOOD',
    description:
      'Ghaggar river has breached its embankment near Sanaur road. Water is rising fast and has entered the ground floor of about forty houses. Several families including children and elderly are stranded on rooftops and cannot be reached by road — the approach is completely cut off. Power supply to the colony has been shut down.',
    address: 'Sanaur Road, Patiala, Punjab',
    latitude: 30.3009,
    longitude: 76.4587,
    peopleAffected: 320,
    urgency: 'CRITICAL',
    hoursAgo: 3,
    status: 'IN_PROGRESS',
  },
  {
    disasterType: 'FIRE',
    description:
      'Major fire in a textile godown in the industrial area. Thick smoke is spreading towards the residential blocks behind the unit. Two workers are injured with burns and one is still missing inside the building. The fire is still growing and nearby chemical drums are stored on site.',
    address: 'Focal Point Industrial Area, Patiala, Punjab',
    latitude: 30.3564,
    longitude: 76.4012,
    peopleAffected: 45,
    urgency: 'CRITICAL',
    hoursAgo: 8,
    status: 'RESPONSE_ASSIGNED',
  },
  {
    disasterType: 'STORM',
    description:
      'Severe thunderstorm with high winds has brought down electricity poles and several trees across the Mall Road stretch. Roads are blocked and there is a power outage across the area. No injuries reported so far but traffic is completely halted.',
    address: 'Mall Road, Patiala, Punjab',
    latitude: 30.3352,
    longitude: 76.3908,
    peopleAffected: 180,
    urgency: 'MEDIUM',
    hoursAgo: 26,
    status: 'VERIFIED',
  },
  {
    disasterType: 'EARTHQUAKE',
    description:
      'Moderate tremors felt across the university campus. Visible cracks have appeared in the wall of the old hostel block and a portion of the boundary wall has collapsed. Students have been evacuated to the open ground. No one appears to be trapped but the building needs a structural check before anyone re-enters.',
    address: 'Punjabi University Campus, Patiala, Punjab',
    latitude: 30.3568,
    longitude: 76.4499,
    peopleAffected: 900,
    urgency: 'HIGH',
    hoursAgo: 52,
    status: 'UNDER_REVIEW',
  },
  {
    disasterType: 'MEDICAL_EMERGENCY',
    description:
      'Bus carrying passengers collided with a truck on the highway. Around twelve people are injured, four of them seriously and bleeding heavily. Ambulances are needed urgently at the site. Two passengers are trapped in the rear of the bus.',
    address: 'NH-64 near Rajpura Bypass, Patiala, Punjab',
    latitude: 30.4842,
    longitude: 76.5947,
    peopleAffected: 12,
    urgency: 'CRITICAL',
    hoursAgo: 70,
    status: 'RESOLVED',
  },
  {
    disasterType: 'HEATWAVE',
    description:
      'Temperature has crossed 46 degrees for the third consecutive day in the old city area. Several elderly residents have reported dizziness and dehydration. Water supply to the locality has been irregular for two days.',
    address: 'Qila Chowk, Patiala, Punjab',
    latitude: 30.3251,
    longitude: 76.3982,
    peopleAffected: 260,
    urgency: 'HIGH',
    hoursAgo: 96,
    status: 'RESOLVED',
  },
  {
    disasterType: 'LANDSLIDE',
    description:
      'Slope failure along the hill road after continuous rainfall. Debris has blocked one lane and a small roadside shop has been damaged. No casualties reported. Traffic is being diverted.',
    address: 'Nabha Road embankment, Patiala, Punjab',
    latitude: 30.2712,
    longitude: 76.2583,
    peopleAffected: 8,
    urgency: 'MEDIUM',
    hoursAgo: 120,
    status: 'RESOLVED',
  },
  {
    disasterType: 'INDUSTRIAL_ACCIDENT',
    description:
      'Ammonia gas leak reported at a cold storage facility. Workers evacuated the plant. Strong fumes in the surrounding area and three people are complaining of breathing difficulty.',
    address: 'Bhadson Road, Patiala, Punjab',
    latitude: 30.3673,
    longitude: 76.3391,
    peopleAffected: 35,
    urgency: 'HIGH',
    hoursAgo: 14,
    status: 'VERIFIED',
  },
  {
    disasterType: 'FLOOD',
    description:
      'Waterlogging up to knee height in the market lane after heavy overnight rain. Shops have minor water damage. Drainage appears blocked.',
    address: 'Adalat Bazaar, Patiala, Punjab',
    latitude: 30.3298,
    longitude: 76.3956,
    peopleAffected: 40,
    urgency: 'LOW',
    hoursAgo: 40,
    status: 'SUBMITTED',
  },
  {
    disasterType: 'CYCLONE',
    description:
      'Advance warning relayed from the district office about high-velocity winds expected over the next twelve hours. Requesting shelters to be readied in low-lying colonies.',
    address: 'District Collectorate, Patiala, Punjab',
    latitude: 30.3402,
    longitude: 76.3801,
    peopleAffected: 1500,
    urgency: 'HIGH',
    hoursAgo: 6,
    status: 'SUBMITTED',
  },
];

export interface DemoResource {
  name: string;
  type: ResourceType;
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  capacity: number;
  availability: number;
  status: ResourceStatus;
}

export const demoResources: DemoResource[] = [
  { name: 'Rajindra Hospital', type: 'HOSPITAL', address: 'Sangrur Road, Patiala', latitude: 30.3311, longitude: 76.3812, contact: '0175-2212030', capacity: 850, availability: 214, status: 'ACTIVE' },
  { name: 'Columbia Asia Hospital', type: 'HOSPITAL', address: 'Bhupindra Road, Patiala', latitude: 30.3425, longitude: 76.3901, contact: '0175-5001100', capacity: 200, availability: 46, status: 'ACTIVE' },
  { name: 'Mata Kaushalya Hospital', type: 'HOSPITAL', address: 'Rajpura Road, Patiala', latitude: 30.3489, longitude: 76.4087, contact: '0175-2214001', capacity: 300, availability: 12, status: 'LIMITED' },
  { name: 'District Ambulance Fleet 108', type: 'AMBULANCE', address: 'Civil Lines, Patiala', latitude: 30.3372, longitude: 76.3884, contact: '108', capacity: 24, availability: 9, status: 'ACTIVE' },
  { name: 'Rapid Response Ambulance Unit', type: 'AMBULANCE', address: 'Focal Point, Patiala', latitude: 30.3551, longitude: 76.4003, contact: '0175-2350108', capacity: 8, availability: 3, status: 'LIMITED' },
  { name: 'Kotwali Police Station', type: 'POLICE_STATION', address: 'Kotwali Chowk, Patiala', latitude: 30.3283, longitude: 76.3934, contact: '112', capacity: 120, availability: 64, status: 'ACTIVE' },
  { name: 'Civil Lines Police Station', type: 'POLICE_STATION', address: 'Civil Lines, Patiala', latitude: 30.3398, longitude: 76.3869, contact: '0175-2214100', capacity: 90, availability: 41, status: 'ACTIVE' },
  { name: 'Patiala Fire Station (Central)', type: 'FIRE_STATION', address: 'Lower Mall, Patiala', latitude: 30.3339, longitude: 76.3872, contact: '101', capacity: 12, availability: 4, status: 'ACTIVE' },
  { name: 'Focal Point Fire Sub-Station', type: 'FIRE_STATION', address: 'Focal Point, Patiala', latitude: 30.3578, longitude: 76.4024, contact: '0175-2350101', capacity: 6, availability: 0, status: 'LIMITED' },
  { name: 'Government Senior Secondary School Shelter', type: 'SHELTER', address: 'Sanaur Road, Patiala', latitude: 30.3044, longitude: 76.4501, contact: '0175-2280330', capacity: 600, availability: 275, status: 'ACTIVE' },
  { name: 'Polo Ground Relief Camp', type: 'SHELTER', address: 'Polo Ground, Patiala', latitude: 30.3462, longitude: 76.3795, contact: '0175-2214777', capacity: 1200, availability: 880, status: 'ACTIVE' },
  { name: 'Community Hall Shelter, Tripuri', type: 'SHELTER', address: 'Tripuri, Patiala', latitude: 30.3172, longitude: 76.4098, contact: '0175-2290445', capacity: 350, availability: 0, status: 'OFFLINE' },
  { name: 'Langar Hall Food Centre', type: 'FOOD_CENTER', address: 'Dukhniwaran Sahib, Patiala', latitude: 30.3229, longitude: 76.4011, contact: '0175-2213344', capacity: 2000, availability: 1500, status: 'ACTIVE' },
  { name: 'Red Cross Food Distribution Point', type: 'FOOD_CENTER', address: 'Mall Road, Patiala', latitude: 30.3358, longitude: 76.3893, contact: '0175-2212112', capacity: 800, availability: 420, status: 'ACTIVE' },
  { name: 'Municipal Water Tanker Depot', type: 'WATER_SUPPLY', address: 'Nabha Road, Patiala', latitude: 30.3121, longitude: 76.3544, contact: '0175-2215050', capacity: 30, availability: 11, status: 'ACTIVE' },
  { name: 'NDRF Rescue Team — Patiala Detachment', type: 'RESCUE_TEAM', address: 'District HQ, Patiala', latitude: 30.3407, longitude: 76.3812, contact: '0175-2214900', capacity: 45, availability: 18, status: 'ACTIVE' },
  { name: 'Civil Defence Volunteer Unit', type: 'RESCUE_TEAM', address: 'Civil Lines, Patiala', latitude: 30.3381, longitude: 76.3851, contact: '0175-2214905', capacity: 60, availability: 34, status: 'ACTIVE' },
  { name: 'Rajindra Hospital Blood Bank', type: 'BLOOD_BANK', address: 'Sangrur Road, Patiala', latitude: 30.3305, longitude: 76.3819, contact: '0175-2212045', capacity: 500, availability: 138, status: 'ACTIVE' },
  { name: 'Red Cross Blood Bank', type: 'BLOOD_BANK', address: 'Mall Road, Patiala', latitude: 30.3361, longitude: 76.3887, contact: '0175-2212115', capacity: 300, availability: 52, status: 'LIMITED' },
];

export interface DemoAlert {
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  targetArea: string;
  hoursAgo: number;
}

export const demoAlerts: DemoAlert[] = [
  {
    title: 'Heavy rainfall warning for Patiala district',
    message:
      'The meteorological department has issued a heavy rainfall warning for the next 24 hours. Residents in low-lying areas near the Ghaggar should move valuables to higher floors and avoid crossing waterlogged roads.',
    severity: 'WARNING',
    targetArea: 'Patiala district',
    hoursAgo: 4,
  },
  {
    title: 'Flood response active — Sanaur Road',
    message:
      'Rescue operations are underway near Sanaur Road. The stretch between the bypass and the embankment is closed to all traffic. Relief camp is open at the Government Senior Secondary School.',
    severity: 'CRITICAL',
    targetArea: 'Sanaur Road, Patiala',
    hoursAgo: 2,
  },
  {
    title: 'Avoid Focal Point industrial area',
    message:
      'A fire at a textile godown is being brought under control. Smoke is drifting towards nearby residential blocks. Keep windows closed and avoid the area until further notice.',
    severity: 'DANGER',
    targetArea: 'Focal Point, Patiala',
    hoursAgo: 7,
  },
  {
    title: 'Emergency helpline numbers',
    message:
      'District control room: 1077. Ambulance: 108. Fire: 101. Police: 112. Save these numbers and share them with family members.',
    severity: 'INFO',
    targetArea: 'All areas',
    hoursAgo: 48,
  },
];
