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
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    orbKey: 'coral',
    recencyLabel: 'Now',
    visitDate: 'Mar 20',
    collectionProgress: 0.86,
    collectedCount: 18,
    totalCount: 21,
    image:
      'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1200&q=80',
    accent: '#D99973',
    aura: ['#F8DDCE', '#E7B995'],
    note: 'Warm stone, long boulevards, and a skyline that feels edited by sunlight.',
  },
  {
    id: 'milton',
    name: 'Milton',
    country: 'Canada',
    orbKey: 'mint',
    recencyLabel: '2 h ago',
    visitDate: 'Mar 19',
    collectionProgress: 0.64,
    collectedCount: 12,
    totalCount: 19,
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    accent: '#98C4B4',
    aura: ['#E3F2EC', '#BADBCE'],
    note: 'Clean lines, distant towers, and a calm suburban horizon held in soft glass.',
  },
  {
    id: 'london-ontario',
    name: 'London, Ontario',
    country: 'Canada',
    orbKey: 'sky',
    recencyLabel: '5 h ago',
    visitDate: 'Mar 18',
    collectionProgress: 0.73,
    collectedCount: 14,
    totalCount: 19,
    image:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
    accent: '#96B8D6',
    aura: ['#E2EEF8', '#BCD4E8'],
    note: 'River light, mirrored towers, and a colder blue that still reads intimate.',
  },
  {
    id: 'mississauga',
    name: 'Mississauga',
    country: 'Canada',
    orbKey: 'lilac',
    recencyLabel: 'Yesterday',
    visitDate: 'Mar 17',
    collectionProgress: 0.61,
    collectedCount: 11,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
    accent: '#B3A6C8',
    aura: ['#EFE8F6', '#D3C6E3'],
    note: 'Glass curves, dusk reflections, and a skyline that feels polished without trying.',
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    orbKey: 'gold',
    recencyLabel: '2 days ago',
    visitDate: 'Mar 16',
    collectionProgress: 0.89,
    collectedCount: 19,
    totalCount: 22,
    image:
      'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=1200&q=80',
    accent: '#D7B187',
    aura: ['#F8E7D7', '#E9C7A5'],
    note: 'Tall light, lake haze, and a skyline that still lands with cinematic certainty.',
  },
  {
    id: 'hamilton',
    name: 'Hamilton',
    country: 'Canada',
    orbKey: 'rose',
    recencyLabel: '3 days ago',
    visitDate: 'Mar 15',
    collectionProgress: 0.58,
    collectedCount: 10,
    totalCount: 17,
    image:
      'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80',
    accent: '#D8A0A7',
    aura: ['#F7E0E4', '#E6BCC4'],
    note: 'Steel edges, escarpment air, and a horizon with more texture than gloss.',
  },
  {
    id: 'kingston-ja',
    name: 'Kingston, JA',
    country: 'Jamaica',
    orbKey: 'coral',
    recencyLabel: '4 days ago',
    visitDate: 'Mar 14',
    collectionProgress: 0.67,
    collectedCount: 12,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    accent: '#D59073',
    aura: ['#F8DCCF', '#E8B49C'],
    note: 'Heat shimmer, coastal brightness, and a skyline softened by tropical air.',
  },
  {
    id: 'orlando',
    name: 'Orlando',
    country: 'United States',
    orbKey: 'mint',
    recencyLabel: '5 days ago',
    visitDate: 'Mar 13',
    collectionProgress: 0.55,
    collectedCount: 10,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    accent: '#9FCDBF',
    aura: ['#E4F3EE', '#C1E0D4'],
    note: 'Lake reflections, evening towers, and a skyline tuned for clean warm light.',
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    orbKey: 'lilac',
    recencyLabel: '1 week ago',
    visitDate: 'Mar 11',
    collectionProgress: 0.76,
    collectedCount: 15,
    totalCount: 20,
    image:
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80',
    accent: '#B6B1C7',
    aura: ['#ECEAF4', '#CEC9DD'],
    note: 'Steel, steam, and a skyline that looks engineered for memory.',
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    orbKey: 'sky',
    recencyLabel: '9 days ago',
    visitDate: 'Mar 08',
    collectionProgress: 0.62,
    collectedCount: 11,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    accent: '#9BBED5',
    aura: ['#E1EEF6', '#B9D4E5'],
    note: 'Glass, mountains, and harbor light compressed into one clean horizon.',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    country: 'United States',
    orbKey: 'gold',
    recencyLabel: '11 days ago',
    visitDate: 'Mar 07',
    collectionProgress: 0.71,
    collectedCount: 13,
    totalCount: 18,
    image:
      'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80',
    accent: '#D4AF84',
    aura: ['#F8E7D9', '#E7C8AA'],
    note: 'Lakefront light and tall clean geometry held against a colder sky.',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    orbKey: 'rose',
    recencyLabel: '2 weeks ago',
    visitDate: 'Mar 03',
    collectionProgress: 0.81,
    collectedCount: 16,
    totalCount: 20,
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    accent: '#D9A0A5',
    aura: ['#F9E3E5', '#ECC2C7'],
    note: 'Tall gold light, mirrored facades, and a skyline sharpened into luxury.',
  },
];

export const allCitiesOrbImage =
  'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80';

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
