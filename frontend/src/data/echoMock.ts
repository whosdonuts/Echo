import type { EchoOrbKey } from './echoOrbAssets';

export type EchoFilterKey = 'city' | 'country' | 'date' | 'recency';

export type EchoCity = {
  id: string;
  name: string;
  country: string;
  orbKey: EchoOrbKey;
  recencyLabel: string;
  visitDate: string;
  collectionProgress: number;
  collectedCount: number;
  totalCount: number;
  image: string;
  accent: string;
  aura: [string, string];
  note: string;
};

export type EchoCollectionItem = {
  id: string;
  cityId: string;
  title: string;
  area: string;
  note: string;
  image: string;
  tint: string;
  aura: [string, string];
  collected: boolean;
  dateLabel: string;
  popularityCount?: number;
  activityLabel?: string;
};

export type EchoGalleryItem = {
  id: string;
  cityId: string;
  echoId: string;
  title: string;
  area: string;
  caption: string;
  image: string;
  tint: string;
  aspect: 'portrait' | 'square' | 'landscape';
  source: 'mine' | 'others';
};

const citySeeds: EchoCity[] = [
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    orbKey: 'coral',
    recencyLabel: 'Now',
    visitDate: 'Mar 20',
    collectionProgress: 0.84,
    collectedCount: 16,
    totalCount: 19,
    image:
      'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1200&q=80',
    accent: '#E39B86',
    aura: ['#F6D4C6', '#F1B9A6'],
    note: 'Terracotta light, tram metal, and a soft echo held above the river.',
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    orbKey: 'gold',
    recencyLabel: '2 h ago',
    visitDate: 'Mar 19',
    collectionProgress: 0.72,
    collectedCount: 13,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    accent: '#D9B295',
    aura: ['#F3DDCF', '#EAC39F'],
    note: 'Paper lantern warmth and cedar air, held with almost ceremonial restraint.',
  },
  {
    id: 'montreal',
    name: 'Montreal',
    country: 'Canada',
    orbKey: 'sky',
    recencyLabel: '5 h ago',
    visitDate: 'Mar 18',
    collectionProgress: 0.66,
    collectedCount: 11,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=1200&q=80',
    accent: '#A7BFD2',
    aura: ['#DCEBF4', '#B8D0E0'],
    note: 'Cold-blue reflections and the kind of streetlight that makes snow feel cinematic.',
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    orbKey: 'gold',
    recencyLabel: 'Yesterday',
    visitDate: 'Mar 17',
    collectionProgress: 0.58,
    collectedCount: 10,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80',
    accent: '#E2B486',
    aura: ['#F6E2CC', '#E8C7A2'],
    note: 'Harbor air, polished stone, and a disciplined softness in every edge.',
  },
  {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    orbKey: 'lilac',
    recencyLabel: '2 days ago',
    visitDate: 'Mar 16',
    collectionProgress: 0.78,
    collectedCount: 14,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1538485399081-7c897db0d1fd?auto=format&fit=crop&w=1200&q=80',
    accent: '#B39ECC',
    aura: ['#EEE7F7', '#CDBDE2'],
    note: 'Glass towers, violet dusk, and a calm pulse tucked between transit lines.',
  },
  {
    id: 'porto',
    name: 'Porto',
    country: 'Portugal',
    orbKey: 'coral',
    recencyLabel: '3 days ago',
    visitDate: 'Mar 15',
    collectionProgress: 0.61,
    collectedCount: 10,
    totalCount: 16,
    image:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
    accent: '#C59E85',
    aura: ['#F4E1D6', '#DAB39E'],
    note: 'Tiled facades, quiet red roofs, and a collected golden-hour hush.',
  },
  {
    id: 'vienna',
    name: 'Vienna',
    country: 'Austria',
    orbKey: 'gold',
    recencyLabel: '4 days ago',
    visitDate: 'Mar 14',
    collectionProgress: 0.53,
    collectedCount: 9,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1516557070061-c3d1653fa646?auto=format&fit=crop&w=1200&q=80',
    accent: '#D9C1A2',
    aura: ['#F5EBDD', '#E5D1B7'],
    note: 'Cream stone and quiet grandeur, softened by a human scale.',
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    orbKey: 'sky',
    recencyLabel: '5 days ago',
    visitDate: 'Mar 13',
    collectionProgress: 0.46,
    collectedCount: 8,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    accent: '#9BC2D3',
    aura: ['#DFF2F8', '#B9D8E5'],
    note: 'Cool vapor, slate water, and a brightness that never feels loud.',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    orbKey: 'rose',
    recencyLabel: '1 week ago',
    visitDate: 'Mar 11',
    collectionProgress: 0.82,
    collectedCount: 15,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    accent: '#E7B8AA',
    aura: ['#F8E0D7', '#EDC7B9'],
    note: 'Stone facades, mirrored cafes, and a city that edits itself beautifully.',
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    orbKey: 'coral',
    recencyLabel: '1 week ago',
    visitDate: 'Mar 10',
    collectionProgress: 0.44,
    collectedCount: 7,
    totalCount: 16,
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    accent: '#DD9A73',
    aura: ['#F7D9C6', '#E7B18C'],
    note: 'Dusty rose walls, brass flicker, and air that glows instead of shines.',
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    country: 'Sweden',
    orbKey: 'sky',
    recencyLabel: '9 days ago',
    visitDate: 'Mar 08',
    collectionProgress: 0.49,
    collectedCount: 8,
    totalCount: 16,
    image:
      'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80',
    accent: '#9CB6CB',
    aura: ['#E3EDF5', '#BDD3E2'],
    note: 'Clean waterfront geometry, pale sun, and a measured northern glow.',
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    orbKey: 'mint',
    recencyLabel: '11 days ago',
    visitDate: 'Mar 07',
    collectionProgress: 0.69,
    collectedCount: 12,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    accent: '#A4D0BE',
    aura: ['#E0F2EA', '#B6DCCB'],
    note: 'Humid night air and glass reflections held inside a quiet botanical palette.',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    orbKey: 'rose',
    recencyLabel: '2 weeks ago',
    visitDate: 'Mar 03',
    collectionProgress: 0.88,
    collectedCount: 17,
    totalCount: 19,
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    accent: '#D6959D',
    aura: ['#F5DDE2', '#E3B4BA'],
    note: 'Electric detail and perfect pacing, with one soft thing hidden in every block.',
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    orbKey: 'lilac',
    recencyLabel: '2 weeks ago',
    visitDate: 'Mar 01',
    collectionProgress: 0.57,
    collectedCount: 10,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80',
    accent: '#B6B1C7',
    aura: ['#ECEAF4', '#CEC9DD'],
    note: 'Steel, steam, and a rhythm that rewards small acts of attention.',
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    orbKey: 'gold',
    recencyLabel: '3 weeks ago',
    visitDate: 'Feb 26',
    collectionProgress: 0.63,
    collectedCount: 11,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80',
    accent: '#D9A97F',
    aura: ['#F6E0CF', '#E7BF9E'],
    note: 'Jacaranda haze, warm stone, and movement that still leaves room for stillness.',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Turkey',
    orbKey: 'coral',
    recencyLabel: '1 month ago',
    visitDate: 'Feb 18',
    collectionProgress: 0.51,
    collectedCount: 9,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80',
    accent: '#C7A07C',
    aura: ['#F2E2D5', '#D8B294'],
    note: 'Water, call to prayer, and a layered horizon that never quite flattens.',
  },
];

const mineTemplates = [
  {
    slug: 'river-light',
    title: 'River light',
    area: 'Waterfront edge',
    note: 'The light on the water made {city} feel newly invented for a minute.',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'station-air',
    title: 'Station air',
    area: 'Arrival hall',
    note: 'A soft draft ran through the concourse and carried {city} forward.',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'late-window',
    title: 'Late window',
    area: 'Side-street glass',
    note: 'Neon on glass and footsteps folding quietly into the curb.',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'morning-steps',
    title: 'Morning steps',
    area: 'Old stone steps',
    note: 'A bright slow start, almost too gentle to keep all to yourself.',
    image:
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'rooftop-breath',
    title: 'Rooftop breath',
    area: 'Upper terrace',
    note: 'The view held longer than the sentence I meant to leave behind in {city}.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'market-hum',
    title: 'Market hum',
    area: 'Covered arcade',
    note: 'Warm voices and tinny music braided together by accident.',
    image:
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  },
];

const othersTemplates = [
  {
    slug: 'shared-dusk',
    title: 'Shared dusk',
    area: 'Public square',
    note: 'Everybody seems to leave the same kind of evening here.',
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    popularityBase: 468,
    activityLabel: 'left this week',
  },
  {
    slug: 'harbor-chime',
    title: 'Harbor chime',
    area: 'Lower quay',
    note: 'Wind, metal, and a repeating tenderness people keep answering.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    popularityBase: 389,
    activityLabel: 'active tonight',
  },
  {
    slug: 'after-rain',
    title: 'After rain',
    area: 'Market lane',
    note: 'People keep tagging wet pavement and the calm that follows it.',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    popularityBase: 316,
    activityLabel: 'most replayed',
  },
  {
    slug: 'night-platform',
    title: 'Night platform',
    area: 'Transit pocket',
    note: 'A familiar mix of waiting, departure, and the echo of brakes.',
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
    popularityBase: 244,
    activityLabel: 'quietly rising',
  },
];

const galleryAspectPattern: EchoGalleryItem['aspect'][] = [
  'portrait',
  'square',
  'square',
  'landscape',
  'square',
  'square',
];

export const echoFilterKeys: EchoFilterKey[] = ['city', 'country', 'date', 'recency'];
export const allEchoCities = citySeeds;
export const recentEchoCities = allEchoCities.slice(0, 12);

const mineEchoes: EchoCollectionItem[] = allEchoCities.flatMap((city, cityIndex) => {
  const visibleCount = Math.max(
    2,
    Math.min(mineTemplates.length - 1, Math.round(city.collectionProgress * mineTemplates.length)),
  );

  return mineTemplates.map((template, index) => ({
    id: `${city.id}-mine-${template.slug}`,
    cityId: city.id,
    title: template.title,
    area: template.area,
    note: template.note.replace('{city}', city.name),
    image: template.image,
    tint: city.accent,
    aura: city.aura,
    collected: index < visibleCount,
    dateLabel: `${city.visitDate} / saved ${Math.max(1, cityIndex + index)}d apart`,
  }));
});

const othersEchoes: EchoCollectionItem[] = allEchoCities.flatMap((city, cityIndex) =>
  othersTemplates.map((template, index) => ({
    id: `${city.id}-others-${template.slug}`,
    cityId: city.id,
    title: template.title,
    area: template.area,
    note: `${template.note} ${city.name} keeps pulling the same feeling back to the surface.`,
    image: template.image,
    tint: city.accent,
    aura: city.aura,
    collected: true,
    dateLabel: `${city.visitDate} / ${template.activityLabel}`,
    popularityCount: template.popularityBase - cityIndex * 8 - index * 11,
    activityLabel: template.activityLabel,
  })),
);

const galleryItems: EchoGalleryItem[] = allEchoCities.flatMap((city) => {
  const cityMine = mineEchoes.filter((item) => item.cityId === city.id);
  const cityOthers = othersEchoes.filter((item) => item.cityId === city.id);

  return [...cityMine, ...cityOthers].map((item, index) => ({
    id: `${item.id}-gallery`,
    cityId: city.id,
    echoId: item.id,
    title: item.title,
    area: item.area,
    caption: item.note,
    image: item.image,
    tint: city.accent,
    aspect: galleryAspectPattern[index % galleryAspectPattern.length] ?? 'square',
    source: item.id.includes('-mine-') ? 'mine' : 'others',
  }));
});

export function getEchoCity(cityId: string) {
  return allEchoCities.find((city) => city.id === cityId);
}

export function getEchoCityMineEchoes(cityId: string) {
  return mineEchoes.filter((item) => item.cityId === cityId);
}

export function getEchoCityOtherEchoes(cityId: string) {
  return [...othersEchoes]
    .filter((item) => item.cityId === cityId)
    .sort((a, b) => (b.popularityCount ?? 0) - (a.popularityCount ?? 0));
}

export function getEchoCollectionItem(itemId: string) {
  return mineEchoes.find((item) => item.id === itemId) ?? othersEchoes.find((item) => item.id === itemId);
}

export function getEchoGalleryItemsForCity(cityId: string) {
  return galleryItems.filter((item) => item.cityId === cityId);
}

export function filterEchoCities(cities: EchoCity[], query: string, filterKey: EchoFilterKey) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return cities;
  }

  return cities.filter((city) => {
    if (filterKey === 'city') {
      return city.name.toLowerCase().includes(normalized) || city.note.toLowerCase().includes(normalized);
    }

    if (filterKey === 'country') {
      return city.country.toLowerCase().includes(normalized) || city.note.toLowerCase().includes(normalized);
    }

    if (filterKey === 'date') {
      return city.visitDate.toLowerCase().includes(normalized);
    }

    return city.recencyLabel.toLowerCase().includes(normalized) || city.note.toLowerCase().includes(normalized);
  });
}
