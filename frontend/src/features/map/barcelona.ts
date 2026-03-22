import { FragmentFeatureCollection, WesternFragment } from './types';

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BARCELONA_CENTER = { lat: 41.3874, lng: 2.1686 };
export const SAGRADA_FAMILIA = { lat: 41.4036, lng: 2.1744 };

export const BARCELONA_HEROES: WesternFragment[] = [
  {
    title: "Light Through Gaudi's Glass",
    subtitle: 'Basílica de la Sagrada Família',
    tag: 'Featured',
    lat: SAGRADA_FAMILIA.lat,
    lng: SAGRADA_FAMILIA.lng,
  },
  {
    title: 'Gothic Quarter Stillness',
    subtitle: 'Barri Gòtic',
    tag: 'Unlocked',
    lat: 41.3833,
    lng: 2.1761,
  },
  {
    title: 'Sunset on La Barceloneta',
    subtitle: 'Platja de la Barceloneta',
    tag: 'Unlocked',
    lat: 41.3785,
    lng: 2.1892,
  },
  {
    title: 'Rambla Footsteps',
    subtitle: 'La Rambla',
    tag: 'Unlocked',
    lat: 41.3809,
    lng: 2.1735,
  },
  {
    title: 'Morning at Boqueria',
    subtitle: 'Mercat de la Boqueria',
    tag: 'Featured',
    lat: 41.3816,
    lng: 2.1718,
  },
  {
    title: 'Park Güell Overlook',
    subtitle: 'Park Güell',
    tag: 'Legendary',
    lat: 41.4145,
    lng: 2.1527,
  },
];

type Zone = {
  lat: number;
  lng: number;
  weight: number;
  radius: number;
};

const ZONES: Zone[] = [
  { lat: 41.4036, lng: 2.1744, weight: 1.0, radius: 0.012 },
  { lat: 41.3833, lng: 2.1761, weight: 0.85, radius: 0.008 },
  { lat: 41.3785, lng: 2.1892, weight: 0.6, radius: 0.007 },
  { lat: 41.4004, lng: 2.1535, weight: 0.7, radius: 0.01 },
  { lat: 41.37, lng: 2.153, weight: 0.45, radius: 0.008 },
  { lat: 41.3874, lng: 2.1686, weight: 0.9, radius: 0.01 },
  { lat: 41.392, lng: 2.183, weight: 0.55, radius: 0.008 },
  { lat: 41.396, lng: 2.162, weight: 0.5, radius: 0.007 },
];

const AMBIENT_TITLES = [
  'Corner Memory',
  'Passing Echo',
  'Afternoon Signal',
  'Street Reverb',
  'Crosswalk Moment',
  'Balcony View',
  'Evening Pulse',
  'Café Trace',
  'Night Walk Return',
  'Quiet Hour',
  'Sunday Static',
  'Market Signal',
  'Side Street Glow',
  'Platform Wait',
  'Doorway Replay',
  'Terrace Drift',
  'Fountain Sound',
  'Rooftop Check-In',
  'Metro Exit Haze',
  'Alley Afterglow',
  'Bench Between Things',
  'Archway Echo',
  'Tile Floor Memory',
  'Window Light',
  'Before the Rain',
  'Blue Hour Walk',
  'Stairwell Signal',
  'Old Quarter Hum',
  'Golden Hour Trace',
  'Passage Echo',
];

const AMBIENT_TAGS: { tag: string; weight: number }[] = [
  { tag: 'Unlocked', weight: 0.3 },
  { tag: 'Common', weight: 0.25 },
  { tag: 'Archive', weight: 0.15 },
  { tag: 'Social', weight: 0.12 },
  { tag: 'Rare', weight: 0.1 },
  { tag: 'Locked', weight: 0.08 },
];

function pickTag(rng: () => number) {
  let value = rng();
  for (const option of AMBIENT_TAGS) {
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

const SEED = 420_613;

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
      title: AMBIENT_TITLES[Math.floor(rng() * AMBIENT_TITLES.length)],
      subtitle: 'Barcelona',
      tag: pickTag(rng),
      lat,
      lng,
    });
  }

  return output;
}

function generateCorridors(count: number, rng: () => number): WesternFragment[] {
  const corridors: [Zone, Zone][] = [
    [ZONES[0], ZONES[5]],
    [ZONES[5], ZONES[1]],
    [ZONES[1], ZONES[2]],
    [ZONES[5], ZONES[3]],
  ];

  const output: WesternFragment[] = [];
  const perCorridor = Math.ceil(count / corridors.length);

  for (const [start, end] of corridors) {
    for (let index = 0; index < perCorridor && output.length < count; index += 1) {
      const progress = rng();
      const lat = start.lat + (end.lat - start.lat) * progress + (rng() - 0.5) * 0.004;
      const lng = start.lng + (end.lng - start.lng) * progress + (rng() - 0.5) * 0.004;
      output.push({
        title: AMBIENT_TITLES[Math.floor(rng() * AMBIENT_TITLES.length)],
        subtitle: 'Barcelona',
        tag: pickTag(rng),
        lat,
        lng,
      });
    }
  }

  return output;
}

const ambientCache = generateAmbient(160);
const corridorCache = generateCorridors(40, mulberry32(SEED + 7));

export const BARCELONA_ALL: WesternFragment[] = [
  ...BARCELONA_HEROES,
  ...ambientCache,
  ...corridorCache,
];

export function barcelonaToFeatureCollection(): FragmentFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: BARCELONA_ALL.map((fragment) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [fragment.lng, fragment.lat],
      },
      properties: {
        title: fragment.title,
        subtitle: fragment.subtitle,
        tag: fragment.tag,
      },
    })),
  };
}

export const barcelonaCount = BARCELONA_ALL.length;
export const barcelonaUnlockedCount = BARCELONA_ALL.filter(
  (fragment) => fragment.tag === 'Unlocked',
).length;
