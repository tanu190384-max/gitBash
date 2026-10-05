import type { DisasterType } from '../types/domain.js';

export interface GuideSeed {
  disasterType: DisasterType;
  title: string;
  summary: string;
  before: string[];
  during: string[];
  after: string[];
  checklist: string[];
  contacts: { label: string; number: string }[];
}

const COMMON_CONTACTS = [
  { label: 'Emergency (all services)', number: '112' },
  { label: 'Disaster Management Control Room', number: '1077' },
  { label: 'Ambulance', number: '108' },
  { label: 'Fire', number: '101' },
];

export const emergencyGuides: GuideSeed[] = [
  {
    disasterType: 'FLOOD',
    title: 'Flood Safety Guide',
    summary:
      'Floods develop faster than most people expect and the greatest danger is moving water, not depth. Knowing your evacuation route before water rises is the single most useful preparation.',
    before: [
      'Identify the highest safe floor or nearest high ground and the route to reach it on foot.',
      'Keep drinking water, dry food, a torch, power bank and essential medicines in one grab-bag.',
      'Store identity documents and cash in a waterproof pouch.',
      'Know how to shut off electricity and gas at the mains.',
      'Register mobile numbers of family members with each other and agree a meeting point.',
    ],
    during: [
      'Move to the highest floor or higher ground immediately — do not wait for an official order.',
      'Never walk or drive through moving water: 15cm can knock an adult over and 60cm can float a car.',
      'Switch off the electricity supply before water reaches sockets, but never touch a switch while standing in water.',
      'Avoid drains, manholes and canal banks, which may be open or eroded under the water.',
      'Keep your phone charged and conserve battery — send messages rather than calling.',
    ],
    after: [
      'Do not return home until authorities confirm the structure and the electricity supply are safe.',
      'Assume all flood water is contaminated — boil or treat drinking water until supply is declared safe.',
      'Photograph damage before cleaning up, for insurance and relief claims.',
      'Discard food, medicine and cosmetics that touched flood water.',
      'Watch for snakes and debris while clearing, and wear closed footwear and gloves.',
    ],
    checklist: [
      'Drinking water (3 litres per person per day)',
      'Dry food for 3 days',
      'Torch and spare batteries',
      'Power bank',
      'First-aid kit and regular medicines',
      'Waterproof document pouch',
      'Whistle',
      'Change of clothes and blanket',
    ],
    contacts: COMMON_CONTACTS,
  },
  {
    disasterType: 'EARTHQUAKE',
    title: 'Earthquake Safety Guide',
    summary:
      'Most earthquake injuries come from falling objects and from people moving during shaking, not from buildings collapsing. Drop, Cover and Hold On is the response that saves the most lives.',
    before: [
      'Secure tall furniture, water heaters and heavy wall hangings to the wall.',
      'Identify safe spots in each room: under a sturdy table, or against an interior wall away from windows.',
      'Keep heavy items on lower shelves.',
      'Agree a family meeting point outside the building.',
      'Keep sturdy shoes and a torch next to your bed.',
    ],
    during: [
      'Drop to your hands and knees, take cover under a sturdy table, and hold on until shaking stops.',
      'If there is no table, crouch against an interior wall and protect your head and neck with your arms.',
      'Stay indoors until the shaking stops — most injuries happen while people are moving.',
      'If you are outdoors, move to an open area away from buildings, trees, poles and power lines.',
      'If you are in a vehicle, stop clear of bridges and overpasses and stay inside until shaking stops.',
    ],
    after: [
      'Expect aftershocks and be ready to Drop, Cover and Hold On again.',
      'Check yourself and others for injuries before moving anyone who is seriously hurt.',
      'Evacuate damaged buildings and do not re-enter until they have been inspected.',
      'Check for gas leaks by smell — if you suspect one, open windows, leave, and report it.',
      'Use text messages rather than calls to keep networks free for emergency traffic.',
    ],
    checklist: [
      'Sturdy shoes near the bed',
      'Torch and whistle',
      'First-aid kit',
      'Drinking water and dry food',
      'Dust mask',
      'Spare house and vehicle keys',
      'List of emergency contacts on paper',
    ],
    contacts: COMMON_CONTACTS,
  },
  {
    disasterType: 'FIRE',
    title: 'Fire Safety Guide',
    summary:
      'In a building fire you may have less than two minutes to get out. Smoke, not flame, causes most deaths — staying low and leaving immediately matters more than saving belongings.',
    before: [
      'Install smoke alarms and test them monthly.',
      'Keep a fire extinguisher near the kitchen and learn how to use it.',
      'Plan two escape routes from every room and practise them.',
      'Keep exits, stairwells and corridors clear of stored items.',
      'Never overload electrical sockets or leave charging devices on beds or sofas.',
    ],
    during: [
      'Raise the alarm and get everyone out immediately — do not stop to collect belongings.',
      'Stay low, below the smoke line, and crawl if necessary.',
      'Feel doors with the back of your hand before opening; if hot, use another route.',
      'Never use a lift during a fire.',
      'If your clothes catch fire, stop, drop and roll.',
      'Once outside, stay out and call the fire service from a safe distance.',
    ],
    after: [
      'Do not re-enter the building until the fire service declares it safe.',
      'Seek medical attention for smoke inhalation even if you feel fine.',
      'Have the electrical system inspected before power is restored.',
      'Document damage with photographs before clearing anything.',
      'Replace smoke alarms and extinguishers that were used or exposed to heat.',
    ],
    checklist: [
      'Working smoke alarm',
      'Fire extinguisher (ABC type)',
      'Two planned escape routes',
      'Fire blanket for the kitchen',
      'Emergency contact list',
      'Torch near the bed',
    ],
    contacts: COMMON_CONTACTS,
  },
  {
    disasterType: 'CYCLONE',
    title: 'Cyclone Safety Guide',
    summary:
      'Cyclones give hours of warning — use them. The lull as the eye passes overhead is not the end of the storm and is when many people are caught outside.',
    before: [
      'Track official bulletins and know the location of your nearest cyclone shelter.',
      'Secure or bring indoors loose items: pots, boards, furniture, roofing sheets.',
      'Reinforce doors and windows; tape is not a substitute for shutters.',
      'Charge phones and power banks, and fill containers with drinking water.',
      'Move livestock and vehicles to higher, sheltered ground.',
    ],
    during: [
      'Stay indoors in the strongest interior room, away from windows and glass.',
      'Do not go outside during the lull — the eye passes and winds return from the opposite direction.',
      'Switch off electrical mains and gas if flooding begins.',
      'Listen to official radio or SMS bulletins rather than rumours.',
      'If instructed to evacuate, go immediately and take your grab-bag.',
    ],
    after: [
      'Stay away from fallen power lines and report them.',
      'Boil drinking water until the supply is declared safe.',
      'Watch for weakened trees, roofs and walls before entering any structure.',
      'Help neighbours who are elderly, disabled or living alone.',
      'Report damage to the district control room for relief assessment.',
    ],
    checklist: [
      'Battery radio',
      'Drinking water for 3 days',
      'Dry food and baby food if needed',
      'Torch and power bank',
      'Rope and plastic sheeting',
      'First-aid kit',
      'Documents in waterproof cover',
    ],
    contacts: COMMON_CONTACTS,
  },
  {
    disasterType: 'LANDSLIDE',
    title: 'Landslide Safety Guide',
    summary:
      'Landslides usually follow prolonged rain and often give warning signs — tilting trees, new cracks, sudden changes in stream water. Recognising them early is what buys time.',
    before: [
      'Learn whether your area has a history of slope failure.',
      'Watch for new cracks in walls, roads and the ground, and report them.',
      'Do not build or dump debris at the top or base of a steep slope.',
      'Keep drainage channels around the house clear so water does not saturate the slope.',
      'Plan an evacuation route that does not run along the fall line of the slope.',
    ],
    during: [
      'Move away from the path of the slide — sideways, not downhill.',
      'If escape is impossible, curl into a tight ball and protect your head.',
      'Stay clear of river valleys and low-lying areas during heavy rain.',
      'Listen for unusual sounds — cracking trees or boulders knocking together.',
      'Evacuate immediately if the ground begins to move or a stream suddenly runs muddy.',
    ],
    after: [
      'Stay away from the slide area — further failures are common.',
      'Check for injured or trapped people near the slide without entering it yourself.',
      'Report broken utility lines to the authorities.',
      'Have the slope and any affected buildings inspected by an engineer.',
      'Replant bare slopes to reduce future risk once cleared.',
    ],
    checklist: [
      'Torch and whistle',
      'Sturdy footwear',
      'First-aid kit',
      'Drinking water and dry food',
      'Mobile phone and power bank',
      'Evacuation route marked',
    ],
    contacts: COMMON_CONTACTS,
  },
  {
    disasterType: 'HEATWAVE',
    title: 'Heatwave Safety Guide',
    summary:
      'Heatwaves kill quietly, mostly affecting the elderly, outdoor workers and people living alone. Hydration, shade and checking on neighbours prevent nearly all heat deaths.',
    before: [
      'Follow local heat advisories and plan outdoor work for early morning or evening.',
      'Keep a supply of drinking water and oral rehydration salts at home.',
      'Cover windows facing the sun with curtains or reflective sheets.',
      'Identify the nearest cooling centre or air-conditioned public building.',
      'Check that fans and coolers are working before the season starts.',
    ],
    during: [
      'Drink water regularly even when you do not feel thirsty.',
      'Avoid going out between 12pm and 4pm.',
      'Wear loose, light-coloured cotton clothing and cover your head outdoors.',
      'Never leave children, elderly people or animals inside a parked vehicle.',
      'Watch for heat stroke: high body temperature, confusion, hot dry skin, no sweating — this is a medical emergency.',
      'Move an affected person to shade, cool them with wet cloths, and call an ambulance.',
    ],
    after: [
      'Continue hydrating for at least 24 hours after exposure.',
      'Check on elderly neighbours and people living alone.',
      'Seek medical advice if cramps, dizziness or nausea persist.',
      'Review and improve home cooling before the next heat spell.',
    ],
    checklist: [
      'Drinking water bottles',
      'Oral rehydration salts',
      'Umbrella or hat',
      'Cotton clothing',
      'Working fan or cooler',
      'Contact number of nearest clinic',
    ],
    contacts: COMMON_CONTACTS,
  },
  {
    disasterType: 'STORM',
    title: 'Storm and Lightning Safety Guide',
    summary:
      'Severe thunderstorms bring lightning, falling trees and downed power lines. The safest place is indoors, and the most dangerous place is under an isolated tree.',
    before: [
      'Secure or bring in loose outdoor items before the storm arrives.',
      'Trim branches that overhang the roof or power lines.',
      'Unplug sensitive electronics when a storm is forecast.',
      'Keep a torch and battery radio accessible.',
      'Know where your electrical mains switch is.',
    ],
    during: [
      'Go indoors and stay away from windows, doors and metal fittings.',
      'Avoid using wired phones and plumbing during lightning.',
      'If caught outdoors, avoid isolated trees, open fields and high ground; crouch low with feet together.',
      'Do not shelter under or near power lines, hoardings or temporary structures.',
      'If driving, pull over safely away from trees and stay in the vehicle.',
    ],
    after: [
      'Treat every fallen power line as live and report it immediately.',
      'Check the roof, water tank and solar fittings for damage from a safe position.',
      'Avoid flooded underpasses, which may hide debris or open drains.',
      'Help clear blocked roads only under the direction of the authorities.',
    ],
    checklist: [
      'Torch and batteries',
      'Battery radio',
      'Power bank',
      'First-aid kit',
      'Emergency contact list',
    ],
    contacts: COMMON_CONTACTS,
  },
];
