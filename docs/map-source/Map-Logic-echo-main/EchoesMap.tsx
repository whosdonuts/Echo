'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  Layer,
  Marker,
  Popup,
  Source,
  type MapMouseEvent,
  type MapRef,
  type LayerProps,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import westernRaw from '@/data/western_echo_fragments_revised_fresh.json';
import londonRaw from '@/data/london_echo_fragments_extended.json';
import {
  type WesternFragment,
  getTagColor,
  isPremiumTag,
  isUnlockedTag,
  isAcebFragment,
  fragmentsToGeoJSON,
} from '@/lib/geo';
import {
  BARCELONA_CENTER,
  BARCELONA_HEROES,
  barcelonaToGeoJSON,
} from '@/lib/barcelona';
import { LONDON_AMBIENT } from '@/lib/london-ambient';

// ── Demo walk: hardcoded path (partial route; extend via more waypoints later — no ACEB tail) ───

const DEMO_WALK_PATH_RAW: { lat: number; lng: number }[] = [
  { lat: 43.000142254099956, lng: -81.27676819671778 },
  { lat: 43.00020508029888, lng: -81.27670681822416 },
  { lat: 43.00023646648194, lng: -81.27664512741713 },
  { lat: 43.00033454820061, lng: -81.2766585384621 },
  { lat: 43.0004188983533, lng: -81.27666926729816 },
  { lat: 43.00051109489979, lng: -81.27656197893762 },
  { lat: 43.000624869170366, lng: -81.27654588568332 },
  { lat: 43.00066799209495, lng: -81.27650798831422 },
  { lat: 43.0007405720724, lng: -81.27651067052311 },
  { lat: 43.00090927114718, lng: -81.27652408156807 },
  { lat: 43.00112504835914, lng: -81.2765401748224 },
  { lat: 43.00142909678027, lng: -81.2765911367938 },
  { lat: 43.001684103973986, lng: -81.27660454783876 },
  { lat: 43.00187045471512, lng: -81.27671988282651 },
  { lat: 43.00212926804295, lng: -81.2766948961235 },
  { lat: 43.00223788947062, lng: -81.27636633785717 },
  { lat: 43.002284190400644, lng: -81.27639553865829 },
  { lat: 43.00252350154392, lng: -81.27643040737486 },
  { lat: 43.00380848917831, lng: -81.2765600129167 },
  { lat: 43.003839873520604, lng: -81.27653587303567 },
  { lat: 43.003918334306206, lng: -81.27637762270366 },
];

/** Exact [lng, lat] polyline — no dedupe, simplify, or resampling; every vertex is preserved. */
const DEMO_WALK_PATH: [number, number][] = DEMO_WALK_PATH_RAW.map((p) => [p.lng, p.lat]);

/** First point — spawn + walk start. */
const WALK_START_LNG_LAT = DEMO_WALK_PATH[0]!;

function totalRouteLength(route: [number, number][]) {
  let len = 0;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i][0] - route[i - 1][0];
    const dy = route[i][1] - route[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

const DEMO_WALK_TOTAL_LEN = totalRouteLength(DEMO_WALK_PATH);

function interpolateRoute(route: [number, number][], t: number, precomputedTotal?: number): [number, number] {
  const total = precomputedTotal ?? totalRouteLength(route);
  if (total <= 0) return route[0] ?? [0, 0];
  let target = t * total;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i][0] - route[i - 1][0];
    const dy = route[i][1] - route[i - 1][1];
    const seg = Math.sqrt(dx * dx + dy * dy);
    if (target <= seg) {
      const frac = seg > 0 ? target / seg : 0;
      return [
        route[i - 1][0] + dx * frac,
        route[i - 1][1] + dy * frac,
      ];
    }
    target -= seg;
  }
  return route[route.length - 1];
}

/** Scale duration roughly with path length so the walk stays readable. */
const WALK_DURATION_MS = Math.min(
  24_000,
  Math.max(8_000, Math.round(totalRouteLength(DEMO_WALK_PATH) * 2_000_000)),
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const westernFragments = westernRaw as WesternFragment[];
const londonJsonFragments = londonRaw as WesternFragment[];
const londonFragments: WesternFragment[] = [...londonJsonFragments, ...LONDON_AMBIENT];

export const westernCount = westernFragments.length;
export const londonCount = londonFragments.length;
export const featuredCount = westernFragments.filter(
  (f) => f.tag === 'Featured',
).length;

// ── GL circle layer factory (shared by London + Barcelona ambient) ──────

const CITY_MAX_ZOOM = 14;

function makeCityGlowLayer(id: string, source: string): LayerProps {
  return {
    id,
    type: 'circle',
    source,
    maxzoom: CITY_MAX_ZOOM,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 12, 6, 14, 9],
      'circle-color': [
        'match', ['get', 'tag'],
        'Featured',  'rgba(217,119,6,0.14)',
        'Rare',      'rgba(124,58,237,0.12)',
        'Social',    'rgba(37,99,235,0.12)',
        'Archive',   'rgba(147,51,234,0.12)',
        'Unlocked',  'rgba(212,160,23,0.18)',
        'Legendary', 'rgba(245,158,11,0.16)',
        'rgba(120,113,108,0.10)',
      ],
      'circle-blur': 0.7,
    },
  };
}

function makeCityCoreLayer(id: string, source: string): LayerProps {
  return {
    id,
    type: 'circle',
    source,
    maxzoom: CITY_MAX_ZOOM,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 12, 3, 14, 4.5],
      'circle-color': [
        'match', ['get', 'tag'],
        'Featured',  '#d97706',
        'Rare',      '#7c3aed',
        'Social',    '#2563eb',
        'Archive',   '#9333ea',
        'Unlocked',  '#d4a017',
        'Legendary', '#f59e0b',
        '#78716c',
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'rgba(255,255,255,0.55)',
      'circle-opacity': 0.55,
    },
  };
}

const londonGlowLayer = makeCityGlowLayer('london-glow', 'london');
const londonCoreLayer = makeCityCoreLayer('london-core', 'london');

// Barcelona uses dedicated layers WITHOUT maxzoom — it's the primary view when active
const bcnGlowLayer: LayerProps = {
  id: 'bcn-glow',
  type: 'circle',
  source: 'barcelona',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 6, 15, 9, 17, 12],
    'circle-color': [
      'match', ['get', 'tag'],
      'Featured',  'rgba(217,119,6,0.18)',
      'Rare',      'rgba(124,58,237,0.14)',
      'Social',    'rgba(37,99,235,0.14)',
      'Archive',   'rgba(147,51,234,0.14)',
      'Unlocked',  'rgba(212,160,23,0.22)',
      'Legendary', 'rgba(245,158,11,0.20)',
      'rgba(120,113,108,0.12)',
    ],
    'circle-blur': 0.6,
  },
};

const bcnCoreLayer: LayerProps = {
  id: 'bcn-core',
  type: 'circle',
  source: 'barcelona',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 13, 3.5, 15, 5, 17, 7],
    'circle-color': [
      'match', ['get', 'tag'],
      'Featured',  '#d97706',
      'Rare',      '#7c3aed',
      'Social',    '#2563eb',
      'Archive',   '#9333ea',
      'Unlocked',  '#d4a017',
      'Legendary', '#f59e0b',
      '#78716c',
    ],
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.6)',
    'circle-opacity': 0.7,
  },
};

const LONDON_INTERACTIVE = ['london-core'];
const BCN_INTERACTIVE = ['bcn-core'];

// ── Barcelona constants ─────────────────────────────────────────────────

const BCN_ARRIVAL_ZOOM = 13.2;
const BCN_DETAIL_ZOOM = 13.8;

// ── Types ───────────────────────────────────────────────────────────────

interface PopupInfo {
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
  tag: string;
}

// ── Component ───────────────────────────────────────────────────────────

type CityMode = 'western' | 'barcelona';

interface EchoesMapProps {
  onAcebClick?: () => void;
}

export default function EchoesMap({ onAcebClick }: EchoesMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [rippleKey, setRippleKey] = useState<string | null>(null);

  // ── Walk state ──
  const [playerPos, setPlayerPos] = useState<{ lng: number; lat: number }>({
    lng: WALK_START_LNG_LAT[0],
    lat: WALK_START_LNG_LAT[1],
  });
  const [walking, setWalking] = useState(false);
  const [walkDone, setWalkDone] = useState(false);
  const walkStartRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // ── City & travel state ──
  const [cityMode, setCityMode] = useState<CityMode>('western');
  const [traveling, setTraveling] = useState(false);
  const [travelLabel, setTravelLabel] = useState('');
  const [bcnRevealed, setBcnRevealed] = useState(false);
  const [bcnHeroesVisible, setBcnHeroesVisible] = useState(false);

  const startWalk = useCallback(() => {
    if (walking || walkDone) return;
    setWalking(true);
    walkStartRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - walkStartRef.current;
      const t = Math.min(elapsed / WALK_DURATION_MS, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const [lng, lat] = interpolateRoute(DEMO_WALK_PATH, eased, DEMO_WALK_TOTAL_LEN);
      setPlayerPos({ lng, lat });

      mapRef.current?.easeTo({
        center: [lng, lat],
        duration: 60,
        easing: (x: number) => x,
      });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setWalking(false);
        setWalkDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [walking, walkDone]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── GTA-style Barcelona transition ──
  const travelToBarcelona = useCallback(() => {
    const map = mapRef.current;
    if (!map || traveling || cityMode === 'barcelona') return;

    setTraveling(true);
    setPopupInfo(null);
    setTravelLabel('Leaving London, Ontario…');

    // Phase 1: zoom out dramatically
    map.easeTo({ zoom: 4.5, pitch: 45, bearing: 30, duration: 2400, easing: (t: number) => 1 - Math.pow(1 - t, 3) });

    setTimeout(() => {
      setTravelLabel('Traveling to Barcelona…');
      setCityMode('barcelona');
      setBcnRevealed(false);
      setBcnHeroesVisible(false);

      // Phase 2: fly to Barcelona from high altitude
      map.flyTo({
        center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
        zoom: 5,
        pitch: 40,
        bearing: -15,
        duration: 3200,
        essential: true,
      });

      setTimeout(() => {
        setTravelLabel('Arriving in Barcelona…');

        // Phase 3: descend into Barcelona
        map.flyTo({
          center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
          zoom: BCN_ARRIVAL_ZOOM,
          pitch: 25,
          bearing: 0,
          duration: 2800,
          essential: true,
        });

        // Reveal ambient density mid-descent
        setTimeout(() => {
          setBcnRevealed(true);
        }, 1200);

        // Show hero markers slightly later
        setTimeout(() => {
          setBcnHeroesVisible(true);
        }, 2000);

        // Settle camera and end transition
        setTimeout(() => {
          map.easeTo({ pitch: 0, bearing: 0, zoom: BCN_DETAIL_ZOOM, duration: 1200 });
          setTimeout(() => {
            setTraveling(false);
            setTravelLabel('');
          }, 1300);
        }, 2800);
      }, 3200);
    }, 2500);
  }, [traveling, cityMode]);

  const travelToWestern = useCallback(() => {
    const map = mapRef.current;
    if (!map || traveling || cityMode === 'western') return;

    setTraveling(true);
    setPopupInfo(null);
    setTravelLabel('Leaving Barcelona…');
    setBcnHeroesVisible(false);

    map.easeTo({ zoom: 4.5, pitch: 45, bearing: -30, duration: 2400, easing: (t: number) => 1 - Math.pow(1 - t, 3) });

    setTimeout(() => {
      setTravelLabel('Returning to Western…');
      setCityMode('western');
      setBcnRevealed(false);

      map.flyTo({
        center: [WALK_START_LNG_LAT[0], WALK_START_LNG_LAT[1]],
        zoom: 5,
        pitch: 40,
        bearing: 15,
        duration: 3200,
        essential: true,
      });

      setTimeout(() => {
        setTravelLabel('Arriving at Western…');
        map.flyTo({
          center: [WALK_START_LNG_LAT[0], WALK_START_LNG_LAT[1]],
          zoom: 14.6,
          pitch: 0,
          bearing: 0,
          duration: 2800,
          essential: true,
        });

        setTimeout(() => {
          setTraveling(false);
          setTravelLabel('');
        }, 3000);
      }, 3200);
    }, 2500);
  }, [traveling, cityMode]);

  const tokenLoaded =
    MAPBOX_TOKEN.length > 0 && MAPBOX_TOKEN !== 'your_mapbox_token_here';

  const westernRegular = useMemo(
    () => westernFragments.filter((f) => !isPremiumTag(f.tag)),
    [],
  );
  const westernPremium = useMemo(
    () => westernFragments.filter((f) => isPremiumTag(f.tag)),
    [],
  );
  const londonGeoJSON = useMemo(
    () => fragmentsToGeoJSON(londonFragments),
    [],
  );
  const bcnGeoJSON = useMemo(() => barcelonaToGeoJSON(), []);

  const fragKey = (f: WesternFragment) => `${f.lat},${f.lng}`;

  // ── Render an orb marker with correct unlocked styling ──
  const renderOrb = useCallback(
    (frag: WesternFragment, premium: boolean, keyPrefix = '') => {
      const key = `${keyPrefix}${fragKey(frag)}`;
      const color = getTagColor(frag.tag);
      const unlocked = isUnlockedTag(frag.tag);
      const orbCls = premium ? 'echo-orb echo-orb--premium' : 'echo-orb';
      const glowCls = premium
        ? `echo-orb__glow echo-orb__glow--premium${unlocked ? ' echo-orb__glow--unlocked' : ''}`
        : `echo-orb__glow${unlocked ? ' echo-orb__glow--unlocked' : ''}`;
      const coreCls = premium
        ? `echo-orb__core echo-orb__core--premium${unlocked ? ' echo-orb__core--unlocked' : ''}`
        : `echo-orb__core${unlocked ? ' echo-orb__core--unlocked' : ''}`;

      return (
        <Marker key={key} longitude={frag.lng} latitude={frag.lat} anchor="center">
          <div
            className={orbCls}
            onClick={(e) => {
              e.stopPropagation();
              handleFragmentClick(frag);
            }}
          >
            <div className={glowCls} style={{ background: color.glow }} />
            <div className={coreCls} style={{ background: color.core }} />
            {unlocked && <div className="echo-orb__check">✓</div>}
            {rippleKey === key && (
              <div className="echo-ripple" style={{ borderColor: color.core }} />
            )}
          </div>
        </Marker>
      );
    },
    [rippleKey],
  );

  const handleFragmentClick = useCallback((frag: WesternFragment) => {
    if (traveling) return;

    if (isAcebFragment(frag) && onAcebClick) {
      setPopupInfo(null);
      const key = fragKey(frag);
      setRippleKey(key);
      setTimeout(() => {
        setRippleKey(null);
        onAcebClick();
      }, 380);
      return;
    }

    setPopupInfo(null);
    const key = fragKey(frag);
    setRippleKey(key);

    setTimeout(() => {
      setPopupInfo({
        lng: frag.lng,
        lat: frag.lat,
        title: frag.title,
        subtitle: frag.subtitle,
        tag: frag.tag,
      });
      setRippleKey(null);
    }, 380);
  }, [onAcebClick, traveling]);

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (traveling) return;
    const feature = e.features?.[0];
    if (feature?.layer?.id === 'london-core' || feature?.layer?.id === 'bcn-core') {
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const props = feature.properties as Record<string, unknown>;
      setPopupInfo({
        lng: coords[0],
        lat: coords[1],
        title: String(props.title ?? ''),
        subtitle: String(props.subtitle ?? ''),
        tag: String(props.tag ?? ''),
      });
      return;
    }
    setPopupInfo(null);
  }, [traveling]);

  const isWestern = cityMode === 'western';
  const isBcn = cityMode === 'barcelona';

  if (!tokenLoaded) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: '#f5f5f0' }}
      >
        <div className="text-center max-w-sm px-6">
          <div
            className="w-10 h-10 rounded-full border flex items-center justify-center mx-auto mb-4"
            style={{ borderColor: 'rgba(217,119,6,0.5)', color: '#d97706' }}
          >
            !
          </div>
          <p className="text-sm font-medium mb-2" style={{ color: 'rgba(30,20,60,0.7)' }}>
            Mapbox token missing
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(30,20,60,0.4)' }}>
            Add your token to <code className="text-black/40">.env.local</code>{' '}
            as <code className="text-black/40">NEXT_PUBLIC_MAPBOX_TOKEN</code>{' '}
            and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const interactiveLayers = isBcn ? BCN_INTERACTIVE : LONDON_INTERACTIVE;

  return (
    <>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: WALK_START_LNG_LAT[0],
          latitude: WALK_START_LNG_LAT[1],
          zoom: 14.6,
          pitch: 0,
          bearing: 0,
        }}
        minZoom={2}
        maxZoom={18}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        interactiveLayerIds={interactiveLayers}
        onClick={handleMapClick}
        cursor="auto"
      >
        {/* ── London: secondary city network ── */}
        {isWestern && (
          <Source id="london" type="geojson" data={londonGeoJSON}>
            <Layer {...londonGlowLayer} />
            <Layer {...londonCoreLayer} />
          </Source>
        )}

        {/* ── Western: fragment orbs ── */}
        {isWestern && !traveling && westernRegular.map((frag) => renderOrb(frag, false))}
        {isWestern && !traveling && westernPremium.map((frag) => renderOrb(frag, true, 'p-'))}

        {/* ── Player marker (Western only) ── */}
        {isWestern && !traveling && (
          <Marker longitude={playerPos.lng} latitude={playerPos.lat} anchor="center">
            <div className="player-halo">
              <div className="player-halo__outer" />
              <div className="player-halo__ring" />
              <div className="player-halo__core" />
            </div>
          </Marker>
        )}

        {/* ── Barcelona: ambient city density (GL circles, NO maxzoom) ── */}
        {isBcn && bcnRevealed && (
          <Source id="barcelona" type="geojson" data={bcnGeoJSON}>
            <Layer {...bcnGlowLayer} />
            <Layer {...bcnCoreLayer} />
          </Source>
        )}

        {/* ── Barcelona: hero fragment markers (individual orbs at detail zoom) ── */}
        {isBcn && bcnHeroesVisible && !traveling && BARCELONA_HEROES.map((frag) => renderOrb(frag, isPremiumTag(frag.tag), 'bcn-'))}

        {/* ── Demo walk button (Western only) ── */}
        {isWestern && !traveling && (
          <div className="demo-walk-btn-wrap">
            <button
              className={`demo-walk-btn ${walking ? 'demo-walk-btn--active' : ''} ${walkDone ? 'demo-walk-btn--done' : ''}`}
              onClick={startWalk}
              disabled={walking || walkDone}
            >
              {walkDone ? 'Arrived — tap the fragment' : walking ? 'Walking…' : 'Simulate Walk'}
            </button>
          </div>
        )}

        {/* ── Fragment popup card ── */}
        {popupInfo && !traveling && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            className="echoes-popup"
            maxWidth="280px"
            offset={18}
          >
            <div className="p-3">
              <h3
                className="text-sm font-semibold leading-snug mb-0.5"
                style={{ color: isUnlockedTag(popupInfo.tag) ? '#b8860b' : 'rgba(20,10,50,0.9)' }}
              >
                {popupInfo.title}
              </h3>
              <p className="text-[11px] mb-2.5" style={{ color: 'rgba(20,10,50,0.42)' }}>
                {popupInfo.subtitle}
              </p>
              {(() => {
                const c = getTagColor(popupInfo.tag);
                return (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block"
                    style={{
                      background: c.badge,
                      color: c.core,
                      border: `1px solid ${c.core}30`,
                    }}
                  >
                    {isUnlockedTag(popupInfo.tag) ? '✓ Unlocked' : popupInfo.tag}
                  </span>
                );
              })()}
            </div>
          </Popup>
        )}
      </Map>

      {/* ── Dev city-switch button ── */}
      {!traveling && (
        <div className="dev-city-btn-wrap">
          <button
            className="dev-city-btn"
            onClick={isWestern ? travelToBarcelona : travelToWestern}
          >
            {isWestern ? 'Dev: Barcelona' : 'Dev: Western'}
          </button>
        </div>
      )}

      {/* ── Travel overlay ── */}
      {traveling && (
        <div className="travel-overlay">
          <div className="travel-overlay__content">
            <div className="travel-overlay__spinner" />
            <p className="travel-overlay__label">{travelLabel}</p>
          </div>
        </div>
      )}
    </>
  );
}
