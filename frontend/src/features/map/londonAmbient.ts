import { WesternFragment } from './types';

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Zone = {
  lat: number;
  lng: number;
  weight: number;
  radius: number;
  label: string;
};

const ZONES: Zone[] = [
  { lat: 42.9837, lng: -81.2497, weight: 1.0, radius: 0.01, label: 'Downtown Core' },
  { lat: 42.971, lng: -81.243, weight: 0.55, radius: 0.008, label: 'Old East Village' },
  { lat: 42.989, lng: -81.232, weight: 0.5, radius: 0.007, label: 'East London' },
  { lat: 42.993, lng: -81.265, weight: 0.65, radius: 0.009, label: 'Wortley Village' },
  { lat: 43.01, lng: -81.275, weight: 0.45, radius: 0.007, label: 'Cherryhill / Wharncliffe' },
  { lat: 42.965, lng: -81.22, weight: 0.4, radius: 0.008, label: 'South London' },
  { lat: 43.005, lng: -81.235, weight: 0.5, radius: 0.008, label: 'Fanshawe / Stoney Creek' },
  { lat: 42.978, lng: -81.27, weight: 0.55, radius: 0.007, label: 'Ridout / Thames' },
  { lat: 42.995, lng: -81.215, weight: 0.35, radius: 0.006, label: 'Argyle / Highbury' },
  { lat: 43.02, lng: -81.29, weight: 0.3, radius: 0.006, label: 'Byron' },
  { lat: 42.955, lng: -81.275, weight: 0.3, radius: 0.006, label: 'White Oaks' },
];

const TITLES = [
  'Corner Echo',
  'Crossing Signal',
  'Quiet Bench',
  'Patio Memory',
  'Side Street Trace',
  'Parking Lot Afterglow',
  'Bus Stop Wait',
  'Afternoon Walk',
  'Late Night Return',
  'Window Reflection',
  'Bridge Crossing',
  'Old Sign Memory',
  'Intersection Pause',
  'Garden Path',
  'Lamp Post Echo',
  'Morning Jog Trace',
  'Curb Moment',
  'Alley Shortcut',
  'Fence Line View',
  'River Path Signal',
  'Storefront Ghost',
  'Awning Shade Memory',
  'Sidewalk Crack',
  'Mailbox Stop',
  'Church Steps Echo',
  'Playground Sound',
  'Gas Station Night',
  'Trail Marker',
];

const TAGS: { tag: string; weight: number }[] = [
  { tag: 'Unlocked', weight: 0.2 },
  { tag: 'Common', weight: 0.3 },
  { tag: 'Archive', weight: 0.15 },
  { tag: 'Social', weight: 0.15 },
  { tag: 'Rare', weight: 0.1 },
  { tag: 'Locked', weight: 0.1 },
];

function pickTag(rng: () => number) {
  let value = rng();
  for (const option of TAGS) {
    value -= option.weight;
    if (value <= 0) {
      return option.tag;
    }
  }
  return 'Common';
}

function pickZone(rng: () => number) {
  const totalWeight = ZONES.reduce((sum, zone) => sum + zone.weight, 0);
  let value = rng() * totalWeight;
  for (const zone of ZONES) {
    value -= zone.weight;
    if (value <= 0) {
      return zone;
    }
  }
  return ZONES[0];
}

const SEED = 810_225;

function generateAmbient(count: number): WesternFragment[] {
  const rng = mulberry32(SEED);
  const output: WesternFragment[] = [];

  for (let index = 0; index < count; index += 1) {
    const zone = pickZone(rng);
    const angle = rng() * Math.PI * 2;
    const distance = Math.sqrt(rng()) * zone.radius;
    const lat = zone.lat + Math.sin(angle) * distance;
    const lng = zone.lng + Math.cos(angle) * distance * 1.3;

    output.push({
      title: TITLES[Math.floor(rng() * TITLES.length)],
      subtitle: zone.label,
      tag: pickTag(rng),
      lat,
      lng,
    });
  }

  return output;
}

function generateCorridors(count: number, rng: () => number): WesternFragment[] {
  const corridors: [Zone, Zone][] = [
    [ZONES[0], ZONES[1]],
    [ZONES[0], ZONES[3]],
    [ZONES[0], ZONES[7]],
    [ZONES[4], ZONES[0]],
    [ZONES[0], ZONES[2]],
  ];

  const output: WesternFragment[] = [];
  const perCorridor = Math.ceil(count / corridors.length);

  for (const [start, end] of corridors) {
    for (let index = 0; index < perCorridor && output.length < count; index += 1) {
      const progress = rng();
      const lat = start.lat + (end.lat - start.lat) * progress + (rng() - 0.5) * 0.003;
      const lng = start.lng + (end.lng - start.lng) * progress + (rng() - 0.5) * 0.003;

      output.push({
        title: TITLES[Math.floor(rng() * TITLES.length)],
        subtitle: 'London, ON',
        tag: pickTag(rng),
        lat,
        lng,
      });
    }
  }

  return output;
}

const ambient = generateAmbient(180);
const corridors = generateCorridors(40, mulberry32(SEED + 13));

export const LONDON_AMBIENT: WesternFragment[] = [...ambient, ...corridors];
