import { useCallback, useEffect, useRef, useState } from 'react';
import type { WesternFragment } from '../../data/map/geo';
import {
  getTagColor, isPremiumTag, isUnlockedTag, isLockedTag,
  isAcebFragment, fragmentsToGeoJSON,
} from '../../data/map/geo';
import { BARCELONA_HEROES, BARCELONA_CENTER, BARCELONA_AMBIENT_ONLY } from '../../data/map/barcelona';

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
const GL_VERSION = '3.9.0';
const CDN = `https://api.mapbox.com/mapbox-gl-js/v${GL_VERSION}`;

// ── Demo walk path ──────────────────────────────────────────────────────

const WALK_PATH_RAW: { lat: number; lng: number }[] = [
  { lat: 43.000142254099956, lng: -81.27676819671778 },
  { lat: 43.00020508029888,  lng: -81.27670681822416 },
  { lat: 43.00023646648194,  lng: -81.27664512741713 },
  { lat: 43.00033454820061,  lng: -81.2766585384621  },
  { lat: 43.0004188983533,   lng: -81.27666926729816 },
  { lat: 43.00051109489979,  lng: -81.27656197893762 },
  { lat: 43.000624869170366, lng: -81.27654588568332 },
  { lat: 43.00066799209495,  lng: -81.27650798831422 },
  { lat: 43.0007405720724,   lng: -81.27651067052311 },
  { lat: 43.00090927114718,  lng: -81.27652408156807 },
  { lat: 43.00112504835914,  lng: -81.2765401748224  },
  { lat: 43.00142909678027,  lng: -81.2765911367938  },
  { lat: 43.001684103973986, lng: -81.27660454783876 },
  { lat: 43.00187045471512,  lng: -81.27671988282651 },
  { lat: 43.00212926804295,  lng: -81.2766948961235  },
  { lat: 43.00223788947062,  lng: -81.27636633785717 },
  { lat: 43.002284190400644, lng: -81.27639553865829 },
  { lat: 43.00252350154392,  lng: -81.27643040737486 },
  { lat: 43.00380848917831,  lng: -81.2765600129167  },
  { lat: 43.003839873520604, lng: -81.27653587303567 },
  { lat: 43.003918334306206, lng: -81.27637762270366 },
];

const WALK_PATH: [number, number][] = WALK_PATH_RAW.map((p) => [p.lng, p.lat]);
const WALK_START = WALK_PATH[0]!;

function routeLength(route: [number, number][]) {
  let len = 0;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i][0] - route[i - 1][0];
    const dy = route[i][1] - route[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

const WALK_TOTAL = routeLength(WALK_PATH);
const WALK_MS = Math.min(24_000, Math.max(8_000, Math.round(WALK_TOTAL * 2_000_000)));

function interpolate(route: [number, number][], t: number, total: number): [number, number] {
  if (total <= 0) return route[0] ?? [0, 0];
  let target = t * total;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i][0] - route[i - 1][0];
    const dy = route[i][1] - route[i - 1][1];
    const seg = Math.sqrt(dx * dx + dy * dy);
    if (target <= seg) {
      const f = seg > 0 ? target / seg : 0;
      return [route[i - 1][0] + dx * f, route[i - 1][1] + dy * f];
    }
    target -= seg;
  }
  return route[route.length - 1];
}

// ── Barcelona constants ─────────────────────────────────────────────────

const BCN_DETAIL_ZOOM = 13.8;

// ── Props ───────────────────────────────────────────────────────────────

export type EchoMapProps = {
  onFragmentSelect: (fragment: WesternFragment | null) => void;
  onAcebClick: () => void;
};

// ── Component ───────────────────────────────────────────────────────────

export function EchoMap({ onFragmentSelect, onAcebClick }: EchoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const campusMarkersRef = useRef<any[]>([]);
  const bcnHeroMarkersRef = useRef<any[]>([]);
  const popupRef = useRef<any>(null);

  const cbRef = useRef(onFragmentSelect);
  cbRef.current = onFragmentSelect;
  const acebRef = useRef(onAcebClick);
  acebRef.current = onAcebClick;

  // Walk state
  const [walking, setWalking] = useState(false);
  const [walkDone, setWalkDone] = useState(false);
  const rafRef = useRef(0);
  const walkT0 = useRef(0);

  // City state
  const [cityMode, setCityMode] = useState<'western' | 'barcelona'>('western');
  const [traveling, setTraveling] = useState(false);
  const [travelLabel, setTravelLabel] = useState('');
  const cityRef = useRef<'western' | 'barcelona'>('western');
  const travelRef = useRef(false);

  // ── Map initialization ──────────────────────────────────────────────

  useEffect(() => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${CDN}/mapbox-gl.css`;
    document.head.appendChild(css);

    const style = document.createElement('style');
    style.textContent = ALL_CSS;
    document.head.appendChild(style);

    let script: HTMLScriptElement | null = null;

    function boot() {
      const gl = (window as any).mapboxgl;
      if (!gl || !containerRef.current || mapRef.current) return;

      gl.accessToken = TOKEN;
      const map = new gl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [WALK_START[0], WALK_START[1]],
        zoom: 14.6,
        minZoom: 2,
        maxZoom: 18,
      });
      mapRef.current = map;

      map.on('load', () => {
        // Hide base-map POI dots/icons so only our markers are visible
        const poiLayers = ['poi-label', 'transit-label'];
        for (const lid of poiLayers) {
          if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'none');
        }

        addCampusMarkers(map, gl);
        addPlayer(map, gl);
      });

      map.on('click', (e: any) => {
        if (travelRef.current) return;
        const activeLayers = ['bcn-core'].filter((id) => !!map.getLayer(id));
        if (activeLayers.length > 0) {
          const fs = map.queryRenderedFeatures(e.point, { layers: activeLayers });
          if (fs.length > 0) return;
        }
        closePopup();
        cbRef.current(null);
      });
    }

    if ((window as any).mapboxgl) boot();
    else {
      script = document.createElement('script');
      script.src = `${CDN}/mapbox-gl.js`;
      script.onload = boot;
      document.head.appendChild(script);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      css.remove();
      style.remove();
      script?.remove();
    };
  }, []);

  // ── GL layer click handler (Barcelona only) ─────────────────────────

  function handleGLClick(e: any) {
    if (travelRef.current) return;
    const f = e.features?.[0];
    if (!f) return;
    const coords = f.geometry.coordinates.slice() as [number, number];
    const p = f.properties as Record<string, string>;
    showPopup(coords[0], coords[1], p.title ?? '', p.subtitle ?? '', p.tag ?? '');
  }

  function showPopup(lng: number, lat: number, title: string, subtitle: string, tag: string) {
    closePopup();
    const gl = (window as any).mapboxgl;
    if (!gl || !mapRef.current) return;
    const tc = getTagColor(tag);
    const unlocked = isUnlockedTag(tag);
    const html = `<div style="padding:12px">
      <div style="font-size:14px;font-weight:600;color:${unlocked ? '#b8860b' : 'rgba(20,10,50,0.9)'};margin-bottom:2px">${title}</div>
      <div style="font-size:11px;color:rgba(20,10,50,0.42);margin-bottom:8px">${subtitle}</div>
      <span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding:2px 8px;border-radius:9999px;background:${tc.badge};color:${tc.core};border:1px solid ${tc.core}30">${unlocked ? '✓ Unlocked' : tag}</span>
    </div>`;
    popupRef.current = new gl.Popup({ offset: 18, maxWidth: '280px', className: 'echoes-popup' })
      .setLngLat([lng, lat])
      .setHTML(html)
      .addTo(mapRef.current);
  }

  function closePopup() {
    popupRef.current?.remove();
    popupRef.current = null;
  }

  // ── Campus markers (single render system — DOM Markers only) ────────

  function addCampusMarkers(map: any, gl: any) {
    const frags = require('../../data/map/westernFragments.json') as WesternFragment[];
    for (const frag of frags) {
      const el = createOrbEl(frag);
      el.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        handleFragmentClick(frag, el);
      });
      const m = new gl.Marker({ element: el, anchor: 'center' }).setLngLat([frag.lng, frag.lat]).addTo(map);
      campusMarkersRef.current.push(m);
    }
  }

  function handleFragmentClick(frag: WesternFragment, el: HTMLElement) {
    if (travelRef.current) return;

    const ripple = document.createElement('div');
    ripple.className = 'echo-ripple';
    ripple.style.color = getTagColor(frag.tag).core;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    if (isAcebFragment(frag)) {
      closePopup();
      cbRef.current(null);
      setTimeout(() => acebRef.current(), 300);
      return;
    }

    closePopup();
    setTimeout(() => {
      cbRef.current(frag);
      showPopup(frag.lng, frag.lat, frag.title, frag.subtitle, frag.tag);
    }, 250);
  }

  // ── Player marker ──────────────────────────────────────────────────

  function addPlayer(map: any, gl: any) {
    const el = document.createElement('div');
    el.className = 'player-halo';
    el.innerHTML = '<div class="player-halo__outer"></div><div class="player-halo__ring"></div><div class="player-halo__core"></div>';
    playerRef.current = new gl.Marker({ element: el, anchor: 'center' }).setLngLat(WALK_START).addTo(map);
  }

  // ── Walk animation ─────────────────────────────────────────────────

  const startWalk = useCallback(() => {
    if (walking || walkDone || !mapRef.current) return;
    setWalking(true);
    walkT0.current = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - walkT0.current) / WALK_MS, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const [lng, lat] = interpolate(WALK_PATH, eased, WALK_TOTAL);

      playerRef.current?.setLngLat([lng, lat]);
      mapRef.current?.easeTo({ center: [lng, lat], duration: 60, easing: (x: number) => x });

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else { setWalking(false); setWalkDone(true); }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [walking, walkDone]);

  // ── Barcelona transition ───────────────────────────────────────────

  const travelToBarcelona = useCallback(() => {
    const map = mapRef.current;
    const gl = (window as any).mapboxgl;
    if (!map || !gl || travelRef.current || cityRef.current === 'barcelona') return;

    travelRef.current = true;
    setTraveling(true);
    closePopup();
    cbRef.current(null);
    setTravelLabel('Leaving London, Ontario…');

    campusMarkersRef.current.forEach((m) => m.remove());
    playerRef.current?.remove();

    map.easeTo({ zoom: 4.5, pitch: 45, bearing: 30, duration: 2400, easing: (t: number) => 1 - Math.pow(1 - t, 3) });

    setTimeout(() => {
      setTravelLabel('Traveling to Barcelona…');
      cityRef.current = 'barcelona';
      setCityMode('barcelona');

      map.flyTo({ center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat], zoom: 5, pitch: 40, bearing: -15, duration: 3200, essential: true });

      setTimeout(() => {
        setTravelLabel('Arriving in Barcelona…');

        const geo = fragmentsToGeoJSON(BARCELONA_AMBIENT_ONLY);
        if (!map.getSource('barcelona')) {
          map.addSource('barcelona', { type: 'geojson', data: geo });
          map.addLayer({ id: 'bcn-glow', type: 'circle', source: 'barcelona', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 6, 15, 9], 'circle-color': 'rgba(147,51,234,0.14)', 'circle-blur': 0.6 } });
          map.addLayer({ id: 'bcn-core', type: 'circle', source: 'barcelona', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 13, 3.5, 15, 5], 'circle-color': '#7c3aed', 'circle-opacity': 0.7, 'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,0.6)' } });
          map.on('click', 'bcn-core', (e: any) => handleGLClick(e));
        }

        map.flyTo({ center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat], zoom: 13.2, pitch: 25, bearing: 0, duration: 2800, essential: true });

        setTimeout(() => {
          for (const frag of BARCELONA_HEROES) {
            const el = createOrbEl(frag);
            el.addEventListener('click', (e: Event) => { e.stopPropagation(); handleFragmentClick(frag, el); });
            const m = new gl.Marker({ element: el, anchor: 'center' }).setLngLat([frag.lng, frag.lat]).addTo(map);
            bcnHeroMarkersRef.current.push(m);
          }
        }, 2000);

        setTimeout(() => {
          map.easeTo({ pitch: 0, bearing: 0, zoom: BCN_DETAIL_ZOOM, duration: 1200 });
          setTimeout(() => { travelRef.current = false; setTraveling(false); setTravelLabel(''); }, 1300);
        }, 2800);
      }, 3200);
    }, 2500);
  }, []);

  const travelToWestern = useCallback(() => {
    const map = mapRef.current;
    const gl = (window as any).mapboxgl;
    if (!map || !gl || travelRef.current || cityRef.current === 'western') return;

    travelRef.current = true;
    setTraveling(true);
    closePopup();
    cbRef.current(null);
    setTravelLabel('Leaving Barcelona…');

    bcnHeroMarkersRef.current.forEach((m) => m.remove());
    bcnHeroMarkersRef.current = [];

    map.easeTo({ zoom: 4.5, pitch: 45, bearing: -30, duration: 2400, easing: (t: number) => 1 - Math.pow(1 - t, 3) });

    setTimeout(() => {
      setTravelLabel('Returning to Western…');
      cityRef.current = 'western';
      setCityMode('western');

      if (map.getLayer('bcn-glow')) map.removeLayer('bcn-glow');
      if (map.getLayer('bcn-core')) map.removeLayer('bcn-core');
      if (map.getSource('barcelona')) map.removeSource('barcelona');

      map.flyTo({ center: [WALK_START[0], WALK_START[1]], zoom: 5, pitch: 40, bearing: 15, duration: 3200, essential: true });

      setTimeout(() => {
        setTravelLabel('Arriving at Western…');
        map.flyTo({ center: [WALK_START[0], WALK_START[1]], zoom: 14.6, pitch: 0, bearing: 0, duration: 2800, essential: true });

        setTimeout(() => {
          campusMarkersRef.current.forEach((m) => m.addTo(map));
          playerRef.current?.addTo(map);
          travelRef.current = false;
          setTraveling(false);
          setTravelLabel('');
        }, 3000);
      }, 3200);
    }, 2500);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  const isWestern = cityMode === 'western';

  return (
    // @ts-ignore web-only raw divs
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {isWestern && !traveling && (
        <div className="demo-walk-btn-wrap">
          <button className={`demo-walk-btn ${walking ? 'demo-walk-btn--active' : ''} ${walkDone ? 'demo-walk-btn--done' : ''}`} onClick={startWalk} disabled={walking || walkDone}>
            {walkDone ? 'Arrived — tap the fragment' : walking ? 'Walking…' : 'Simulate Walk'}
          </button>
        </div>
      )}

      {!traveling && (
        <div className="dev-city-btn-wrap">
          <button className="dev-city-btn" onClick={isWestern ? travelToBarcelona : travelToWestern}>
            {isWestern ? 'Dev: Barcelona' : 'Dev: Western'}
          </button>
        </div>
      )}

      {traveling && (
        <div className="travel-overlay">
          <div className="travel-overlay__content">
            <div className="travel-overlay__spinner" />
            <p className="travel-overlay__label">{travelLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Orb element ─────────────────────────────────────────────────────────

function createOrbEl(frag: WesternFragment): HTMLDivElement {
  const tc = getTagColor(frag.tag);
  const premium = isPremiumTag(frag.tag);
  const unlocked = isUnlockedTag(frag.tag);
  const locked = isLockedTag(frag.tag);
  const size = premium ? 38 : 32;
  const coreSize = premium ? 14 : 11;
  const glowSpread = premium ? 10 : 7;
  const glowBlur = premium ? 6 : 5;

  const wrap = document.createElement('div');
  wrap.className = ['echo-orb', premium ? 'echo-orb--premium' : '', unlocked ? 'echo-orb--unlocked' : '', locked ? 'echo-orb--locked' : ''].filter(Boolean).join(' ');
  wrap.style.width = `${size}px`;
  wrap.style.height = `${size}px`;

  const glow = document.createElement('div');
  glow.className = 'echo-orb__glow';
  glow.style.width = `${size}px`;
  glow.style.height = `${size}px`;
  glow.style.boxShadow = `0 0 ${glowBlur}px ${glowSpread}px ${tc.glow}`;

  const core = document.createElement('div');
  core.className = 'echo-orb__core';
  core.style.width = `${coreSize}px`;
  core.style.height = `${coreSize}px`;
  core.style.backgroundColor = locked ? '#94a3b8' : tc.core;

  wrap.appendChild(glow);
  wrap.appendChild(core);

  if (unlocked) {
    const check = document.createElement('div');
    check.className = 'echo-orb__check';
    wrap.appendChild(check);
  }
  return wrap;
}

// ── Injected CSS ────────────────────────────────────────────────────────

const ALL_CSS = `
.echo-orb { position:relative; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.echo-orb__glow { position:absolute; border-radius:50%; pointer-events:none; }
.echo-orb--premium .echo-orb__glow { animation:orb-breathe 2.8s ease-in-out infinite; }
.echo-orb--unlocked .echo-orb__glow { animation:orb-breathe 3s ease-in-out infinite; }
.echo-orb--locked .echo-orb__glow { opacity:.4; }
.echo-orb__core { border-radius:50%; border:1.5px solid rgba(255,255,255,.95); box-shadow:0 1px 4px rgba(0,0,0,.12); z-index:1; position:relative; }
.echo-orb--premium .echo-orb__core { border-width:2px; }
.echo-orb--unlocked .echo-orb__core { border-color:rgba(255,230,150,.92); box-shadow:0 0 6px rgba(212,160,23,.35),0 1px 4px rgba(0,0,0,.12); }
.echo-orb--locked .echo-orb__core { opacity:.55; border-color:rgba(255,255,255,.6); }
.echo-orb__check { position:absolute; top:-1px; right:-1px; width:10px; height:10px; border-radius:50%; background:#d4a017; border:1.5px solid white; z-index:2; }
.echo-ripple { position:absolute; width:100%; height:100%; border-radius:50%; border:1.5px solid currentColor; animation:ripple-expand .48s ease-out forwards; pointer-events:none; }
.player-halo { width:48px; height:48px; position:relative; display:flex; align-items:center; justify-content:center; }
.player-halo__outer { position:absolute; width:44px; height:44px; border-radius:50%; border:1px solid rgba(37,99,235,.22); animation:halo-breathe 3.5s ease-in-out infinite; }
.player-halo__ring { width:28px; height:28px; border-radius:50%; background:rgba(37,99,235,.18); }
.player-halo__core { position:absolute; width:11px; height:11px; border-radius:50%; background:#2563eb; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,.16); }
.demo-walk-btn-wrap { position:absolute; bottom:180px; left:50%; transform:translateX(-50%); z-index:10; }
.demo-walk-btn { padding:10px 22px; border-radius:20px; border:none; background:rgba(30,30,30,.88); color:#fff; font-size:13px; font-weight:700; cursor:pointer; backdrop-filter:blur(8px); box-shadow:0 4px 14px rgba(0,0,0,.18); transition:all .2s; }
.demo-walk-btn:hover { background:rgba(30,30,30,.95); transform:scale(1.03); }
.demo-walk-btn:disabled { opacity:.6; cursor:default; }
.demo-walk-btn--active { background:rgba(37,99,235,.85); }
.demo-walk-btn--done { background:rgba(34,120,60,.85); }
.dev-city-btn-wrap { position:absolute; top:16px; right:16px; z-index:10; }
.dev-city-btn { padding:6px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.5); background:rgba(255,251,247,.82); color:rgba(30,20,50,.7); font-size:11px; font-weight:700; cursor:pointer; backdrop-filter:blur(10px); }
.dev-city-btn:hover { background:rgba(255,251,247,.95); }
.travel-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(18,14,12,.55); pointer-events:none; z-index:20; animation:travel-fade-in .6s ease-out; }
.travel-overlay__content { display:flex; flex-direction:column; align-items:center; gap:16px; }
.travel-overlay__spinner { width:36px; height:36px; border-radius:50%; border:2.5px solid rgba(255,255,255,.15); border-top-color:rgba(255,255,255,.7); animation:aceb-spin .8s linear infinite; }
.travel-overlay__label { color:rgba(255,255,255,.8); font-size:14px; font-weight:600; letter-spacing:.02em; }
.echoes-popup .mapboxgl-popup-content { border-radius:14px; padding:0; box-shadow:0 4px 20px rgba(0,0,0,.12); background:rgba(255,253,250,.94); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.5); }
.echoes-popup .mapboxgl-popup-close-button { font-size:16px; padding:4px 8px; color:rgba(0,0,0,.3); }
@keyframes orb-breathe { 0%,100%{transform:scale(1);opacity:.65} 50%{transform:scale(1.18);opacity:1} }
@keyframes ripple-expand { 0%{transform:scale(1);opacity:.65} 100%{transform:scale(4.5);opacity:0} }
@keyframes halo-breathe { 0%,100%{transform:scale(1);opacity:.65} 50%{transform:scale(1.22);opacity:1} }
@keyframes aceb-spin { to{transform:rotate(360deg)} }
@keyframes travel-fade-in { from{opacity:0} to{opacity:1} }
.mapboxgl-canvas { outline:none; }
.mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right { display:none; }
`;
