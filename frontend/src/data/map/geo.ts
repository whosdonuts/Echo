export interface WesternFragment {
  title: string;
  subtitle: string;
  tag: string;
  lat: number;
  lng: number;
}

export const PERTH_HALL = {
  lat: 43.00013137386861,
  lng: -81.27687854244074,
} as const;

const TAG_PALETTE: Record<string, { core: string; glow: string; badge: string }> = {
  featured:  { core: '#d97706', glow: 'rgba(217,119,6,0.30)',  badge: 'rgba(217,119,6,0.10)' },
  rare:      { core: '#7c3aed', glow: 'rgba(124,58,237,0.30)', badge: 'rgba(124,58,237,0.10)' },
  social:    { core: '#2563eb', glow: 'rgba(37,99,235,0.28)',  badge: 'rgba(37,99,235,0.10)' },
  archive:   { core: '#9333ea', glow: 'rgba(147,51,234,0.28)', badge: 'rgba(147,51,234,0.10)' },
  unlocked:  { core: '#d4a017', glow: 'rgba(212,160,23,0.35)', badge: 'rgba(212,160,23,0.12)' },
  common:    { core: '#78716c', glow: 'rgba(120,113,108,0.18)', badge: 'rgba(120,113,108,0.08)' },
  legendary: { core: '#f59e0b', glow: 'rgba(245,158,11,0.40)', badge: 'rgba(245,158,11,0.12)' },
  locked:    { core: '#94a3b8', glow: 'rgba(148,163,184,0.14)', badge: 'rgba(148,163,184,0.08)' },
};

const FALLBACK = TAG_PALETTE.common;

export function getTagColor(tag: string) {
  return TAG_PALETTE[tag.toLowerCase()] ?? FALLBACK;
}

export function isPremiumTag(tag: string) {
  const t = tag.toLowerCase();
  return t === 'featured' || t === 'legendary';
}

export function isUnlockedTag(tag: string) {
  return tag.toLowerCase() === 'unlocked';
}

export function isLockedTag(tag: string) {
  return tag.toLowerCase() === 'locked';
}

export const ACEB_SUBTITLE = 'Amit Chakma Engineering Building';

export function isAcebFragment(f: WesternFragment) {
  return f.subtitle === ACEB_SUBTITLE;
}

export function fragmentsToGeoJSON(fragments: WesternFragment[]) {
  return {
    type: 'FeatureCollection' as const,
    features: fragments.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] as [number, number] },
      properties: { title: f.title, subtitle: f.subtitle, tag: f.tag },
    })),
  };
}
