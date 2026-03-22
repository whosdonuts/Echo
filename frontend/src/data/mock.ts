export type Fragment = {
  id: string;
  place: string;
  time: string;
  caption: string;
  comments: number;
  sound: string;
  image: string;
};

export type AtlasFragment = {
  id: string;
  title: string;
  place: string;
  date: string;
  caption: string;
  sound: string;
  image: string;
  tint: string;
  shape: 'orb' | 'capsule';
  friend?: string;
};

export type TradeFragment = {
  id: string;
  title: string;
  place: string;
  date: string;
  offer: string;
  image: string;
  tint: string;
};

export type MapPin = {
  id: string;
  label: string;
  place: string;
  zone: string;
  time: string;
  caption: string;
  distance: string;
  sound: string;
  mood: string;
  clue: string;
  discovered: boolean;
  x: string;
  y: string;
  tone: 'accent' | 'sage' | 'gold';
};

export type ExplorePlace = {
  id: string;
  title: string;
  summary: string;
  image: string;
  mood: 'Near water' | 'Late night' | 'Quiet';
  fragmentCount: number;
  distance: string;
  sound: string;
  activity: string;
};

export type FragmentComment = {
  id: string;
  author: string;
  time: string;
  text: string;
};

export type FragmentDetail = {
  id: string;
  title: string;
  image: string;
  caption: string;
  sound: string;
  location: string;
  timestamp: string;
  author: string;
  tint: string;
  shape: 'orb' | 'capsule';
  comments: FragmentComment[];
};

export type ProfileStat = {
  label: string;
  value: string;
};

export type ProfileSetting = {
  id: string;
  label: string;
  description: string;
  icon: 'edit-3' | 'bell' | 'lock' | 'help-circle' | 'log-out';
  tone?: 'default' | 'danger';
};

export type CreateMemoryDraft = {
  zone: string;
  location: string;
  timestamp: string;
  liveTitle: string;
  liveHint: string;
  memento: string;
  photoNote: string;
  soundTag: string;
  soundHint: string;
  successNote: string;
};

export const mapPins: MapPin[] = [
  {
    id: 'harbor',
    label: 'Harbour Steps',
    place: 'Old Port Ferry Steps',
    zone: 'OLD PORT / ZONE 01',
    time: '12 min ago',
    caption: "Someone left gulls, ferry cables, and the line 'wait here a little longer.'",
    distance: '120 m away',
    sound: 'Harbor wind',
    mood: 'Salt-heavy and warm',
    clue: 'Ferry cables and gulls',
    discovered: true,
    x: '22%',
    y: '28%',
    tone: 'accent' as const,
  },
  {
    id: 'clocktower',
    label: 'Clock Tower Walk',
    place: 'Clock Tower Walk',
    zone: 'CLOCK TOWER / ZONE 02',
    time: 'Nearby now',
    caption: 'There is something here, but it has not been fully revealed yet.',
    distance: '250 m away',
    sound: 'Bells through traffic',
    mood: 'Still hidden',
    clue: 'Footsteps, bells, wet stone',
    discovered: false,
    x: '69%',
    y: '42%',
    tone: 'sage' as const,
  },
  {
    id: 'station',
    label: 'Platform 5 Rail',
    place: 'Union Station Platform 5',
    zone: 'UNION STATION / ZONE 03',
    time: '2 h ago',
    caption: 'Rain kept lifting off the tracks every time a train pulled out.',
    distance: '400 m away',
    sound: 'Train ambience',
    mood: 'Blue and reflective',
    clue: 'Coffee, brakes, platform wind',
    discovered: true,
    x: '50%',
    y: '70%',
    tone: 'gold' as const,
  },
];

export const fragments: Fragment[] = [
  {
    id: 'ferry-wall',
    place: 'Ferry Wall',
    time: '6 min ago',
    caption: 'Clouds went peach for four minutes and everybody at the railing went quiet at once.',
    comments: 4,
    sound: 'Harbor wind',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prince-cafe',
    place: 'Prince Street Cafe',
    time: '19 min ago',
    caption: 'Left my laugh in the window fog. Keep it for a minute if it lands on you.',
    comments: 2,
    sound: 'Short voice note',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'union-platform',
    place: 'Union Station Platform 5',
    time: '2 h ago',
    caption: 'The station smelled like rain and coffee, and even the delay felt gentle for once.',
    comments: 3,
    sound: 'Station ambience',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
  },
];

export const atlasFragments: AtlasFragment[] = [
  {
    id: 'atlas-ferry',
    title: 'Peach sky pocket',
    place: 'Ferry Wall',
    date: 'Mar 18',
    caption: 'Clouds went peach for four minutes and everyone by the water looked up together.',
    sound: 'Harbor wind',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    tint: '#E8B9AB',
    shape: 'orb',
    friend: 'Lina',
  },
  {
    id: 'atlas-prince',
    title: 'Cafe laugh',
    place: 'Prince Street Cafe',
    date: 'Mar 14',
    caption: 'Left my laugh here. If it reaches you through the espresso hiss, keep it a minute.',
    sound: 'Voice note',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    tint: '#D8C2A0',
    shape: 'capsule',
  },
  {
    id: 'atlas-union',
    title: 'Platform weather',
    place: 'Union Station Platform 5',
    date: 'Mar 11',
    caption: 'Rain and coffee got trapped under the tracks and followed everyone home.',
    sound: 'Station ambience',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    tint: '#9DB6C8',
    shape: 'orb',
  },
  {
    id: 'atlas-arcade',
    title: 'Arcade warmth',
    place: 'St. Lawrence Arcade',
    date: 'Mar 06',
    caption: 'Warm light, oranges, and someone humming softly near the back stall.',
    sound: 'Market chatter',
    image:
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80',
    tint: '#C6B58E',
    shape: 'capsule',
    friend: 'Mara',
  },
  {
    id: 'atlas-footbridge',
    title: 'Footbridge blue',
    place: 'Bathurst Footbridge',
    date: 'Feb 28',
    caption: 'Bikes below, wind above, and a singer whose name I never caught.',
    sound: 'Night wind',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    tint: '#8FA08D',
    shape: 'orb',
  },
  {
    id: 'atlas-quay',
    title: 'Blue hour trace',
    place: 'Queens Quay',
    date: 'Feb 19',
    caption: 'Everybody slowed down at the same railing without needing to say why.',
    sound: 'Ferry horn',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    tint: '#A4B7D8',
    shape: 'capsule',
    friend: 'Noah',
  },
];

export const tradeFragments: TradeFragment[] = [
  {
    id: 'trade-harbor',
    title: 'Harbor dusk',
    place: 'Old Port',
    date: 'Open this week',
    offer: 'Looking for rainy station fragments or late-night platform traces.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tint: '#E3BCB2',
  },
  {
    id: 'trade-tunnel',
    title: 'Tunnel echo',
    place: 'Union cut',
    date: '3 offers pending',
    offer: 'Open to cafe, bridge, or market moments with ambient sound.',
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    tint: '#B0BEC7',
  },
  {
    id: 'trade-market',
    title: 'Orange light',
    place: 'Arcade row',
    date: 'Open quietly',
    offer: 'Swap for a fragment that carries a voice note or market ambience.',
    image:
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
    tint: '#D9C093',
  },
];

export const explorePlaces: ExplorePlace[] = [
  {
    id: 'queens-quay',
    title: 'Queens Quay at blue hour',
    summary:
      'Wind, ferry horns, and people lingering after goodbye. Most fragments here tonight feel suspended.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    mood: 'Near water',
    fragmentCount: 9,
    distance: '7 min walk',
    sound: 'Ferry horn',
    activity: 'Most active tonight',
  },
  {
    id: 'st-lawrence',
    title: 'St. Lawrence Arcade',
    summary: '7 fragments nearby, mostly warm light, low chatter, and after-rain footsteps.',
    image:
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80',
    mood: 'Quiet',
    fragmentCount: 7,
    distance: '11 min walk',
    sound: 'Market chatter',
    activity: 'Busy after the rain',
  },
  {
    id: 'bathurst',
    title: 'Bathurst footbridge',
    summary: '4 fragments nearby, with wind, bikes below, and somebody singing off-key.',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    mood: 'Late night',
    fragmentCount: 4,
    distance: '18 min walk',
    sound: 'Night wind',
    activity: 'Quiet after 10 PM',
  },
  {
    id: 'simcoe-underpass',
    title: 'Lower Simcoe underpass',
    summary: '3 fragments nearby, mostly wet tires, sodium light, and people heading home in a hurry.',
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    mood: 'Late night',
    fragmentCount: 3,
    distance: '6 min walk',
    sound: 'Wet tires',
    activity: 'Most active after midnight',
  },
];

const defaultComments: FragmentComment[] = [
  {
    id: 'comment-1',
    author: 'Lina',
    time: '12 min ago',
    text: 'I passed here later and the air still felt exactly like this.',
  },
  {
    id: 'comment-2',
    author: 'Noah K.',
    time: '28 min ago',
    text: 'Read this while waiting for the streetcar and it changed the whole platform.',
  },
  {
    id: 'comment-3',
    author: 'Mara',
    time: '1 h ago',
    text: 'Small and good. Feels like finding a note tucked into a coat pocket.',
  },
];

const mapComments: FragmentComment[] = [
  {
    id: 'map-comment-1',
    author: 'Iris',
    time: '9 min ago',
    text: 'Walked by after dark and the gulls were louder than the traffic.',
  },
  {
    id: 'map-comment-2',
    author: 'Theo',
    time: '32 min ago',
    text: 'It felt softer here tonight. Thanks for leaving this behind.',
  },
  {
    id: 'map-comment-3',
    author: 'Jules',
    time: '51 min ago',
    text: 'The ferry horn hit right after I opened this. Weirdly perfect timing.',
  },
];

const exploreComments: FragmentComment[] = [
  {
    id: 'explore-comment-1',
    author: 'June',
    time: '18 min ago',
    text: 'This place always makes everybody quieter without asking them to be.',
  },
  {
    id: 'explore-comment-2',
    author: 'Ari',
    time: '44 min ago',
    text: 'I like that this feels more like a trace than a post.',
  },
  {
    id: 'explore-comment-3',
    author: 'Nell',
    time: '1 h ago',
    text: 'You can hear the shoes on wet pavement before you see anybody coming.',
  },
];

function tintFromTone(tone: MapPin['tone']) {
  if (tone === 'accent') {
    return '#E8B9AB';
  }

  if (tone === 'sage') {
    return '#A8B7A6';
  }

  return '#D8C08F';
}

export function detailFromAtlasFragment(fragment: AtlasFragment): FragmentDetail {
  return {
    id: fragment.id,
    title: fragment.title,
    image: fragment.image,
    caption: fragment.caption,
    sound: fragment.sound,
    location: fragment.place,
    timestamp: fragment.date,
    author: fragment.friend ?? 'Mara Leone',
    tint: fragment.tint,
    shape: fragment.shape,
    comments: defaultComments,
  };
}

export function detailFromFragment(fragment: Fragment): FragmentDetail {
  return {
    id: fragment.id,
    title: fragment.place,
    image: fragment.image,
    caption: fragment.caption,
    sound: fragment.sound,
    location: fragment.place,
    timestamp: fragment.time,
    author: 'Mara Leone',
    tint: '#D8C2A0',
    shape: 'capsule',
    comments: defaultComments,
  };
}

export function detailFromMapPin(pin: MapPin): FragmentDetail {
  return {
    id: pin.id,
    title: pin.label,
    image: pin.id === 'station' ? fragments[2].image : fragments[0].image,
    caption: pin.caption,
    sound: pin.sound,
    location: pin.place,
    timestamp: pin.time,
    author: 'Nearby echo',
    tint: tintFromTone(pin.tone),
    shape: 'orb',
    comments: mapComments,
  };
}

export function detailFromExplorePlace(place: ExplorePlace): FragmentDetail {
  return {
    id: place.id,
    title: place.title,
    image: place.image,
    caption: place.summary,
    sound: place.sound,
    location: place.title,
    timestamp: place.activity,
    author: 'Collected nearby',
    tint: '#A4B7D8',
    shape: 'capsule',
    comments: exploreComments,
  };
}

export const createMemoryDraft: CreateMemoryDraft = {
  zone: 'UNION STATION / ZONE 03',
  location: 'Union Station Platform 5',
  timestamp: 'Fri 9:41 PM',
  liveTitle: 'Rain and coffee caught in the tunnel air.',
  liveHint: 'Capture first. Add the memento in the next step.',
  memento: 'The station smelled like rain and coffee, and even the delay felt gentle for once.',
  photoNote: 'Warm tunnel light, damp air, and a held-breath platform.',
  soundTag: 'Platform ambience',
  soundHint: 'A soft layer of brakes, footsteps, and station reverb.',
  successNote: 'This zone is now revealed on your map for anyone moving through it.',
};

export const profile = {
  name: 'Mara Leone',
  username: '@maraleone',
  joined: 'Joined January 2024',
  bio: 'Mostly stations, weather, and half-finished goodbyes.',
  status: 'Leaving small weather reports for people who arrive after me.',
  accountNote: 'Prototype account / Toronto memories / notifications softened overnight',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  stats: [
    { label: 'Created', value: '42' },
    { label: 'Saved', value: '19' },
    { label: 'Zones', value: '18' },
  ] satisfies ProfileStat[],
  settings: [
    {
      id: 'edit-username',
      label: 'Edit username',
      description: 'Adjust the name nearby people see on your fragments.',
      icon: 'edit-3',
    },
    {
      id: 'notifications',
      label: 'Notification settings',
      description: 'Choose when Echo should tell you a place has answered back.',
      icon: 'bell',
    },
    {
      id: 'privacy',
      label: 'Privacy settings',
      description: 'Control visibility, comments, and how your traces are found.',
      icon: 'lock',
    },
    {
      id: 'help',
      label: 'Help and support',
      description: 'Get guidance, report an issue, or ask how fragments work.',
      icon: 'help-circle',
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      description: 'Leave Echo on this device for now.',
      icon: 'log-out',
      tone: 'danger',
    },
  ] satisfies ProfileSetting[],
};
