import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MapboxGL, {
  Camera,
  CircleLayer,
  MapView,
  MarkerView,
  ShapeSource,
} from '@rnmapbox/maps';
import type { Camera as MapboxCameraRef } from '@rnmapbox/maps';
import { BARCELONA_CENTER, BARCELONA_HEROES } from '../barcelona';
import { getTagColor, isAcebFragment, isPremiumTag, isUnlockedTag } from '../geo';
import {
  barcelonaGeoJSON,
  londonGeoJSON,
  westernFragments,
} from '../runtimeData';
import { DEMO_WALK_PATH, easeInOutQuad, interpolateRoute, WALK_DURATION_MS, WALK_START } from '../walkPath';
import { CityMode, PopupInfo, WesternFragment } from '../types';
import { AcebFlow } from './AcebFlow';
import { MapHud } from './MapHud';

const BCN_ARRIVAL_ZOOM = 13.2;
const BCN_DETAIL_ZOOM = 13.8;
const INITIAL_WESTERN_ZOOM = 14.6;
const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

const londonGlowStyle = {
  circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 4, 12, 6, 14, 9],
  circleColor: [
    'match',
    ['get', 'tag'],
    'Featured',
    'rgba(217,119,6,0.14)',
    'Rare',
    'rgba(124,58,237,0.12)',
    'Social',
    'rgba(37,99,235,0.12)',
    'Archive',
    'rgba(147,51,234,0.12)',
    'Unlocked',
    'rgba(212,160,23,0.18)',
    'Legendary',
    'rgba(245,158,11,0.16)',
    'rgba(120,113,108,0.10)',
  ],
  circleBlur: 0.7,
} as any;

const londonCoreStyle = {
  circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 2, 12, 3, 14, 4.5],
  circleColor: [
    'match',
    ['get', 'tag'],
    'Featured',
    '#d97706',
    'Rare',
    '#7c3aed',
    'Social',
    '#2563eb',
    'Archive',
    '#9333ea',
    'Unlocked',
    '#d4a017',
    'Legendary',
    '#f59e0b',
    '#78716c',
  ],
  circleStrokeWidth: 1,
  circleStrokeColor: 'rgba(255,255,255,0.55)',
  circleOpacity: 0.55,
} as any;

const barcelonaGlowStyle = {
  circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 6, 15, 9, 17, 12],
  circleColor: [
    'match',
    ['get', 'tag'],
    'Featured',
    'rgba(217,119,6,0.18)',
    'Rare',
    'rgba(124,58,237,0.14)',
    'Social',
    'rgba(37,99,235,0.14)',
    'Archive',
    'rgba(147,51,234,0.14)',
    'Unlocked',
    'rgba(212,160,23,0.22)',
    'Legendary',
    'rgba(245,158,11,0.20)',
    'rgba(120,113,108,0.12)',
  ],
  circleBlur: 0.6,
} as any;

const barcelonaCoreStyle = {
  circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 2, 13, 3.5, 15, 5, 17, 7],
  circleColor: [
    'match',
    ['get', 'tag'],
    'Featured',
    '#d97706',
    'Rare',
    '#7c3aed',
    'Social',
    '#2563eb',
    'Archive',
    '#9333ea',
    'Unlocked',
    '#d4a017',
    'Legendary',
    '#f59e0b',
    '#78716c',
  ],
  circleStrokeWidth: 1,
  circleStrokeColor: 'rgba(255,255,255,0.6)',
  circleOpacity: 0.7,
} as any;

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<MapboxCameraRef>(null);
  const rafRef = useRef<number>(0);
  const walkStartRef = useRef<number>(0);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [selectedMarkerKey, setSelectedMarkerKey] = useState<string | null>(null);
  const [rippleKey, setRippleKey] = useState<string | null>(null);
  const [playerPos, setPlayerPos] = useState<{ lng: number; lat: number }>({
    lng: WALK_START[0],
    lat: WALK_START[1],
  });
  const [walking, setWalking] = useState(false);
  const [walkDone, setWalkDone] = useState(false);
  const [cityMode, setCityMode] = useState<CityMode>('western');
  const [traveling, setTraveling] = useState(false);
  const [travelLabel, setTravelLabel] = useState('');
  const [bcnRevealed, setBcnRevealed] = useState(false);
  const [bcnHeroesVisible, setBcnHeroesVisible] = useState(false);
  const [acebOpen, setAcebOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const tokenLoaded = TOKEN.length > 0 && TOKEN !== 'your_mapbox_token_here';
  const isWestern = cityMode === 'western';
  const isBarcelona = cityMode === 'barcelona';

  const westernRegular = useMemo(
    () => westernFragments.filter((fragment) => !isPremiumTag(fragment.tag)),
    [],
  );
  const westernPremium = useMemo(
    () => westernFragments.filter((fragment) => isPremiumTag(fragment.tag)),
    [],
  );

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const handle = setTimeout(callback, delay);
    timeoutRefs.current.push(handle);
  }, []);

  const clearScheduledEffects = useCallback(() => {
    timeoutRefs.current.forEach((handle) => clearTimeout(handle));
    timeoutRefs.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (tokenLoaded) {
      void MapboxGL.setAccessToken(TOKEN);
    }
  }, [tokenLoaded]);

  useEffect(() => clearScheduledEffects, [clearScheduledEffects]);

  const fragmentKey = useCallback((fragment: WesternFragment, prefix = '') => {
    return `${prefix}${fragment.lng},${fragment.lat}`;
  }, []);

  const focusPopup = useCallback(
    (fragment: WesternFragment, key: string) => {
      setPopupInfo({
        lng: fragment.lng,
        lat: fragment.lat,
        title: fragment.title,
        subtitle: fragment.subtitle,
        tag: fragment.tag,
      });
      setSelectedMarkerKey(key);
      setRippleKey(null);
    },
    [],
  );

  const handleFragmentPress = useCallback(
    (fragment: WesternFragment, keyPrefix = '') => {
      if (traveling) {
        return;
      }

      const key = fragmentKey(fragment, keyPrefix);
      const acebFragment = isAcebFragment(fragment);
      setPopupInfo(null);
      setSelectedMarkerKey(acebFragment ? null : key);
      setRippleKey(key);

      if (acebFragment) {
        scheduleTimeout(() => {
          setRippleKey(null);
          setSelectedMarkerKey(null);
          setAcebOpen(true);
        }, 380);
        return;
      }

      scheduleTimeout(() => focusPopup(fragment, key), 380);
    },
    [focusPopup, fragmentKey, scheduleTimeout, traveling],
  );

  const handleShapeSourcePress = useCallback((event: { features: Array<GeoJSON.Feature> }) => {
    if (traveling) {
      return;
    }

    const feature = event.features[0];
    if (!feature?.properties) {
      return;
    }

    const coords = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
    if (!coords || coords.length < 2) {
      return;
    }

    setSelectedMarkerKey(null);
    setRippleKey(null);
    setPopupInfo({
      lng: coords[0],
      lat: coords[1],
      title: String(feature.properties.title ?? ''),
      subtitle: String(feature.properties.subtitle ?? ''),
      tag: String(feature.properties.tag ?? ''),
    });
  }, [traveling]);

  const animateCamera = useCallback((config: Parameters<MapboxCameraRef['setCamera']>[0]) => {
    cameraRef.current?.setCamera(config);
  }, []);

  const startWalk = useCallback(() => {
    if (walking || walkDone || traveling) {
      return;
    }

    setPopupInfo(null);
    setSelectedMarkerKey(null);
    setWalking(true);
    walkStartRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - walkStartRef.current;
      const rawProgress = Math.min(elapsed / WALK_DURATION_MS, 1);
      const eased = easeInOutQuad(rawProgress);
      const [nextLng, nextLat] = interpolateRoute(DEMO_WALK_PATH, eased);

      setPlayerPos({ lng: nextLng, lat: nextLat });
      animateCamera({
        centerCoordinate: [nextLng, nextLat],
        animationDuration: 60,
        animationMode: 'easeTo',
      });

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setWalking(false);
        setWalkDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [animateCamera, traveling, walkDone, walking]);

  const travelToBarcelona = useCallback(() => {
    if (traveling || isBarcelona) {
      return;
    }

    clearScheduledEffects();
    setTraveling(true);
    setPopupInfo(null);
    setSelectedMarkerKey(null);
    setTravelLabel('Leaving London, Ontario...');
    setWalking(false);

    animateCamera({
      zoomLevel: 4.5,
      pitch: 45,
      heading: 30,
      animationDuration: 2400,
      animationMode: 'easeTo',
    });

    scheduleTimeout(() => {
      setTravelLabel('Traveling to Barcelona...');
      setCityMode('barcelona');
      setBcnRevealed(false);
      setBcnHeroesVisible(false);
      animateCamera({
        centerCoordinate: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
        zoomLevel: 5,
        pitch: 40,
        heading: -15,
        animationDuration: 3200,
        animationMode: 'flyTo',
      });

      scheduleTimeout(() => {
        setTravelLabel('Arriving in Barcelona...');
        animateCamera({
          centerCoordinate: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
          zoomLevel: BCN_ARRIVAL_ZOOM,
          pitch: 25,
          heading: 0,
          animationDuration: 2800,
          animationMode: 'flyTo',
        });

        scheduleTimeout(() => setBcnRevealed(true), 1200);
        scheduleTimeout(() => setBcnHeroesVisible(true), 2000);
        scheduleTimeout(() => {
          animateCamera({
            centerCoordinate: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
            zoomLevel: BCN_DETAIL_ZOOM,
            pitch: 0,
            heading: 0,
            animationDuration: 1200,
            animationMode: 'easeTo',
          });
          scheduleTimeout(() => {
            setTraveling(false);
            setTravelLabel('');
          }, 1300);
        }, 2800);
      }, 3200);
    }, 2500);
  }, [animateCamera, clearScheduledEffects, isBarcelona, scheduleTimeout, traveling]);

  const travelToWestern = useCallback(() => {
    if (traveling || isWestern) {
      return;
    }

    clearScheduledEffects();
    setTraveling(true);
    setPopupInfo(null);
    setSelectedMarkerKey(null);
    setTravelLabel('Leaving Barcelona...');
    setBcnHeroesVisible(false);

    animateCamera({
      zoomLevel: 4.5,
      pitch: 45,
      heading: -30,
      animationDuration: 2400,
      animationMode: 'easeTo',
    });

    scheduleTimeout(() => {
      setTravelLabel('Returning to Western...');
      setCityMode('western');
      setBcnRevealed(false);
      animateCamera({
        centerCoordinate: [WALK_START[0], WALK_START[1]],
        zoomLevel: 5,
        pitch: 40,
        heading: 15,
        animationDuration: 3200,
        animationMode: 'flyTo',
      });

      scheduleTimeout(() => {
        setTravelLabel('Arriving at Western...');
        animateCamera({
          centerCoordinate: [WALK_START[0], WALK_START[1]],
          zoomLevel: INITIAL_WESTERN_ZOOM,
          pitch: 0,
          heading: 0,
          animationDuration: 2800,
          animationMode: 'flyTo',
        });

        scheduleTimeout(() => {
          setTraveling(false);
          setTravelLabel('');
        }, 3000);
      }, 3200);
    }, 2500);
  }, [animateCamera, clearScheduledEffects, isWestern, scheduleTimeout, traveling]);

  const previewBottom = Math.max(insets.bottom + 108, 138);
  const devButtonBottom = Math.max(insets.bottom + 118, 148);

  if (!tokenLoaded) {
    return <TokenMissingState />;
  }

  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          attributionEnabled={false}
          compassEnabled={!traveling}
          logoEnabled={false}
          onDidFinishLoadingMap={() => setMapLoaded(true)}
          onMapLoadingError={() => setMapLoaded(false)}
          pitchEnabled
          rotateEnabled
          scaleBarEnabled={false}
          style={StyleSheet.absoluteFill}
          styleURL={MapboxGL.StyleURL.Light}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [WALK_START[0], WALK_START[1]],
              zoomLevel: INITIAL_WESTERN_ZOOM,
              pitch: 0,
              heading: 0,
            }}
            maxZoomLevel={18}
            minZoomLevel={2}
          />

          {isWestern ? (
            <ShapeSource hitbox={{ width: 32, height: 32 }} id="london-source" onPress={handleShapeSourcePress} shape={londonGeoJSON as any}>
              <CircleLayer id="london-glow" maxZoomLevel={14} style={londonGlowStyle} />
              <CircleLayer id="london-core" maxZoomLevel={14} style={londonCoreStyle} />
            </ShapeSource>
          ) : null}

          {isBarcelona && bcnRevealed ? (
            <ShapeSource hitbox={{ width: 32, height: 32 }} id="barcelona-source" onPress={handleShapeSourcePress} shape={barcelonaGeoJSON as any}>
              <CircleLayer id="barcelona-glow" style={barcelonaGlowStyle} />
              <CircleLayer id="barcelona-core" style={barcelonaCoreStyle} />
            </ShapeSource>
          ) : null}

          {isWestern && !traveling
            ? westernRegular.map((fragment) => {
                const key = fragmentKey(fragment);
                return (
                  <MarkerView
                    allowOverlap
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={[fragment.lng, fragment.lat]}
                    key={key}
                  >
                    <OrbMarker
                      active={selectedMarkerKey === key}
                      fragment={fragment}
                      onPress={() => handleFragmentPress(fragment)}
                      premium={false}
                      rippleVisible={rippleKey === key}
                    />
                  </MarkerView>
                );
              })
            : null}

          {isWestern && !traveling
            ? westernPremium.map((fragment) => {
                const key = fragmentKey(fragment, 'p-');
                return (
                  <MarkerView
                    allowOverlap
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={[fragment.lng, fragment.lat]}
                    key={key}
                  >
                    <OrbMarker
                      active={selectedMarkerKey === key}
                      fragment={fragment}
                      onPress={() => handleFragmentPress(fragment, 'p-')}
                      premium
                      rippleVisible={rippleKey === key}
                    />
                  </MarkerView>
                );
              })
            : null}

          {isBarcelona && bcnHeroesVisible && !traveling
            ? BARCELONA_HEROES.map((fragment) => {
                const premium = isPremiumTag(fragment.tag);
                const key = fragmentKey(fragment, 'bcn-');
                return (
                  <MarkerView
                    allowOverlap
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={[fragment.lng, fragment.lat]}
                    key={key}
                  >
                    <OrbMarker
                      active={selectedMarkerKey === key}
                      fragment={fragment}
                      onPress={() => handleFragmentPress(fragment, 'bcn-')}
                      premium={premium}
                      rippleVisible={rippleKey === key}
                    />
                  </MarkerView>
                );
              })
            : null}

          {isWestern && !traveling ? (
            <MarkerView allowOverlap anchor={{ x: 0.5, y: 0.5 }} coordinate={[playerPos.lng, playerPos.lat]}>
              <PlayerMarker />
            </MarkerView>
          ) : null}
        </MapView>

        {!mapLoaded ? (
          <View pointerEvents="none" style={styles.mapLoading}>
            <ActivityIndicator color="rgba(20,10,50,0.6)" />
          </View>
        ) : null}

        <MapHud tokenLoaded topOffset={insets.top + 12} />

        {__DEV__ ? (
          <View style={[styles.devActionWrap, { top: insets.top + 18 }]}>
            <Pressable
              disabled={traveling}
              onPress={isWestern ? travelToBarcelona : travelToWestern}
              style={[styles.devActionButton, traveling && styles.devActionButtonDisabled]}
            >
              <Text style={styles.devActionText}>{isWestern ? 'Dev: Barcelona' : 'Dev: Western'}</Text>
            </Pressable>
          </View>
        ) : null}

        {__DEV__ && isWestern ? (
          <View style={[styles.walkButtonWrap, { bottom: devButtonBottom }]}>
            <Pressable
              disabled={walking || walkDone || traveling}
              onPress={startWalk}
              style={[
                styles.walkButton,
                walking && styles.walkButtonActive,
                walkDone && styles.walkButtonDone,
              ]}
            >
              <Text style={[styles.walkButtonText, walkDone && styles.walkButtonTextDone]}>
                {walkDone ? 'Arrived - tap the fragment' : walking ? 'Walking...' : 'Simulate Walk'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {popupInfo && !traveling ? (
          <PopupCard
            info={popupInfo}
            onClose={() => {
              setPopupInfo(null);
              setSelectedMarkerKey(null);
            }}
            style={{ bottom: previewBottom }}
          />
        ) : null}

        {traveling ? <TravelOverlay label={travelLabel} /> : null}
        <AcebFlow onClose={() => setAcebOpen(false)} visible={acebOpen} />
      </View>
    </SafeAreaView>
  );
}

function OrbMarker({
  active,
  fragment,
  onPress,
  premium,
  rippleVisible,
}: {
  active: boolean;
  fragment: WesternFragment;
  onPress: () => void;
  premium: boolean;
  rippleVisible: boolean;
}) {
  const color = getTagColor(fragment.tag);
  const unlocked = isUnlockedTag(fragment.tag);

  return (
    <Pressable onPress={onPress} style={styles.orbTapTarget}>
      <View
        style={[
          styles.orbGlow,
          premium && styles.orbGlowPremium,
          unlocked && styles.orbGlowUnlocked,
          { backgroundColor: color.glow, opacity: active ? 1 : 0.78 },
        ]}
      />
      <View
        style={[
          styles.orbCore,
          premium && styles.orbCorePremium,
          unlocked && styles.orbCoreUnlocked,
          { backgroundColor: color.core, transform: [{ scale: active ? 1.2 : 1 }] },
        ]}
      />
      {unlocked ? (
        <View style={styles.unlockCheck}>
          <Feather color="#FFFFFF" name="check" size={8} />
        </View>
      ) : null}
      {rippleVisible ? <View style={[styles.ripple, { borderColor: color.core }]} /> : null}
    </Pressable>
  );
}

function PlayerMarker() {
  return (
    <View style={styles.playerHalo}>
      <View style={styles.playerOuter} />
      <View style={styles.playerRing} />
      <View style={styles.playerCore} />
    </View>
  );
}

function PopupCard({
  info,
  onClose,
  style,
}: {
  info: PopupInfo;
  onClose: () => void;
  style: { bottom: number };
}) {
  const color = getTagColor(info.tag);
  const badgeText = isUnlockedTag(info.tag) ? 'Unlocked' : info.tag;

  return (
    <View pointerEvents="box-none" style={[styles.popupWrap, style]}>
      <View style={styles.popupCard}>
        <View style={styles.popupHeader}>
          <View style={styles.popupCopy}>
            <Text style={[styles.popupTitle, isUnlockedTag(info.tag) && styles.popupTitleUnlocked]}>
              {info.title}
            </Text>
            <Text style={styles.popupSubtitle}>{info.subtitle}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.popupClose}>
            <Feather color="rgba(20,10,50,0.35)" name="x" size={16} />
          </Pressable>
        </View>
        <View style={[styles.popupBadge, { backgroundColor: color.badge, borderColor: `${color.core}30` }]}>
          <Text style={[styles.popupBadgeText, { color: color.core }]}>{badgeText}</Text>
        </View>
      </View>
    </View>
  );
}

function TravelOverlay({ label }: { label: string }) {
  return (
    <View pointerEvents="none" style={styles.travelOverlay}>
      <View style={styles.travelContent}>
        <ActivityIndicator color="rgba(255,255,255,0.8)" />
        <Text style={styles.travelLabel}>{label}</Text>
      </View>
    </View>
  );
}

function TokenMissingState() {
  return (
    <SafeAreaView style={styles.missingSafeArea}>
      <View style={styles.missingWrap}>
        <View style={styles.missingIcon}>
          <Text style={styles.missingIconText}>!</Text>
        </View>
        <Text style={styles.missingTitle}>Mapbox token missing</Text>
        <Text style={styles.missingBody}>
          Set `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` and reopen the app in a native development build.
        </Text>
        <View style={styles.missingMeta}>
          <Text style={styles.missingMetaText}>ACEB flow, travel, and fragment selection are wired, but the native map cannot render without the runtime token.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0ede8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0ede8',
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,237,232,0.24)',
  },
  devActionWrap: {
    position: 'absolute',
    right: 16,
    zIndex: 45,
  },
  devActionButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(20,10,50,0.18)',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  devActionButtonDisabled: {
    opacity: 0.7,
  },
  devActionText: {
    color: 'rgba(20,10,50,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  walkButtonWrap: {
    position: 'absolute',
    right: 16,
    zIndex: 45,
  },
  walkButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.1)',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  walkButtonActive: {
    borderColor: 'rgba(231,76,94,0.2)',
  },
  walkButtonDone: {
    borderColor: 'rgba(5,150,105,0.18)',
  },
  walkButtonText: {
    color: 'rgba(20,10,50,0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
  walkButtonTextDone: {
    color: '#059669',
    fontSize: 11,
  },
  orbTapTarget: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  orbGlowPremium: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  orbGlowUnlocked: {
    shadowColor: '#d4a017',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  orbCore: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.88)',
  },
  orbCorePremium: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  orbCoreUnlocked: {
    borderColor: 'rgba(255,230,150,0.92)',
  },
  unlockCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(212,160,23,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    opacity: 0.7,
  },
  playerHalo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerOuter: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  playerRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(148,163,184,0.1)',
  },
  playerCore: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    borderColor: 'rgba(100,116,139,0.35)',
    backgroundColor: '#f8fafc',
  },
  popupWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 44,
  },
  popupCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,253,250,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.08)',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  popupCopy: {
    flex: 1,
    gap: 4,
  },
  popupTitle: {
    color: 'rgba(20,10,50,0.9)',
    fontSize: 15,
    fontWeight: '700',
  },
  popupTitleUnlocked: {
    color: '#b8860b',
  },
  popupSubtitle: {
    color: 'rgba(20,10,50,0.42)',
    fontSize: 11,
    fontWeight: '500',
  },
  popupClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,10,50,0.04)',
  },
  popupBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  popupBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  travelOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,6,20,0.25)',
    zIndex: 46,
  },
  travelContent: {
    alignItems: 'center',
    gap: 14,
  },
  travelLabel: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  missingSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  missingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingIconText: {
    color: '#d97706',
    fontSize: 18,
    fontWeight: '700',
  },
  missingTitle: {
    color: 'rgba(30,20,60,0.7)',
    fontSize: 16,
    fontWeight: '700',
  },
  missingBody: {
    color: 'rgba(30,20,60,0.4)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  missingMeta: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  missingMetaText: {
    color: 'rgba(30,20,60,0.48)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
