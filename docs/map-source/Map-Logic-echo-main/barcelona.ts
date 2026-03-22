import type { WesternFragment } from './geo';
import type { FeatureCollection, Point } from 'geojson';

// ── Seeded PRNG (mulberry32) ────────────────────────────────────────────

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Barcelona center + Sagrada Família ──────────────────────────────────

export const BARCELONA_CENTER = { lat: 41.3874, lng: 2.1686 };
export const SAGRADA_FAMILIA = { lat: 41.4036, lng: 2.1744 };

// ── Hero fragments (handcrafted) ────────────────────────────────────────

export const BARCELONA_HEROES: WesternFragment[] = [
  {
    title: 'Light Through Gaudí\'s Glass',
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

export function isSagradaFragment(f: WesternFragment) {
  return f.subtitle === 'Basílica de la Sagrada Família';
}

// ── Neighborhood zones for procedural density ───────────────────────────

interface Zone {
  lat: number;
  lng: number;
  weight: number;
  radius: number;
}

const ZONES: Zone[] = [
  { lat: 41.4036, lng: 2.1744, weight: 1.0,  radius: 0.012 }, // Sagrada Família / Eixample
  { lat: 41.3833, lng: 2.1761, weight: 0.85, radius: 0.008 }, // Gothic Quarter / El Born
  { lat: 41.3785, lng: 2.1892, weight: 0.6,  radius: 0.007 }, // Barceloneta
  { lat: 41.4004, lng: 2.1535, weight: 0.7,  radius: 0.010 }, // Gràcia
  { lat: 41.3700, lng: 2.1530, weight: 0.45, radius: 0.008 }, // Montjuïc edge
  { lat: 41.3874, lng: 2.1686, weight: 0.9,  radius: 0.010 }, // Plaça de Catalunya / central
  { lat: 41.3920, lng: 2.1830, weight: 0.55, radius: 0.008 }, // Fort Pienc
  { lat: 41.3960, lng: 2.1620, weight: 0.5,  radius: 0.007 }, // Sant Gervasi edge
];

const AMBIENT_TITLES = [
  'Corner Memory', 'Passing Echo', 'Afternoon Signal', 'Street Reverb',
  'Crosswalk Moment', 'Balcony View', 'Evening Pulse', 'Café Trace',
  'Night Walk Return', 'Quiet Hour', 'Sunday Static', 'Market Signal',
  'Side Street Glow', 'Platform Wait', 'Doorway Replay', 'Terrace Drift',
  'Fountain Sound', 'Rooftop Check-In', 'Metro Exit Haze', 'Alley Afterglow',
  'Bench Between Things', 'Archway Echo', 'Tile Floor Memory', 'Window Light',
  'Before the Rain', 'Blue Hour Walk', 'Stairwell Signal', 'Old Quarter Hum',
  'Golden Hour Trace', 'Passage Echo',
];

const AMBIENT_TAGS: { tag: string; weight: number }[] = [
  { tag: 'Unlocked', weight: 0.30 },
  { tag: 'Common',   weight: 0.25 },
  { tag: 'Archive',  weight: 0.15 },
  { tag: 'Social',   weight: 0.12 },
  { tag: 'Rare',     weight: 0.10 },
  { tag: 'Locked',   weight: 0.08 },
];

function pickTag(rng: () => number): string {
  let r = rng();
  for (const t of AMBIENT_TAGS) {
    r -= t.weight;
    if (r <= 0) return t.tag;
  }
  return 'Common';
}

// ── Generator ───────────────────────────────────────────────────────────

const SEED = 420_613;

function generateAmbient(count: number): WesternFragment[] {
  const rng = mulberry32(SEED);
  const out: WesternFragment[] = [];

  for (let i = 0; i < count; i++) {
    const zone = pickZone(rng);
    const angle = rng() * Math.PI * 2;
    const dist = Math.sqrt(rng()) * zone.radius;
    const lat = zone.lat + Math.sin(angle) * dist;
    const lng = zone.lng + Math.cos(angle) * dist * 1.3;

    const title = AMBIENT_TITLES[Math.floor(rng() * AMBIENT_TITLES.length)];
    const tag = pickTag(rng);

    out.push({ title, subtitle: 'Barcelona', tag, lat, lng });
  }

  return out;
}

function pickZone(rng: () => number): Zone {
  const totalW = ZONES.reduce((s, z) => s + z.weight, 0);
  let r = rng() * totalW;
  for (const z of ZONES) {
    r -= z.weight;
    if (r <= 0) return z;
  }
  return ZONES[0];
}

// ── Corridor connectors (lighter density between clusters) ──────────────

function generateCorridors(count: number, rng: () => number): WesternFragment[] {
  const corridors: [Zone, Zone][] = [
    [ZONES[0], ZONES[5]],  // Sagrada → Plaça Catalunya
    [ZONES[5], ZONES[1]],  // Plaça Catalunya → Gothic
    [ZONES[1], ZONES[2]],  // Gothic → Barceloneta
    [ZONES[5], ZONES[3]],  // Plaça Catalunya → Gràcia
  ];

  const out: WesternFragment[] = [];
  const perCorridor = Math.ceil(count / corridors.length);

  for (const [a, b] of corridors) {
    for (let i = 0; i < perCorridor && out.length < count; i++) {
      const t = rng();
      const lat = a.lat + (b.lat - a.lat) * t + (rng() - 0.5) * 0.004;
      const lng = a.lng + (b.lng - a.lng) * t + (rng() - 0.5) * 0.004;
      const title = AMBIENT_TITLES[Math.floor(rng() * AMBIENT_TITLES.length)];
      const tag = pickTag(rng);
      out.push({ title, subtitle: 'Barcelona', tag, lat, lng });
    }
  }

  return out;
}

// ── Public API ──────────────────────────────────────────────────────────

const AMBIENT_COUNT = 160;
const CORRIDOR_COUNT = 40;

const _ambientCache = generateAmbient(AMBIENT_COUNT);
const _corridorCache = generateCorridors(CORRIDOR_COUNT, mulberry32(SEED + 7));

export const BARCELONA_ALL: WesternFragment[] = [
  ...BARCELONA_HEROES,
  ..._ambientCache,
  ..._corridorCache,
];

export function barcelonaToGeoJSON(): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: BARCELONA_ALL.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { title: f.title, subtitle: f.subtitle, tag: f.tag },
    })),
  };
}

export const barcelonaCount = BARCELONA_ALL.length;
export const barcelonaUnlockedCount = BARCELONA_ALL.filter(
  (f) => f.tag === 'Unlocked',
).length;
