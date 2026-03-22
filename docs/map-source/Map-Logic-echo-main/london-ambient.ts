import type { WesternFragment } from './geo';

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

// ── London, Ontario neighborhood zones ──────────────────────────────────

interface Zone {
  lat: number;
  lng: number;
  weight: number;
  radius: number;
  label: string;
}

const ZONES: Zone[] = [
  { lat: 42.9837, lng: -81.2497, weight: 1.0,  radius: 0.010, label: 'Downtown Core' },
  { lat: 42.9710, lng: -81.2430, weight: 0.55, radius: 0.008, label: 'Old East Village' },
  { lat: 42.9890, lng: -81.2320, weight: 0.50, radius: 0.007, label: 'East London' },
  { lat: 42.9930, lng: -81.2650, weight: 0.65, radius: 0.009, label: 'Wortley Village' },
  { lat: 43.0100, lng: -81.2750, weight: 0.45, radius: 0.007, label: 'Cherryhill / Wharncliffe' },
  { lat: 42.9650, lng: -81.2200, weight: 0.40, radius: 0.008, label: 'South London' },
  { lat: 43.0050, lng: -81.2350, weight: 0.50, radius: 0.008, label: 'Fanshawe / Stoney Creek' },
  { lat: 42.9780, lng: -81.2700, weight: 0.55, radius: 0.007, label: 'Ridout / Thames' },
  { lat: 42.9950, lng: -81.2150, weight: 0.35, radius: 0.006, label: 'Argyle / Highbury' },
  { lat: 43.0200, lng: -81.2900, weight: 0.30, radius: 0.006, label: 'Byron' },
  { lat: 42.9550, lng: -81.2750, weight: 0.30, radius: 0.006, label: 'White Oaks' },
];

const TITLES = [
  'Corner Echo', 'Crossing Signal', 'Quiet Bench', 'Patio Memory',
  'Side Street Trace', 'Parking Lot Afterglow', 'Bus Stop Wait',
  'Afternoon Walk', 'Late Night Return', 'Window Reflection',
  'Bridge Crossing', 'Old Sign Memory', 'Intersection Pause',
  'Garden Path', 'Lamp Post Echo', 'Morning Jog Trace',
  'Curb Moment', 'Alley Shortcut', 'Fence Line View',
  'River Path Signal', 'Storefront Ghost', 'Awning Shade Memory',
  'Sidewalk Crack', 'Mailbox Stop', 'Church Steps Echo',
  'Playground Sound', 'Gas Station Night', 'Trail Marker',
];

const TAGS: { tag: string; weight: number }[] = [
  { tag: 'Unlocked', weight: 0.20 },
  { tag: 'Common',   weight: 0.30 },
  { tag: 'Archive',  weight: 0.15 },
  { tag: 'Social',   weight: 0.15 },
  { tag: 'Rare',     weight: 0.10 },
  { tag: 'Locked',   weight: 0.10 },
];

function pickTag(rng: () => number): string {
  let r = rng();
  for (const t of TAGS) {
    r -= t.weight;
    if (r <= 0) return t.tag;
  }
  return 'Common';
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

// ── Generators ──────────────────────────────────────────────────────────

const SEED = 810_225;

function generateAmbient(count: number): WesternFragment[] {
  const rng = mulberry32(SEED);
  const out: WesternFragment[] = [];

  for (let i = 0; i < count; i++) {
    const zone = pickZone(rng);
    const angle = rng() * Math.PI * 2;
    const dist = Math.sqrt(rng()) * zone.radius;
    const lat = zone.lat + Math.sin(angle) * dist;
    const lng = zone.lng + Math.cos(angle) * dist * 1.3;
    const title = TITLES[Math.floor(rng() * TITLES.length)];
    const tag = pickTag(rng);
    out.push({ title, subtitle: zone.label, tag, lat, lng });
  }

  return out;
}

function generateCorridors(count: number, rng: () => number): WesternFragment[] {
  const corridors: [Zone, Zone][] = [
    [ZONES[0], ZONES[1]], // Downtown → Old East Village
    [ZONES[0], ZONES[3]], // Downtown → Wortley Village
    [ZONES[0], ZONES[7]], // Downtown → Ridout / Thames
    [ZONES[4], ZONES[0]], // Cherryhill → Downtown
    [ZONES[0], ZONES[2]], // Downtown → East London
  ];

  const out: WesternFragment[] = [];
  const perCorridor = Math.ceil(count / corridors.length);

  for (const [a, b] of corridors) {
    for (let i = 0; i < perCorridor && out.length < count; i++) {
      const t = rng();
      const lat = a.lat + (b.lat - a.lat) * t + (rng() - 0.5) * 0.003;
      const lng = a.lng + (b.lng - a.lng) * t + (rng() - 0.5) * 0.003;
      const title = TITLES[Math.floor(rng() * TITLES.length)];
      const tag = pickTag(rng);
      out.push({ title, subtitle: 'London, ON', tag, lat, lng });
    }
  }

  return out;
}

// ── Public API ──────────────────────────────────────────────────────────

const AMBIENT_COUNT = 180;
const CORRIDOR_COUNT = 40;

const _ambient = generateAmbient(AMBIENT_COUNT);
const _corridors = generateCorridors(CORRIDOR_COUNT, mulberry32(SEED + 13));

export const LONDON_AMBIENT: WesternFragment[] = [..._ambient, ..._corridors];

export const londonAmbientCount = LONDON_AMBIENT.length;
