const cities = [
  {
    id: "toronto",
    name: "Toronto",
    province: "Ontario",
    country: "Canada",
    echoCount: 14,
  },
  {
    id: "montreal",
    name: "Montreal",
    province: "Quebec",
    country: "Canada",
    echoCount: 9,
  },
  {
    id: "vancouver",
    name: "Vancouver",
    province: "British Columbia",
    country: "Canada",
    echoCount: 11,
  },
];

const echoes = [
  {
    id: "echo-001",
    cityId: "toronto",
    title: "Underpass violin",
    snippet: "A violin line cutting through rush hour under the Gardiner.",
    author: "Mina",
    hearts: 128,
    tags: ["music", "street", "night"],
  },
  {
    id: "echo-002",
    cityId: "toronto",
    title: "Coffee shop confessional",
    snippet: "Someone rehearsing a breakup speech over an oat latte.",
    author: "Jules",
    hearts: 84,
    tags: ["cafe", "voice", "daytime"],
  },
  {
    id: "echo-003",
    cityId: "montreal",
    title: "Metro platform choir",
    snippet: "Three strangers harmonizing while waiting out a delay.",
    author: "Camille",
    hearts: 143,
    tags: ["metro", "music", "crowd"],
  },
  {
    id: "echo-004",
    cityId: "montreal",
    title: "Alley projector loop",
    snippet: "A film reel flickering on brick behind a late-night bar.",
    author: "Noah",
    hearts: 67,
    tags: ["art", "night", "film"],
  },
  {
    id: "echo-005",
    cityId: "vancouver",
    title: "Rainwalk cassette hiss",
    snippet: "Old tape static drifting out of a coat pocket in the drizzle.",
    author: "Avery",
    hearts: 116,
    tags: ["rain", "ambient", "walk"],
  },
  {
    id: "echo-006",
    cityId: "vancouver",
    title: "Seawall sunrise memo",
    snippet: "A voice note about leaving town before the fog burned off.",
    author: "Kai",
    hearts: 95,
    tags: ["water", "morning", "voice"],
  },
];

const galleryItems = [
  {
    id: "gallery-001",
    type: "image",
    cityId: "toronto",
    title: "Streetlight reflections",
    imageUrl: "https://example.com/gallery/streetlight-reflections.jpg",
  },
  {
    id: "gallery-002",
    type: "image",
    cityId: "montreal",
    title: "Late platform still",
    imageUrl: "https://example.com/gallery/late-platform-still.jpg",
  },
  {
    id: "gallery-003",
    type: "image",
    cityId: "vancouver",
    title: "Fog on the seawall",
    imageUrl: "https://example.com/gallery/fog-on-the-seawall.jpg",
  },
];

const popularEchoes = [...echoes]
  .sort((left, right) => right.hearts - left.hearts)
  .slice(0, 4);

module.exports = {
  cities,
  echoes,
  galleryItems,
  popularEchoes,
};

