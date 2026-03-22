import { FragmentFeatureCollection, WesternFragment } from './types';

export const ACEB_SUBTITLE = 'Amit Chakma Engineering Building';

const TAG_PALETTE: Record<string, { core: string; glow: string; badge: string }> = {
  featured: { core: '#d97706', glow: 'rgba(217,119,6,0.30)', badge: 'rgba(217,119,6,0.10)' },
  rare: { core: '#7c3aed', glow: 'rgba(124,58,237,0.30)', badge: 'rgba(124,58,237,0.10)' },
  social: { core: '#2563eb', glow: 'rgba(37,99,235,0.28)', badge: 'rgba(37,99,235,0.10)' },
  archive: { core: '#9333ea', glow: 'rgba(147,51,234,0.28)', badge: 'rgba(147,51,234,0.10)' },
  unlocked: { core: '#d4a017', glow: 'rgba(212,160,23,0.35)', badge: 'rgba(212,160,23,0.12)' },
  common: { core: '#78716c', glow: 'rgba(120,113,108,0.18)', badge: 'rgba(120,113,108,0.08)' },
  legendary: { core: '#f59e0b', glow: 'rgba(245,158,11,0.40)', badge: 'rgba(245,158,11,0.12)' },
  locked: { core: '#94a3b8', glow: 'rgba(148,163,184,0.14)', badge: 'rgba(148,163,184,0.08)' },
};

const FALLBACK = TAG_PALETTE.common;

export function getTagColor(tag: string) {
  return TAG_PALETTE[tag.toLowerCase()] ?? FALLBACK;
}

export function isAcebFragment(fragment: WesternFragment) {
  return fragment.subtitle === ACEB_SUBTITLE;
}

export function isPremiumTag(tag: string) {
  const normalized = tag.toLowerCase();
  return normalized === 'featured' || normalized === 'legendary';
}

export function isUnlockedTag(tag: string) {
  return tag.toLowerCase() === 'unlocked';
}

export function fragmentsToFeatureCollection(
  fragments: WesternFragment[],
): FragmentFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fragments.map((fragment) => ({
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
