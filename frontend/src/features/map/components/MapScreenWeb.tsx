import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  Layer,
  Marker,
  Popup,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapWeb.css';
import { BARCELONA_CENTER, BARCELONA_HEROES } from '../barcelona';
import { barcelonaGeoJSON, londonGeoJSON, westernFragments } from '../runtimeData';
import { getTagColor, isAcebFragment, isPremiumTag, isUnlockedTag } from '../geo';
import { CityMode, PopupInfo, WesternFragment } from '../types';
import { DEMO_WALK_PATH, WALK_DURATION_MS, WALK_START, easeInOutQuad, interpolateRoute } from '../walkPath';
import { AcebFlowWeb } from './AcebFlowWeb';
import { MapHudWeb } from './MapHudWeb';

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
const BCN_ARRIVAL_ZOOM = 13.2;
const BCN_DETAIL_ZOOM = 13.8;
const INITIAL_WESTERN_ZOOM = 14.6;

const londonGlowLayer: LayerProps = {
  id: 'london-glow',
  type: 'circle',
  source: 'london',
  maxzoom: 14,
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 12, 6, 14, 9],
    'circle-color': [
      'match', ['get', 'tag'],
      'Featured', 'rgba(217,119,6,0.14)',
      'Rare', 'rgba(124,58,237,0.12)',
      'Social', 'rgba(37,99,235,0.12)',
      'Archive', 'rgba(147,51,234,0.12)',
      'Unlocked', 'rgba(212,160,23,0.18)',
      'Legendary', 'rgba(245,158,11,0.16)',
      'rgba(120,113,108,0.10)',
    ],
    'circle-blur': 0.7,
  },
};

const londonCoreLayer: LayerProps = {
  id: 'london-core',
  type: 'circle',
  source: 'london',
  maxzoom: 14,
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 12, 3, 14, 4.5],
    'circle-color': [
      'match', ['get', 'tag'],
      'Featured', '#d97706',
      'Rare', '#7c3aed',
      'Social', '#2563eb',
      'Archive', '#9333ea',
      'Unlocked', '#d4a017',
      'Legendary', '#f59e0b',
      '#78716c',
    ],
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.55)',
    'circle-opacity': 0.55,
  },
};

const barcelonaGlowLayer: LayerProps = {
  id: 'bcn-glow',
  type: 'circle',
  source: 'barcelona',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 6, 15, 9, 17, 12],
    'circle-color': [
      'match', ['get', 'tag'],
      'Featured', 'rgba(217,119,6,0.18)',
      'Rare', 'rgba(124,58,237,0.14)',
      'Social', 'rgba(37,99,235,0.14)',
      'Archive', 'rgba(147,51,234,0.14)',
      'Unlocked', 'rgba(212,160,23,0.22)',
      'Legendary', 'rgba(245,158,11,0.20)',
      'rgba(120,113,108,0.12)',
    ],
    'circle-blur': 0.6,
  },
};

const barcelonaCoreLayer: LayerProps = {
  id: 'bcn-core',
  type: 'circle',
  source: 'barcelona',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 13, 3.5, 15, 5, 17, 7],
    'circle-color': [
      'match', ['get', 'tag'],
      'Featured', '#d97706',
      'Rare', '#7c3aed',
      'Social', '#2563eb',
      'Archive', '#9333ea',
      'Unlocked', '#d4a017',
      'Legendary', '#f59e0b',
      '#78716c',
    ],
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.6)',
    'circle-opacity': 0.7,
  },
};

export function MapScreen() {
  const mapRef = useRef<MapRef>(null);
  const rafRef = useRef<number>(0);
  const walkStartRef = useRef<number>(0);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [rippleKey, setRippleKey] = useState<string | null>(null);
  const [selectedMarkerKey, setSelectedMarkerKey] = useState<string | null>(null);
  const [playerPos, setPlayerPos] = useState({ lng: WALK_START[0], lat: WALK_START[1] });
  const [walking, setWalking] = useState(false);
  const [walkDone, setWalkDone] = useState(false);
  const [cityMode, setCityMode] = useState<CityMode>('western');
  const [traveling, setTraveling] = useState(false);
  const [travelLabel, setTravelLabel] = useState('');
  const [bcnRevealed, setBcnRevealed] = useState(false);
  const [bcnHeroesVisible, setBcnHeroesVisible] = useState(false);
  const [acebOpen, setAcebOpen] = useState(false);

  const tokenLoaded = TOKEN.length > 0 && TOKEN !== 'your_mapbox_token_here';
  const isWestern = cityMode === 'western';
  const isBarcelona = cityMode === 'barcelona';
  const westernRegular = useMemo(() => westernFragments.filter((fragment) => !isPremiumTag(fragment.tag)), []);
  const westernPremium = useMemo(() => westernFragments.filter((fragment) => isPremiumTag(fragment.tag)), []);

  const clearScheduledEffects = useCallback(() => {
    timeoutRefs.current.forEach((handle) => clearTimeout(handle));
    timeoutRefs.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => clearScheduledEffects, [clearScheduledEffects]);

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const handle = setTimeout(callback, delay);
    timeoutRefs.current.push(handle);
  }, []);

  const fragmentKey = useCallback(
    (fragment: WesternFragment, prefix = '') => `${prefix}${fragment.lng},${fragment.lat}`,
    [],
  );

  const focusPopup = useCallback((fragment: WesternFragment, key: string) => {
    setPopupInfo({
      lng: fragment.lng,
      lat: fragment.lat,
      title: fragment.title,
      subtitle: fragment.subtitle,
      tag: fragment.tag,
    });
    setSelectedMarkerKey(key);
    setRippleKey(null);
  }, []);

  const handleFragmentClick = useCallback(
    (fragment: WesternFragment, prefix = '') => {
      if (traveling) {
        return;
      }

      const key = fragmentKey(fragment, prefix);
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

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (traveling) {
        return;
      }

      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== 'Point') {
        setPopupInfo(null);
        setSelectedMarkerKey(null);
        return;
      }

      const layerId = feature.layer?.id;
      if (layerId !== 'london-core' && layerId !== 'bcn-core') {
        setPopupInfo(null);
        setSelectedMarkerKey(null);
        return;
      }

      const coords = feature.geometry.coordinates as [number, number];
      const props = feature.properties as Record<string, unknown>;
      setPopupInfo({
        lng: coords[0],
        lat: coords[1],
        title: String(props.title ?? ''),
        subtitle: String(props.subtitle ?? ''),
        tag: String(props.tag ?? ''),
      });
      setSelectedMarkerKey(null);
      setRippleKey(null);
    },
    [traveling],
  );

  const startWalk = useCallback(() => {
    if (walking || walkDone || traveling) {
      return;
    }

    setPopupInfo(null);
    setSelectedMarkerKey(null);
    setWalking(true);
    walkStartRef.current = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - walkStartRef.current) / WALK_DURATION_MS, 1);
      const eased = easeInOutQuad(progress);
      const [lng, lat] = interpolateRoute(DEMO_WALK_PATH, eased);
      setPlayerPos({ lng, lat });
      mapRef.current?.easeTo({
        center: [lng, lat],
        duration: 60,
        easing: (value: number) => value,
      });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setWalking(false);
        setWalkDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [traveling, walkDone, walking]);

  const travelToBarcelona = useCallback(() => {
    const map = mapRef.current;
    if (!map || traveling || isBarcelona) {
      return;
    }

    clearScheduledEffects();
    setTraveling(true);
    setPopupInfo(null);
    setSelectedMarkerKey(null);
    setTravelLabel('Leaving London, Ontario...');
    setWalking(false);

    map.easeTo({
      zoom: 4.5,
      pitch: 45,
      bearing: 30,
      duration: 2400,
      easing: (value: number) => 1 - Math.pow(1 - value, 3),
    });

    scheduleTimeout(() => {
      setTravelLabel('Traveling to Barcelona...');
      setCityMode('barcelona');
      setBcnRevealed(false);
      setBcnHeroesVisible(false);
      map.flyTo({
        center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
        zoom: 5,
        pitch: 40,
        bearing: -15,
        duration: 3200,
        essential: true,
      });

      scheduleTimeout(() => {
        setTravelLabel('Arriving in Barcelona...');
        map.flyTo({
          center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
          zoom: BCN_ARRIVAL_ZOOM,
          pitch: 25,
          bearing: 0,
          duration: 2800,
          essential: true,
        });
        scheduleTimeout(() => setBcnRevealed(true), 1200);
        scheduleTimeout(() => setBcnHeroesVisible(true), 2000);
        scheduleTimeout(() => {
          map.easeTo({
            center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
            zoom: BCN_DETAIL_ZOOM,
            pitch: 0,
            bearing: 0,
            duration: 1200,
          });
          scheduleTimeout(() => {
            setTraveling(false);
            setTravelLabel('');
          }, 1300);
        }, 2800);
      }, 3200);
    }, 2500);
  }, [clearScheduledEffects, isBarcelona, scheduleTimeout, traveling]);

  const travelToWestern = useCallback(() => {
    const map = mapRef.current;
    if (!map || traveling || isWestern) {
      return;
    }

    clearScheduledEffects();
    setTraveling(true);
    setPopupInfo(null);
    setSelectedMarkerKey(null);
    setTravelLabel('Leaving Barcelona...');
    setBcnHeroesVisible(false);

    map.easeTo({
      zoom: 4.5,
      pitch: 45,
      bearing: -30,
      duration: 2400,
      easing: (value: number) => 1 - Math.pow(1 - value, 3),
    });

    scheduleTimeout(() => {
      setTravelLabel('Returning to Western...');
      setCityMode('western');
      setBcnRevealed(false);
      map.flyTo({
        center: [WALK_START[0], WALK_START[1]],
        zoom: 5,
        pitch: 40,
        bearing: 15,
        duration: 3200,
        essential: true,
      });

      scheduleTimeout(() => {
        setTravelLabel('Arriving at Western...');
        map.flyTo({
          center: [WALK_START[0], WALK_START[1]],
          zoom: INITIAL_WESTERN_ZOOM,
          pitch: 0,
          bearing: 0,
          duration: 2800,
          essential: true,
        });
        scheduleTimeout(() => {
          setTraveling(false);
          setTravelLabel('');
        }, 3000);
      }, 3200);
    }, 2500);
  }, [clearScheduledEffects, isWestern, scheduleTimeout, traveling]);

  if (!tokenLoaded) {
    return (
      <div className="map-web-root">
        <div className="map-missing-card">
          <div className="map-missing-icon">!</div>
          <p className="map-missing-title">Mapbox token missing</p>
          <p className="map-missing-body">Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN and restart the app.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-web-root">
      <MapHudWeb tokenLoaded={tokenLoaded} />
      <Map
        attributionControl={false}
        cursor="auto"
        interactiveLayerIds={isBarcelona ? ['bcn-core'] : ['london-core']}
        initialViewState={{
          longitude: WALK_START[0],
          latitude: WALK_START[1],
          zoom: INITIAL_WESTERN_ZOOM,
          pitch: 0,
          bearing: 0,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={TOKEN}
        maxZoom={18}
        minZoom={2}
        onClick={handleMapClick}
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
      >
        {isWestern ? (
          <Source data={londonGeoJSON as GeoJSON.FeatureCollection} id="london" type="geojson">
            <Layer {...londonGlowLayer} />
            <Layer {...londonCoreLayer} />
          </Source>
        ) : null}

        {isWestern && !traveling
          ? westernRegular.map((fragment) =>
              renderOrb(
                fragment,
                false,
                selectedMarkerKey === fragmentKey(fragment),
                rippleKey === fragmentKey(fragment),
                () => handleFragmentClick(fragment),
              ),
            )
          : null}

        {isWestern && !traveling
          ? westernPremium.map((fragment) =>
              renderOrb(
                fragment,
                true,
                selectedMarkerKey === fragmentKey(fragment, 'p-'),
                rippleKey === fragmentKey(fragment, 'p-'),
                () => handleFragmentClick(fragment, 'p-'),
                'p-',
              ),
            )
          : null}

        {isWestern && !traveling ? (
          <Marker anchor="center" latitude={playerPos.lat} longitude={playerPos.lng}>
            <div className="player-halo">
              <div className="player-halo__outer" />
              <div className="player-halo__ring" />
              <div className="player-halo__core" />
            </div>
          </Marker>
        ) : null}

        {isBarcelona && bcnRevealed ? (
          <Source data={barcelonaGeoJSON as GeoJSON.FeatureCollection} id="barcelona" type="geojson">
            <Layer {...barcelonaGlowLayer} />
            <Layer {...barcelonaCoreLayer} />
          </Source>
        ) : null}

        {isBarcelona && bcnHeroesVisible && !traveling
          ? BARCELONA_HEROES.map((fragment) =>
              renderOrb(
                fragment,
                isPremiumTag(fragment.tag),
                selectedMarkerKey === fragmentKey(fragment, 'bcn-'),
                rippleKey === fragmentKey(fragment, 'bcn-'),
                () => handleFragmentClick(fragment, 'bcn-'),
                'bcn-',
              ),
            )
          : null}

        {popupInfo && !traveling ? (
          <Popup
            anchor="bottom"
            className="echoes-popup"
            closeOnClick={false}
            latitude={popupInfo.lat}
            longitude={popupInfo.lng}
            maxWidth="280px"
            offset={18}
            onClose={() => {
              setPopupInfo(null);
              setSelectedMarkerKey(null);
            }}
          >
            <div style={{ padding: 12 }}>
              <h3
                style={{
                  margin: '0 0 4px',
                  color: isUnlockedTag(popupInfo.tag) ? '#b8860b' : 'rgba(20,10,50,0.9)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {popupInfo.title}
              </h3>
              <p style={{ margin: 0, color: 'rgba(20,10,50,0.38)', fontSize: 11 }}>{popupInfo.subtitle}</p>
              <div style={{ marginTop: 10 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: `1px solid ${getTagColor(popupInfo.tag).core}30`,
                    background: getTagColor(popupInfo.tag).badge,
                    color: getTagColor(popupInfo.tag).core,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isUnlockedTag(popupInfo.tag) ? 'Unlocked' : popupInfo.tag}
                </span>
              </div>
            </div>
          </Popup>
        ) : null}
      </Map>

      {process.env.NODE_ENV !== 'production' ? (
        <div className="map-dev-actions">
          <button className="map-dev-button" disabled={traveling} onClick={isWestern ? travelToBarcelona : travelToWestern}>
            {isWestern ? 'Dev: Barcelona' : 'Dev: Western'}
          </button>
        </div>
      ) : null}

      {isWestern && !traveling ? (
        <div className="demo-walk-btn-wrap">
          <button
            className={`demo-walk-btn ${walking ? 'demo-walk-btn--active' : ''} ${walkDone ? 'demo-walk-btn--done' : ''}`}
            disabled={walking || walkDone}
            onClick={startWalk}
          >
            {walkDone ? 'Arrived - tap the fragment' : walking ? 'Walking...' : 'Simulate Walk'}
          </button>
        </div>
      ) : null}

      {traveling ? (
        <div className="travel-overlay">
          <div className="travel-overlay__content">
            <div className="travel-overlay__spinner" />
            <span className="travel-overlay__label">{travelLabel}</span>
          </div>
        </div>
      ) : null}

      <AcebFlowWeb onClose={() => setAcebOpen(false)} visible={acebOpen} />
    </div>
  );
}

function renderOrb(
  fragment: WesternFragment,
  premium: boolean,
  active: boolean,
  rippleVisible: boolean,
  onClick: () => void,
  prefix = '',
) {
  const key = `${prefix}${fragment.lng},${fragment.lat}`;
  const color = getTagColor(fragment.tag);
  const unlocked = isUnlockedTag(fragment.tag);

  return (
    <Marker anchor="center" key={key} latitude={fragment.lat} longitude={fragment.lng}>
      <div
        className={`echo-orb${premium ? ' echo-orb--premium' : ''}`}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <div
          className={[
            'echo-orb__glow',
            premium ? 'echo-orb__glow--premium' : '',
            unlocked ? 'echo-orb__glow--unlocked' : '',
            active ? 'echo-orb__glow--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ background: color.glow }}
        />
        <div
          className={[
            'echo-orb__core',
            premium ? 'echo-orb__core--premium' : '',
            unlocked ? 'echo-orb__core--unlocked' : '',
            active ? 'echo-orb__core--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ background: color.core }}
        />
        {unlocked ? <div className="echo-orb__check">v</div> : null}
        {rippleVisible ? <div className="echo-ripple" style={{ borderColor: color.core }} /> : null}
      </div>
    </Marker>
  );
}
