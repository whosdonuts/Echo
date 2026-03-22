import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  EchoCity,
  EchoCollectionItem,
  EchoGalleryItem,
  allEchoCities,
  getEchoCity,
  getEchoCityMineEchoes,
  getEchoCityOtherEchoes,
  getEchoGalleryItemsForCity,
  recentEchoCities,
} from '../data/echoMock';
import { getEchoOrbAsset } from '../data/echoOrbAssets';
import { colors } from '../theme/colors';
import { shellMetrics } from '../theme/layout';

type EchoView = 'main' | 'allCities' | 'cityDetail' | 'gallery';
type EchoDetailTab = 'mine' | 'others';
type CityOrigin = 'main' | 'allCities';
type WheelItem = { type: 'city'; city: EchoCity } | { type: 'all' };
type ArchiveSortKey = 'distance' | 'recent' | 'progress';
type ArchiveSlotPosition = {
  slotId: number;
  row: number;
  column: number;
  baseX: number;
  baseY: number;
};

const displayFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const uiFont = Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'System' });
const orbSize = 96;
const wheelRotationPerPixel = 0.0095;
const archiveSortOptions: ArchiveSortKey[] = ['distance', 'recent', 'progress'];
const archiveRowLengths = [4, 5, 6, 7, 6, 5, 4] as const;
const archiveSlotCount = 37;
const archiveMinScale = 0.3;
const archiveMaxScale = 1.1;
const cityDistanceKm: Record<string, number> = {
  lisbon: 5760,
  kyoto: 10380,
  montreal: 540,
  copenhagen: 6190,
  seoul: 10570,
  porto: 5650,
  vienna: 6820,
  reykjavik: 4210,
  paris: 6000,
  marrakech: 6340,
  stockholm: 6320,
  singapore: 14890,
  tokyo: 10310,
  'new-york': 790,
  'mexico-city': 3250,
  istanbul: 8180,
};
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function withAlpha(hex: string, alpha: string) {
  if (!hex.startsWith('#') || hex.length !== 7) {
    return hex;
  }

  return `${hex}${alpha}`;
}

function joinMeta(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' / ');
}

function distanceKmForCity(city: EchoCity) {
  return cityDistanceKm[city.id] ?? 9999;
}

function searchArchiveCities(cities: EchoCity[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return cities;
  }

  return cities.filter((city) =>
    [city.name, city.country, city.note, city.visitDate, city.recencyLabel].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}

function sortArchiveCities(cities: EchoCity[], sortKey: ArchiveSortKey) {
  const indexed = cities.map((city, index) => ({ city, index }));

  if (sortKey === 'distance') {
    return indexed
      .sort((a, b) => distanceKmForCity(a.city) - distanceKmForCity(b.city) || a.index - b.index)
      .map(({ city }) => city);
  }

  if (sortKey === 'progress') {
    return indexed
      .sort(
        (a, b) =>
          b.city.collectionProgress - a.city.collectionProgress ||
          b.city.collectedCount - a.city.collectedCount ||
          a.index - b.index,
      )
      .map(({ city }) => city);
  }

  return indexed.sort((a, b) => a.index - b.index).map(({ city }) => city);
}

function createArchiveSlotPositions(itemSize: number) {
  const horizontalStep = itemSize * 1.07;
  const verticalStep = itemSize;
  let slotId = 0;

  return archiveRowLengths.flatMap((length, rowIndex) => {
    const centeredRow = rowIndex - Math.floor(archiveRowLengths.length / 2);
    const startX = -((length - 1) * horizontalStep) / 2;

    return Array.from({ length }, (_, column) => ({
      slotId: slotId++,
      row: rowIndex,
      column,
      baseX: startX + column * horizontalStep,
      baseY: centeredRow * verticalStep,
    }));
  });
}

function normalizeAngle(angle: number) {
  let normalized = angle % (Math.PI * 2);

  if (normalized <= -Math.PI) {
    normalized += Math.PI * 2;
  }

  if (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }

  return normalized;
}

function angularDistance(from: number, to: number) {
  return Math.abs(normalizeAngle(from - to));
}

function snapRotationToStep(rotation: number, stepAngle: number) {
  return Math.round(rotation / stepAngle) * stepAngle;
}

function nearestRotationForIndex(index: number, currentRotation: number, stepAngle: number) {
  const base = -index * stepAngle;
  const turn = Math.PI * 2;
  const turnIndex = Math.round((currentRotation - base) / turn);
  const candidates = [turnIndex - 1, turnIndex, turnIndex + 1].map((value) => base + value * turn);

  return candidates.reduce((closest, candidate) =>
    Math.abs(candidate - currentRotation) < Math.abs(closest - currentRotation) ? candidate : closest,
  );
}

function ProgressRail({ progress }: { progress: number }) {
  return (
    <View style={styles.progressTrack}>
      <LinearGradient
        colors={[colors.echoTrackFill, colors.echoTrackFillSoft]}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={[styles.progressFill, { width: `${Math.max(10, Math.min(100, progress * 100))}%` }]}
      />
    </View>
  );
}

function BackPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.backPill}>
      <Feather color={colors.echoInk} name="arrow-left" size={15} />
      <Text style={styles.backPillText}>{label}</Text>
    </Pressable>
  );
}

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

function WheelOrb({
  item,
  active,
  x,
  y,
  zIndex,
  scale,
  opacity,
  onPress,
}: {
  item: WheelItem;
  active: boolean;
  x: number;
  y: number;
  zIndex: number;
  scale: number;
  opacity: number;
  onPress: () => void;
}) {
  const orbSource = item.type === 'all' ? getEchoOrbAsset('rose') : getEchoOrbAsset(item.city.orbKey);
  const label = item.type === 'all' ? 'All' : item.city.name;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wheelOrbWrap,
        {
          left: x - orbSize / 2,
          top: y - orbSize / 2,
          opacity,
          transform: [{ scale }],
          zIndex,
        },
      ]}
    >
      <View style={styles.wheelShell}>
        <Image resizeMode="cover" source={orbSource} style={styles.wheelImage} />
        <Text
          numberOfLines={2}
          style={[
            styles.wheelOrbLabel,
            active && styles.wheelOrbLabelActive,
            item.type === 'all' && styles.wheelOrbLabelAll,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ArchiveCityOrb({
  city,
  focused,
  placeholder,
  animatedScale,
  focus,
  animatedOpacity,
  itemSize,
  x,
  y,
  zIndex,
  onPress,
}: {
  city: EchoCity | null;
  focused: boolean;
  placeholder: boolean;
  animatedScale: Animated.Value;
  focus: number;
  animatedOpacity: Animated.Value;
  itemSize: number;
  x: number;
  y: number;
  zIndex: number;
  onPress: () => void;
}) {
  const size = itemSize;
  const ringInset = Math.max(2, size * 0.04);
  const labelVisible = !placeholder && focus > 0.42;
  const metaVisible = !placeholder && focus > 0.72;
  const labelTop = size * 0.22;
  const progressBottom = size * 0.16;
  const progressHeight = city ? size * (0.18 + city.collectionProgress * 0.5) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.archiveCityOrbHit,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          zIndex,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.archiveCityOrbMotion,
          {
            opacity: animatedOpacity,
            transform: [{ scale: animatedScale }],
          },
        ]}
      >
        <View style={[styles.archiveCityOrbShell, { borderRadius: size / 2 }]}>
          {city ? (
            <>
              <Image
                resizeMode="cover"
                source={getEchoOrbAsset(city.orbKey)}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.34)', 'rgba(255,255,255,0)']}
                end={{ x: 0.72, y: 0.76 }}
                start={{ x: 0.08, y: 0.06 }}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                colors={[withAlpha(city.accent, '00'), withAlpha(city.accent, focused ? '74' : '40')]}
                end={{ x: 0.5, y: 1 }}
                start={{ x: 0.5, y: 0 }}
                style={[
                  styles.archiveCityProgressWash,
                  {
                    height: progressHeight,
                    borderBottomLeftRadius: size / 2,
                    borderBottomRightRadius: size / 2,
                  },
                ]}
              />
              <View
                style={[
                  styles.archiveCityProgressRing,
                  {
                    width: size - ringInset * 2,
                    height: size - ringInset * 2,
                    borderRadius: (size - ringInset * 2) / 2,
                    top: ringInset,
                    left: ringInset,
                    borderColor: withAlpha(city.accent, focused ? '90' : '4B'),
                    opacity: 0.28 + city.collectionProgress * 0.48,
                  },
                ]}
              />
            </>
          ) : (
            <>
              <LinearGradient
                colors={['#EFEFEF', '#D9D9D9']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0.18, y: 0.1 }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
              <View
                style={[
                  styles.archivePlaceholderRing,
                  {
                    width: size - ringInset * 2,
                    height: size - ringInset * 2,
                    borderRadius: (size - ringInset * 2) / 2,
                    top: ringInset,
                    left: ringInset,
                    opacity: focused ? 0.44 : 0.3,
                  },
                ]}
              />
            </>
          )}
          {labelVisible ? (
            <Text
              numberOfLines={2}
              style={[
                styles.archiveCityLabel,
                {
                  top: labelTop,
                  fontSize: focused ? 12.5 : 10.5,
                  left: 8,
                  right: 8,
                  opacity: 0.24 + focus * 0.72,
                },
              ]}
            >
              {city?.name}
            </Text>
          ) : null}
          {metaVisible ? (
            <Text
              style={[
                styles.archiveCityMeta,
                {
                  bottom: progressBottom,
                  fontSize: focused ? 11 : 9,
                  opacity: 0.28 + focus * 0.82,
                },
              ]}
            >
              {city ? `${Math.round(city.collectionProgress * 100)}%` : ''}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function ArchiveCityCard({ city, onPress }: { city: EchoCity; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.archiveCard}>
      <LinearGradient
        colors={['#FFFFFF', withAlpha(city.aura[0], '78'), withAlpha(city.aura[1], '3C')]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[withAlpha(city.aura[0], 'F5'), withAlpha(city.aura[1], 'DB')]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0.16, y: 0.08 }}
        style={styles.archiveOrb}
      >
        <View style={[styles.archiveRing, { borderColor: withAlpha(city.accent, '30') }]} />
        <Image source={{ uri: city.image }} style={styles.archiveImage} />
      </LinearGradient>

      <View style={styles.archiveCopy}>
        <View style={styles.rowBetween}>
          <Text style={styles.archiveTitle}>{city.name}</Text>
          <Text style={styles.metaTiny}>{city.recencyLabel}</Text>
        </View>
        <Text style={styles.metaSmall}>{joinMeta([city.country, city.visitDate])}</Text>
        <Text numberOfLines={2} style={styles.bodySmall}>
          {city.note}
        </Text>
        <ProgressRail progress={city.collectionProgress} />
      </View>

      <Feather color={colors.textMuted} name="chevron-right" size={18} />
    </Pressable>
  );
}

function EchoCard({
  item,
  mode,
  height,
  onPress,
}: {
  item: EchoCollectionItem;
  mode: EchoDetailTab;
  height: number;
  onPress: () => void;
}) {
  const locked = mode === 'mine' && !item.collected;

  return (
    <Pressable disabled={locked} onPress={onPress} style={[styles.echoCard, { minHeight: height }]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(24,20,18,0.14)', 'rgba(22,18,17,0.78)']}
        locations={[0, 0.4, 1]}
        end={{ x: 0.5, y: 1 }}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.rowBetween}>
        <View style={[styles.topTag, { backgroundColor: withAlpha(item.tint, mode === 'mine' ? '38' : '24') }]}>
          <Text style={styles.topTagText}>{mode === 'mine' ? 'Mine' : 'Popular'}</Text>
        </View>
        {mode === 'others' ? (
          <View style={styles.signalPill}>
            <Feather color="#FFFFFF" name="radio" size={12} />
            <Text style={styles.signalText}>{item.popularityCount}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>{joinMeta([item.area, item.dateLabel])}</Text>
        <Text numberOfLines={3} style={styles.cardBody}>
          {locked ? 'Uncollected Echo. The shape remains visible, but the details stay veiled.' : item.note}
        </Text>
        <Text style={styles.cardFooter}>
          {locked ? 'Locked' : mode === 'mine' ? 'Open gallery' : item.activityLabel ?? 'Open gallery'}
        </Text>
      </View>

      {locked ? (
        <View style={styles.lockVeil}>
          <View style={styles.lockGlass} />
          <Text style={styles.lockText}>Uncollected</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function GalleryThumb({
  item,
  active,
  onPress,
}: {
  item: EchoGalleryItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.thumb, active && styles.thumbActive]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(22,18,17,0.62)']}
        end={{ x: 0.5, y: 1 }}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Text numberOfLines={1} style={styles.thumbText}>
        {item.title}
      </Text>
    </Pressable>
  );
}

export function EchoScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const wheelRotationAnimated = useRef(new Animated.Value(0)).current;
  const wheelRotationRef = useRef(0);
  const panStartRotationRef = useRef(0);
  const archiveOffsetXAnimated = useRef(new Animated.Value(0)).current;
  const archiveOffsetYAnimated = useRef(new Animated.Value(0)).current;
  const archiveOffsetRef = useRef({ x: 0, y: 0 });
  const archivePendingOffsetRef = useRef({ x: 0, y: 0 });
  const archiveFrameRef = useRef<number | null>(null);
  const archivePanStartRef = useRef({ x: 0, y: 0 });
  const archiveScaleAnimatedRefs = useRef(
    Array.from({ length: archiveSlotCount }, () => new Animated.Value(archiveMaxScale)),
  ).current;
  const archiveOpacityAnimatedRefs = useRef(
    Array.from({ length: archiveSlotCount }, () => new Animated.Value(archiveMaxScale * archiveMaxScale)),
  ).current;
  const [view, setView] = useState<EchoView>('main');
  const [cityOrigin, setCityOrigin] = useState<CityOrigin>('main');
  const [selectedCityId, setSelectedCityId] = useState(recentEchoCities[0].id);
  const [detailTab, setDetailTab] = useState<EchoDetailTab>('mine');
  const [selectedEchoId, setSelectedEchoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [archiveSortKey, setArchiveSortKey] = useState<ArchiveSortKey>('recent');
  const [wheelRotation, setWheelRotation] = useState(0);
  const [archiveOffset, setArchiveOffset] = useState({ x: 0, y: 0 });

  const deferredQuery = useDeferredValue(searchQuery);
  const wheelItems = useMemo<WheelItem[]>(
    () => [
      ...recentEchoCities.slice(0, 6).map((city) => ({ type: 'city' as const, city })),
      { type: 'all' as const },
      ...recentEchoCities.slice(6).map((city) => ({ type: 'city' as const, city })),
    ],
    [],
  );
  const stepAngle = (Math.PI * 2) / wheelItems.length;
  const selectedCity = getEchoCity(selectedCityId) ?? recentEchoCities[0];
  const focusedCity = useMemo(() => {
    let closestCity = recentEchoCities[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    wheelItems.forEach((item, index) => {
      if (item.type !== 'city') {
        return;
      }

      const itemAngle = index * stepAngle + wheelRotation;
      const distanceToFocus = angularDistance(itemAngle, 0);

      if (distanceToFocus < closestDistance) {
        closestDistance = distanceToFocus;
        closestCity = item.city;
      }
    });

    return closestCity;
  }, [stepAngle, wheelItems, wheelRotation]);
  const mineEchoes = getEchoCityMineEchoes(selectedCity.id);
  const otherEchoes = getEchoCityOtherEchoes(selectedCity.id);
  const galleryItems = getEchoGalleryItemsForCity(selectedCity.id);
  const featuredGalleryItem =
    galleryItems.find((item) => item.echoId === selectedEchoId) ?? galleryItems[0] ?? null;
  const bottomTabClearance = Math.max(134, insets.bottom + 110);
  const wheelStageHeight = Math.max(520, height - bottomTabClearance);
  const wheelRadius = Math.min(width * 0.78, wheelStageHeight * 0.37);
  const wheelCenterX = -width * 0.18;
  const wheelCenterY = wheelStageHeight * 0.52;
  const contentBottomPadding = Math.max(shellMetrics.contentBottomPadding, insets.bottom + 116);
  const cardHeights = [244, 194, 232, 204, 224, 188];
  const archiveTopAreaTop = 12;
  const archiveTopChromeHeight = showFilters ? 148 : 108;
  const archiveStageTop = archiveTopAreaTop + archiveTopChromeHeight - 4;
  const archiveStageBottom = bottomTabClearance;
  const archiveViewportHeight = Math.max(320, height - archiveStageTop - archiveStageBottom);
  const archiveCenter = useMemo(
    () => ({
      x: width / 2,
      y: archiveViewportHeight / 2,
    }),
    [archiveViewportHeight, width],
  );
  const archiveItemSize = clamp(80 + width * 0.05, 96, 144);
  const archiveSlotPositions = useMemo(
    () => createArchiveSlotPositions(archiveItemSize),
    [archiveItemSize],
  );
  const archiveSlotPopulationOrder = useMemo(
    () =>
      [...archiveSlotPositions].sort((left, right) => {
        const distanceDelta =
          Math.hypot(left.baseX, left.baseY) - Math.hypot(right.baseX, right.baseY);

        if (Math.abs(distanceDelta) > 0.01) {
          return distanceDelta;
        }

        return Math.atan2(left.baseY, left.baseX) - Math.atan2(right.baseY, right.baseX);
      }),
    [archiveSlotPositions],
  );
  const archiveSearchResults = useMemo(
    () => searchArchiveCities(allEchoCities, deferredQuery),
    [deferredQuery],
  );
  const archiveCities = useMemo(
    () => sortArchiveCities(archiveSearchResults, archiveSortKey).slice(0, archiveSlotCount),
    [archiveSearchResults, archiveSortKey],
  );
  const archiveSlots = useMemo(() => {
    const cityBySlotId = new Map<number, EchoCity>();

    archiveCities.forEach((city, index) => {
      const targetSlot = archiveSlotPopulationOrder[index];

      if (targetSlot) {
        cityBySlotId.set(targetSlot.slotId, city);
      }
    });

    return archiveSlotPositions.map((slot) => ({
      ...slot,
      city: cityBySlotId.get(slot.slotId) ?? null,
    }));
  }, [archiveCities, archiveSlotPopulationOrder, archiveSlotPositions]);
  const archiveBounds = useMemo(() => {
    if (!archiveSlotPositions.length) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const orbExtent = (archiveItemSize * archiveMaxScale) / 2 + 8;
    const edgePaddingX = Math.max(18, archiveItemSize * 0.18);
    const edgePaddingY = Math.max(18, archiveItemSize * 0.18);
    const minBaseX = Math.min(...archiveSlotPositions.map((slot) => slot.baseX)) - orbExtent;
    const maxBaseX = Math.max(...archiveSlotPositions.map((slot) => slot.baseX)) + orbExtent;
    const minBaseY = Math.min(...archiveSlotPositions.map((slot) => slot.baseY)) - orbExtent;
    const maxBaseY = Math.max(...archiveSlotPositions.map((slot) => slot.baseY)) + orbExtent;

    let minX = width - edgePaddingX - archiveCenter.x - maxBaseX;
    let maxX = edgePaddingX - archiveCenter.x - minBaseX;
    let minY = archiveViewportHeight - edgePaddingY - archiveCenter.y - maxBaseY;
    let maxY = edgePaddingY - archiveCenter.y - minBaseY;

    if (minX > maxX) {
      const lockedX = (minX + maxX) / 2;
      minX = lockedX;
      maxX = lockedX;
    }

    if (minY > maxY) {
      const lockedY = (minY + maxY) / 2;
      minY = lockedY;
      maxY = lockedY;
    }

    return { minX, maxX, minY, maxY };
  }, [archiveCenter.x, archiveCenter.y, archiveItemSize, archiveSlotPositions, archiveViewportHeight, width]);

  function clampArchiveOffset(next: { x: number; y: number }) {
    return {
      x: clamp(next.x, archiveBounds.minX, archiveBounds.maxX),
      y: clamp(next.y, archiveBounds.minY, archiveBounds.maxY),
    };
  }

  useEffect(() => {
    const listenerId = wheelRotationAnimated.addListener(({ value }) => {
      wheelRotationRef.current = value;
      setWheelRotation(value);
    });

    return () => {
      wheelRotationAnimated.removeListener(listenerId);
    };
  }, [wheelRotationAnimated]);

  useEffect(() => {
    function flushArchiveOffset() {
      archiveFrameRef.current = null;
      archiveOffsetRef.current = clampArchiveOffset({ ...archivePendingOffsetRef.current });
      setArchiveOffset({ ...archiveOffsetRef.current });
    }

    function updateArchiveOffset(next: Partial<{ x: number; y: number }>) {
      archivePendingOffsetRef.current = clampArchiveOffset({ ...archivePendingOffsetRef.current, ...next });

      if (archiveFrameRef.current == null) {
        archiveFrameRef.current = requestAnimationFrame(flushArchiveOffset);
      }
    }

    const xListenerId = archiveOffsetXAnimated.addListener(({ value }) => {
      updateArchiveOffset({ x: value });
    });
    const yListenerId = archiveOffsetYAnimated.addListener(({ value }) => {
      updateArchiveOffset({ y: value });
    });

    return () => {
      if (archiveFrameRef.current != null) {
        cancelAnimationFrame(archiveFrameRef.current);
        archiveFrameRef.current = null;
      }
      archiveOffsetXAnimated.removeListener(xListenerId);
      archiveOffsetYAnimated.removeListener(yListenerId);
    };
  }, [archiveBounds.maxX, archiveBounds.maxY, archiveBounds.minX, archiveBounds.minY, archiveOffsetXAnimated, archiveOffsetYAnimated]);

  useEffect(() => {
    setSelectedCityId((current) => (current === focusedCity.id ? current : focusedCity.id));
  }, [focusedCity.id]);

  useEffect(() => {
    if (view !== 'allCities') {
      return;
    }

    const clampedTarget = clampArchiveOffset({ x: 0, y: 0 });
    archivePendingOffsetRef.current = clampedTarget;

    Animated.parallel([
      Animated.spring(archiveOffsetXAnimated, {
        toValue: clampedTarget.x,
        damping: 20,
        stiffness: 170,
        mass: 0.9,
        useNativeDriver: false,
      }),
      Animated.spring(archiveOffsetYAnimated, {
        toValue: clampedTarget.y,
        damping: 20,
        stiffness: 170,
        mass: 0.9,
        useNativeDriver: false,
      }),
    ]).start();
  }, [archiveBounds.maxX, archiveBounds.maxY, archiveBounds.minX, archiveBounds.minY, archiveCities, archiveOffsetXAnimated, archiveOffsetYAnimated, view]);

  function snapWheel(targetRotation: number) {
    Animated.spring(wheelRotationAnimated, {
      toValue: targetRotation,
      useNativeDriver: false,
      damping: 18,
      stiffness: 160,
      mass: 0.8,
    }).start();
  }

  function openCity(cityId: string, origin: CityOrigin) {
    setSelectedCityId(cityId);
    setCityOrigin(origin);
    setDetailTab('mine');
    setSelectedEchoId(null);
    setView('cityDetail');
  }

  function openGallery(itemId: string, cityId: string) {
    setSelectedCityId(cityId);
    setSelectedEchoId(itemId);
    setView('gallery');
  }

  function handleWheelItemPress(item: WheelItem, index: number, isActive: boolean) {
    if (item.type === 'all') {
      setView('allCities');
      return;
    }

    if (isActive) {
      openCity(item.city.id, 'main');
      return;
    }

    snapWheel(nearestRotationForIndex(index, wheelRotationRef.current, stepAngle));
  }

  function handleBack() {
    if (view === 'allCities') {
      setView('main');
      return;
    }

    if (view === 'cityDetail') {
      setView(cityOrigin === 'allCities' ? 'allCities' : 'main');
      return;
    }

    if (view === 'gallery') {
      setView('cityDetail');
      }
  }

  function snapArchiveToNode(node: { baseX: number; baseY: number }) {
    const clampedTarget = clampArchiveOffset({ x: -node.baseX, y: -node.baseY });

    Animated.parallel([
      Animated.spring(archiveOffsetXAnimated, {
        toValue: clampedTarget.x,
        damping: 22,
        stiffness: 166,
        mass: 0.94,
        useNativeDriver: false,
      }),
      Animated.spring(archiveOffsetYAnimated, {
        toValue: clampedTarget.y,
        damping: 22,
        stiffness: 166,
        mass: 0.94,
        useNativeDriver: false,
      }),
    ]).start();
  }

  function snapArchiveToNearest() {
    if (!archiveLayout.length) {
      return;
    }

    const nearest = archiveLayout.reduce((closest, node) =>
      node.distance < closest.distance ? node : closest,
    );

    snapArchiveToNode(nearest);
  }

  function handleArchiveOrbPress(node: { city: EchoCity | null; baseX: number; baseY: number; focused: boolean }) {
    if (node.focused && node.city) {
      openCity(node.city.id, 'allCities');
      return;
    }

    snapArchiveToNode(node);
  }

  const wheelPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 4 || Math.abs(gestureState.dx) > 6,
        onPanResponderGrant: () => {
          wheelRotationAnimated.stopAnimation((value) => {
            panStartRotationRef.current = value;
            wheelRotationRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const nextRotation = panStartRotationRef.current - gestureState.dy * wheelRotationPerPixel;
          wheelRotationAnimated.setValue(nextRotation);
        },
        onPanResponderRelease: (_, gestureState) => {
          const rawRotation = panStartRotationRef.current - gestureState.dy * wheelRotationPerPixel;
          const projectedRotation = rawRotation - gestureState.vy * 0.18;
          snapWheel(snapRotationToStep(projectedRotation, stepAngle));
        },
        onPanResponderTerminate: () => {
          snapWheel(snapRotationToStep(wheelRotationRef.current, stepAngle));
        },
      }),
    [stepAngle, wheelRotationAnimated],
  );

  const archivePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: () => {
          archiveOffsetXAnimated.stopAnimation((value) => {
            archivePanStartRef.current.x = value;
            archiveOffsetRef.current.x = value;
            archivePendingOffsetRef.current.x = value;
          });
          archiveOffsetYAnimated.stopAnimation((value) => {
            archivePanStartRef.current.y = value;
            archiveOffsetRef.current.y = value;
            archivePendingOffsetRef.current.y = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const boundedOffset = clampArchiveOffset({
            x: archivePanStartRef.current.x + gestureState.dx,
            y: archivePanStartRef.current.y + gestureState.dy,
          });
          archiveOffsetXAnimated.setValue(boundedOffset.x);
          archiveOffsetYAnimated.setValue(boundedOffset.y);
        },
        onPanResponderRelease: (_, gestureState) => {
          const projectedOffset = clampArchiveOffset({
            x: archiveOffsetRef.current.x + gestureState.vx * 180,
            y: archiveOffsetRef.current.y + gestureState.vy * 180,
          });

          Animated.parallel([
            Animated.spring(archiveOffsetXAnimated, {
              toValue: projectedOffset.x,
              velocity: gestureState.vx,
              damping: 28,
              stiffness: 128,
              mass: 1.04,
              useNativeDriver: false,
            }),
            Animated.spring(archiveOffsetYAnimated, {
              toValue: projectedOffset.y,
              velocity: gestureState.vy,
              damping: 28,
              stiffness: 128,
              mass: 1.04,
              useNativeDriver: false,
            }),
          ]).start(() => {
            snapArchiveToNearest();
          });
        },
        onPanResponderTerminate: () => {
          snapArchiveToNearest();
        },
      }),
    [
      archiveCenter.x,
      archiveCenter.y,
      archiveBounds.maxX,
      archiveBounds.maxY,
      archiveBounds.minX,
      archiveBounds.minY,
      archiveOffsetXAnimated,
      archiveOffsetYAnimated,
    ],
  );

  const wheelLayout = wheelItems.map((item, index) => {
    const angle = index * stepAngle + wheelRotation;
    const distanceToFocus = angularDistance(angle, 0);
    const emphasis = Math.max(0, 1 - distanceToFocus / 1.8);
    const scale = item.type === 'all' ? 0.82 + emphasis * 0.08 : 0.78 + emphasis * 0.22;
    const opacity = 0.22 + emphasis * 0.78;

    return {
      item,
      index,
      angle,
      active: item.type === 'city' && distanceToFocus < stepAngle * 0.38,
      x: wheelCenterX + Math.cos(angle) * wheelRadius,
      y: wheelCenterY + Math.sin(angle) * wheelRadius,
      zIndex: Math.round((Math.cos(angle) + 1) * 100),
      scale,
      opacity,
    };
  });

  const archiveDistanceScaleRange = archiveMaxScale - archiveMinScale;
  const archiveLayoutBase = archiveSlots.map((slot) => {
    const x = archiveCenter.x + archiveOffset.x + slot.baseX;
    const y = archiveCenter.y + archiveOffset.y + slot.baseY;
    const dx = x - archiveCenter.x;
    const dy = y - archiveCenter.y;

    return {
      ...slot,
      x,
      y,
      distance: Math.hypot(dx, dy),
    };
  });
  const archiveScaleOrder = [...archiveLayoutBase]
    .sort((left, right) => left.distance - right.distance)
    .map((slot, index, ordered) => ({
      slotId: slot.slotId,
      scale:
        archiveMaxScale -
        (ordered.length <= 1 ? 0 : (index / (ordered.length - 1)) * archiveDistanceScaleRange),
    }));
  const archiveScaleMap = new Map(archiveScaleOrder.map((slot) => [slot.slotId, slot.scale]));
  const archiveLayout = archiveLayoutBase.map((slot) => {
    const scale = archiveScaleMap.get(slot.slotId) ?? archiveMinScale;
    const focus = clamp((scale - archiveMinScale) / archiveDistanceScaleRange, 0, 1);

    return {
      ...slot,
      scale,
      focus,
      opacity: Math.max(0.18, Math.min(1, scale * scale)),
    };
  });
  useEffect(() => {
    if (view !== 'allCities') {
      return;
    }

    const animations = archiveLayout.flatMap((slot) => [
      Animated.timing(archiveScaleAnimatedRefs[slot.slotId], {
        toValue: slot.scale,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(archiveOpacityAnimatedRefs[slot.slotId], {
        toValue: slot.opacity,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const animation = Animated.parallel(animations);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [archiveLayout, archiveOpacityAnimatedRefs, archiveScaleAnimatedRefs, view]);
  const focusedArchiveSlotId =
    archiveLayout.reduce<{ slotId: number | null; distance: number }>(
      (closest, node) =>
        node.distance < closest.distance ? { slotId: node.slotId, distance: node.distance } : closest,
      { slotId: null, distance: Number.POSITIVE_INFINITY },
    ).slotId ?? null;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        {view === 'cityDetail' || view === 'gallery' ? (
          <View pointerEvents="none" style={styles.atmosphere}>
            <View
              style={[
                styles.blurBall,
                { top: -110, right: -70, width: 280, height: 280, backgroundColor: colors.echoGlowRose },
              ]}
            />
            <View
              style={[
                styles.blurBall,
                { top: 180, left: -84, width: 230, height: 230, backgroundColor: colors.echoGlowSky },
              ]}
            />
            <View
              style={[
                styles.blurBall,
                { bottom: 110, right: -54, width: 220, height: 220, backgroundColor: colors.echoGlowLilac },
              ]}
            />
          </View>
        ) : null}

        {view === 'main' ? (
          <View style={styles.main}>
            <View pointerEvents="none" style={[styles.mainOverlay, { top: insets.top + 18 }]}>
              <Text style={styles.mainBrand}>Echo</Text>
            </View>

            <View style={[styles.mainStage, { height: wheelStageHeight }]}>
              <View {...wheelPanResponder.panHandlers} style={styles.wheelGestureLayer}>
                {wheelLayout.map(({ item, index, active, x, y, zIndex, scale, opacity }) => (
                  <WheelOrb
                    active={active}
                    item={item}
                    key={item.type === 'all' ? 'all' : item.city.id}
                    onPress={() => handleWheelItemPress(item, index, active)}
                    opacity={opacity}
                    scale={scale}
                    x={x}
                    y={y}
                    zIndex={zIndex}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {view === 'allCities' ? (
          <View style={styles.archiveScreen}>
            <View style={[styles.archiveTopArea, { top: archiveTopAreaTop }]}>
              <View style={styles.archiveHeaderRow}>
                <BackPill label="Echo" onPress={handleBack} />
                <Text style={styles.archiveCounter}>{archiveCities.length} cities</Text>
              </View>

              <View style={styles.searchRow}>
                <View style={[styles.searchField, styles.archiveSearchField]}>
                  <Feather color={colors.textMuted} name="search" size={16} />
                  <TextInput
                    onChangeText={setSearchQuery}
                    placeholder="Search cities"
                    placeholderTextColor={colors.textMuted}
                    style={styles.searchInput}
                    value={searchQuery}
                  />
                </View>
                <Pressable
                  onPress={() => setShowFilters((current) => !current)}
                  style={[styles.searchAction, styles.archiveSearchAction]}
                >
                  <Feather color={colors.echoInk} name="sliders" size={16} />
                </Pressable>
              </View>

              {showFilters ? (
                <View style={styles.archiveFilterRow}>
                  {archiveSortOptions.map((option) => (
                    <FilterChip
                      active={archiveSortKey === option}
                      key={option}
                      label={option}
                      onPress={() => setArchiveSortKey(option)}
                    />
                  ))}
                </View>
              ) : null}
            </View>

            <View
              style={[
                styles.archiveStage,
                {
                  top: archiveStageTop,
                  bottom: archiveStageBottom,
                },
              ]}
            >
              <View {...archivePanResponder.panHandlers} style={styles.archiveGestureLayer}>
                <Animated.View
                  style={[
                    styles.archiveWrapper,
                    {
                      left: archiveCenter.x,
                      top: archiveCenter.y,
                      transform: [{ translateX: archiveOffsetXAnimated }, { translateY: archiveOffsetYAnimated }],
                    },
                  ]}
                >
                  {archiveLayout.map((node) => (
                    <ArchiveCityOrb
                      animatedOpacity={archiveOpacityAnimatedRefs[node.slotId]}
                      animatedScale={archiveScaleAnimatedRefs[node.slotId]}
                      city={node.city}
                      focus={node.focus}
                      focused={node.slotId === focusedArchiveSlotId}
                      itemSize={archiveItemSize}
                      key={node.slotId}
                      onPress={() =>
                        handleArchiveOrbPress({
                          city: node.city,
                          baseX: node.baseX,
                          baseY: node.baseY,
                          focused: node.slotId === focusedArchiveSlotId,
                        })
                      }
                      placeholder={!node.city}
                      x={node.baseX}
                      y={node.baseY}
                      zIndex={Math.round(node.scale * 1000)}
                    />
                  ))}
                </Animated.View>
              </View>
            </View>
          </View>
        ) : null}

        {view === 'cityDetail' ? (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rowBetween}>
              <BackPill label={cityOrigin === 'allCities' ? 'All' : 'Echo'} onPress={handleBack} />
              <Text style={styles.metaTiny}>{selectedCity.country}</Text>
            </View>

            <View style={styles.hero}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.screenTitle}>{selectedCity.name}</Text>
                <Text style={styles.metaSmall}>{joinMeta([selectedCity.country, selectedCity.visitDate])}</Text>
                <Text style={styles.bodySmall}>{selectedCity.note}</Text>
                <ProgressRail progress={selectedCity.collectionProgress} />
              </View>
              <LinearGradient
                colors={[withAlpha(selectedCity.aura[0], 'F8'), withAlpha(selectedCity.aura[1], 'DE')]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0.16, y: 0.08 }}
                style={styles.heroOrb}
              >
                <View
                  style={[
                    styles.archiveRing,
                    {
                      width: 94,
                      height: 94,
                      borderRadius: 47,
                      borderColor: withAlpha(selectedCity.accent, '34'),
                    },
                  ]}
                />
                <Image source={{ uri: selectedCity.image }} style={{ width: 82, height: 82, borderRadius: 41 }} />
              </LinearGradient>
            </View>

            <View style={styles.toggle}>
              <Pressable
                onPress={() => setDetailTab('mine')}
                style={[styles.toggleItem, detailTab === 'mine' && styles.toggleItemActive]}
              >
                <Text style={[styles.toggleText, detailTab === 'mine' && styles.toggleTextActive]}>Mine</Text>
              </Pressable>
              <Pressable
                onPress={() => setDetailTab('others')}
                style={[styles.toggleItem, detailTab === 'others' && styles.toggleItemActive]}
              >
                <Text style={[styles.toggleText, detailTab === 'others' && styles.toggleTextActive]}>Others</Text>
              </Pressable>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.sectionHeading}>
                {detailTab === 'mine' ? 'Your Echoes in this city' : 'Most active public Echoes'}
              </Text>
              <Text style={styles.body}>
                {detailTab === 'mine'
                  ? 'Collected pieces stay clear. Uncollected ones remain veiled and inaccessible.'
                  : 'Ordered by popularity and activity so the strongest public signals surface first.'}
              </Text>
            </View>

            <View style={styles.stack}>
              {(detailTab === 'mine' ? mineEchoes : otherEchoes).map((item, index) => (
                <EchoCard
                  height={cardHeights[index % cardHeights.length]}
                  item={item}
                  key={item.id}
                  mode={detailTab}
                  onPress={() => openGallery(item.id, selectedCity.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : null}

        {view === 'gallery' && featuredGalleryItem ? (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rowBetween}>
              <BackPill label={selectedCity.name} onPress={handleBack} />
              <Text style={styles.metaTiny}>Echo Gallery</Text>
            </View>

            <View style={styles.galleryHero}>
              <Image source={{ uri: featuredGalleryItem.image }} style={styles.cardImage} />
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'rgba(22,18,17,0.14)', 'rgba(22,18,17,0.78)']}
                locations={[0, 0.4, 1]}
                end={{ x: 0.5, y: 1 }}
                start={{ x: 0.5, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.galleryCopy}>
                <Text style={styles.metaOnDark}>{selectedCity.name.toUpperCase()}</Text>
                <Text style={styles.galleryTitle}>{featuredGalleryItem.title}</Text>
                <Text style={styles.galleryBody}>{featuredGalleryItem.caption}</Text>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={styles.metaTiny}>Browse the area</Text>
              <ScrollView
                horizontal
                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                showsHorizontalScrollIndicator={false}
              >
                {galleryItems.map((item) => (
                  <GalleryThumb
                    active={item.id === featuredGalleryItem.id}
                    item={item}
                    key={item.id}
                    onPress={() => setSelectedEchoId(item.echoId)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>{featuredGalleryItem.area}</Text>
              <Text style={styles.body}>
                {joinMeta([
                  selectedCity.country,
                  selectedCity.visitDate,
                  featuredGalleryItem.source === 'mine' ? 'Mine' : 'Others',
                ])}
              </Text>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.echoPaper },
  screen: { flex: 1, backgroundColor: colors.echoPaper },
  atmosphere: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  blurBall: { position: 'absolute', borderRadius: 999 },
  content: {
    paddingTop: shellMetrics.topPadding,
    paddingHorizontal: shellMetrics.horizontalPadding,
    gap: 20,
  },
  main: {
    flex: 1,
    position: 'relative',
  },
  mainOverlay: {
    position: 'absolute',
    left: shellMetrics.horizontalPadding,
    right: shellMetrics.horizontalPadding,
    zIndex: 300,
  },
  mainHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mainBrand: {
    color: colors.echoInk,
    fontSize: 18,
    fontFamily: uiFont,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  mainStage: {
    width: '100%',
    overflow: 'hidden',
  },
  wheelGestureLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  archiveScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  archiveTopArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: shellMetrics.horizontalPadding,
    gap: 10,
    zIndex: 140,
  },
  archiveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  archiveCounter: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  archiveSearchField: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(32, 28, 26, 0.09)',
    shadowColor: '#D6CFC8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  archiveSearchAction: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(32, 28, 26, 0.09)',
    shadowColor: '#D6CFC8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  archiveFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archiveStage: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  archiveGestureLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  archiveWrapper: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  archiveEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  archiveEmptyTitle: {
    color: colors.echoInk,
    fontSize: 22,
    fontFamily: displayFont,
    fontWeight: '700',
  },
  archiveEmptyBody: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: uiFont,
    fontWeight: '500',
    textAlign: 'center',
  },
  archiveCityOrbHit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveCityOrbMotion: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveCityOrbShell: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveCityProgressWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  archiveCityProgressRing: {
    position: 'absolute',
    top: 2,
    left: 2,
    borderWidth: 1.2,
  },
  archivePlaceholderRing: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: 'rgba(123,123,123,0.32)',
  },
  archiveCityLabel: {
    position: 'absolute',
    color: colors.echoInk,
    lineHeight: 13,
    fontFamily: uiFont,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.78)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  archiveCityMeta: {
    position: 'absolute',
    color: colors.echoInk,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  mainUtility: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  mainUtilityText: {
    color: colors.textSoft,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  centered: { alignItems: 'center', gap: 8 },
  brand: { color: colors.echoInk, fontSize: 15, fontFamily: uiFont, fontWeight: '700', letterSpacing: 0.3 },
  body: { color: colors.textSoft, fontSize: 14, lineHeight: 22, fontFamily: uiFont, fontWeight: '500' },
  bodySmall: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  metaTiny: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metaSmall: { color: colors.textMuted, fontSize: 12, fontFamily: uiFont, fontWeight: '700' },
  glassPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.echoGlass,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  glassPillText: {
    color: colors.echoInk,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stage: { position: 'relative', overflow: 'hidden' },
  wheelOrbWrap: {
    position: 'absolute',
    width: orbSize,
    height: orbSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelShell: {
    width: orbSize,
    height: orbSize,
    borderRadius: orbSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wheelImage: { width: orbSize, height: orbSize, borderRadius: 999 },
  wheelOrbLabel: {
    position: 'absolute',
    top: 28,
    left: 10,
    right: 10,
    color: 'rgba(32, 28, 26, 0.82)',
    fontSize: 11,
    lineHeight: 13,
    fontFamily: uiFont,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.82)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  wheelOrbLabelActive: {
    color: colors.echoInk,
    fontWeight: '700',
  },
  wheelOrbLabelAll: {
    top: 36,
  },
  wheelAllButton: {
    position: 'absolute',
    width: 88,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  wheelAllButtonText: {
    color: colors.textSoft,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '600',
  },
  focusTitle: { color: colors.echoInk, fontSize: 34, fontFamily: displayFont, fontWeight: '700', letterSpacing: -1 },
  mainFocusBlock: { alignItems: 'center', gap: 10, paddingBottom: 8 },
  mainProgressRail: { width: 72 },
  progressTrack: { width: '100%', height: 4, borderRadius: 999, backgroundColor: '#E8E1D9', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  allButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: colors.echoGlassHeavy,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  allButtonText: { color: colors.echoInk, fontSize: 15, fontFamily: uiFont, fontWeight: '700' },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: colors.echoGlass,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  backPillText: { color: colors.echoInk, fontSize: 13, fontFamily: uiFont, fontWeight: '700' },
  screenTitle: { color: colors.echoInk, fontSize: 34, fontFamily: displayFont, fontWeight: '700', letterSpacing: -1 },
  sectionHeading: { color: colors.echoInk, fontSize: 26, fontFamily: displayFont, fontWeight: '700', letterSpacing: -0.6 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: colors.echoGlass,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  searchInput: { flex: 1, padding: 0, color: colors.echoInk, fontSize: 14, fontFamily: uiFont, fontWeight: '500' },
  searchAction: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoGlass,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.echoGlass,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  chipActive: { backgroundColor: colors.echoInk, borderColor: colors.echoInk },
  chipText: { color: colors.echoInk, fontSize: 11, fontFamily: uiFont, fontWeight: '700', letterSpacing: 0.6 },
  chipTextActive: { color: '#FFFFFF' },
  helper: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontFamily: uiFont, fontWeight: '500' },
  stack: { gap: 14 },
  panel: {
    borderRadius: 28,
    padding: 20,
    gap: 8,
    backgroundColor: colors.echoGlassHeavy,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  panelTitle: { color: colors.echoInk, fontSize: 22, fontFamily: displayFont, fontWeight: '700' },
  archiveCard: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 30,
    padding: 14,
    backgroundColor: colors.echoGlassHeavy,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  archiveOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  archiveRing: { position: 'absolute', width: 66, height: 66, borderRadius: 33, borderWidth: 1 },
  archiveImage: { width: 60, height: 60, borderRadius: 30 },
  archiveCopy: { flex: 1, gap: 6 },
  archiveTitle: { color: colors.echoInk, fontSize: 19, fontFamily: displayFont, fontWeight: '700', letterSpacing: -0.4 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: 34,
    padding: 18,
    backgroundColor: colors.echoGlassHeavy,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  heroOrb: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  toggle: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 999,
    backgroundColor: colors.echoGlass,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  toggleItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999, paddingVertical: 11 },
  toggleItemActive: { backgroundColor: colors.echoInk },
  toggleText: { color: colors.echoInk, fontSize: 13, fontFamily: uiFont, fontWeight: '700' },
  toggleTextActive: { color: '#FFFFFF' },
  echoCard: { overflow: 'hidden', borderRadius: 34, padding: 18, justifyContent: 'space-between', backgroundColor: colors.echoPearl },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  topTag: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  topTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  signalText: { color: '#FFFFFF', fontSize: 11, fontFamily: uiFont, fontWeight: '700' },
  cardCopy: { gap: 6 },
  cardTitle: { color: '#FFFFFF', fontSize: 29, fontFamily: displayFont, fontWeight: '700', letterSpacing: -0.8 },
  cardMeta: { color: 'rgba(255,255,255,0.76)', fontSize: 12, fontFamily: uiFont, fontWeight: '700' },
  cardBody: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 20, fontFamily: uiFont, fontWeight: '500' },
  cardFooter: { color: colors.echoGlowGoldSolid, fontSize: 12, fontFamily: uiFont, fontWeight: '700' },
  lockVeil: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  lockGlass: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(248,244,239,0.56)' },
  lockText: {
    color: colors.echoInk,
    fontSize: 14,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  galleryHero: { overflow: 'hidden', height: 364, borderRadius: 38, backgroundColor: colors.echoPearl },
  galleryCopy: { position: 'absolute', left: 20, right: 20, bottom: 20, gap: 8 },
  metaOnDark: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 1,
  },
  galleryTitle: { color: '#FFFFFF', fontSize: 34, fontFamily: displayFont, fontWeight: '700', letterSpacing: -1 },
  galleryBody: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 20, fontFamily: uiFont, fontWeight: '500' },
  thumb: {
    width: 112,
    height: 150,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: colors.echoPearl,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: colors.echoInk },
  thumbText: { color: '#FFFFFF', fontSize: 12, fontFamily: uiFont, fontWeight: '700' },
});
