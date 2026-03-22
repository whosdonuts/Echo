import { useEffect, useRef } from 'react';
import type { WesternFragment } from '../../data/map/geo';
import {
  getTagColor, isPremiumTag, isUnlockedTag, isLockedTag,
  PERTH_HALL, fragmentsToGeoJSON,
} from '../../data/map/geo';
import { LONDON_AMBIENT } from '../../data/map/londonAmbient';

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
const GL_VERSION = '3.9.0';
const CDN = `https://api.mapbox.com/mapbox-gl-js/v${GL_VERSION}`;

export type EchoMapProps = {
  onFragmentSelect: (fragment: WesternFragment | null) => void;
};

export function EchoMap({ onFragmentSelect }: EchoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const cbRef = useRef(onFragmentSelect);
  cbRef.current = onFragmentSelect;

  useEffect(() => {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `${CDN}/mapbox-gl.css`;
    document.head.appendChild(cssLink);

    const orbStyle = document.createElement('style');
    orbStyle.textContent = ORB_CSS;
    document.head.appendChild(orbStyle);

    let scriptEl: HTMLScriptElement | null = null;

    function boot() {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl || !containerRef.current || mapRef.current) return;

      mapboxgl.accessToken = TOKEN;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [PERTH_HALL.lng, PERTH_HALL.lat],
        zoom: 14.6,
        minZoom: 2,
        maxZoom: 18,
      });
      mapRef.current = map;

      map.on('load', () => {
        addLondonLayers(map);
        addCampusMarkers(map, mapboxgl, cbRef);
        addPlayerMarker(map, mapboxgl);
      });

      map.on('click', () => cbRef.current(null));
    }

    if ((window as any).mapboxgl) {
      boot();
    } else {
      scriptEl = document.createElement('script');
      scriptEl.src = `${CDN}/mapbox-gl.js`;
      scriptEl.onload = boot;
      document.head.appendChild(scriptEl);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      cssLink.remove();
      orbStyle.remove();
      scriptEl?.remove();
    };
  }, []);

  return (
    // @ts-ignore web-only raw div for mapbox-gl container
    <div ref={containerRef} style={CONTAINER_STYLE} />
  );
}

const CONTAINER_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

// ── Data helpers loaded lazily to keep module init fast ──────────────────

let _westernCache: WesternFragment[] | null = null;

function getWesternFragments(): WesternFragment[] {
  if (!_westernCache) {
    _westernCache = require('../../data/map/westernFragments.json') as WesternFragment[];
  }
  return _westernCache;
}

// ── London ambient density layers (circle layers for performance) ───────

function addLondonLayers(map: any) {
  const geo = fragmentsToGeoJSON(LONDON_AMBIENT);
  map.addSource('london', { type: 'geojson', data: geo });

  map.addLayer({
    id: 'london-glow',
    type: 'circle',
    source: 'london',
    maxzoom: 14,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 12, 5, 14, 8],
      'circle-color': '#9333ea',
      'circle-opacity': 0.12,
      'circle-blur': 0.8,
    },
  });

  map.addLayer({
    id: 'london-core',
    type: 'circle',
    source: 'london',
    maxzoom: 14,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 12, 3, 14, 5],
      'circle-color': '#7c3aed',
      'circle-opacity': 0.35,
      'circle-stroke-width': 0.5,
      'circle-stroke-color': 'rgba(255,255,255,0.5)',
    },
  });
}

// ── Western campus orb markers ──────────────────────────────────────────

function addCampusMarkers(
  map: any,
  mapboxgl: any,
  cbRef: React.MutableRefObject<(f: WesternFragment | null) => void>,
) {
  const fragments = getWesternFragments();

  for (const frag of fragments) {
    const el = createOrbEl(frag);

    el.addEventListener('click', (e: Event) => {
      e.stopPropagation();

      const ripple = document.createElement('div');
      ripple.className = 'echo-ripple';
      ripple.style.color = getTagColor(frag.tag).core;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);

      setTimeout(() => cbRef.current(frag), 200);
    });

    new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([frag.lng, frag.lat])
      .addTo(map);
  }
}

function createOrbEl(frag: WesternFragment): HTMLDivElement {
  const tc = getTagColor(frag.tag);
  const premium = isPremiumTag(frag.tag);
  const unlocked = isUnlockedTag(frag.tag);
  const locked = isLockedTag(frag.tag);
  const size = premium ? 38 : 32;

  const wrap = document.createElement('div');
  wrap.className = [
    'echo-orb',
    premium ? 'echo-orb--premium' : '',
    unlocked ? 'echo-orb--unlocked' : '',
    locked ? 'echo-orb--locked' : '',
  ].join(' ');
  wrap.style.width = `${size}px`;
  wrap.style.height = `${size}px`;

  const glow = document.createElement('div');
  glow.className = 'echo-orb__glow';
  glow.style.backgroundColor = tc.glow;

  const core = document.createElement('div');
  core.className = 'echo-orb__core';
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

// ── Player marker ───────────────────────────────────────────────────────

function addPlayerMarker(map: any, mapboxgl: any) {
  const el = document.createElement('div');
  el.className = 'player-halo';
  el.innerHTML = `
    <div class="player-halo__outer"></div>
    <div class="player-halo__ring"></div>
    <div class="player-halo__core"></div>
  `;

  new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat([PERTH_HALL.lng, PERTH_HALL.lat])
    .addTo(map);
}

// ── Injected CSS for orbs, player, and animations ───────────────────────

const ORB_CSS = `
/* ── Orb marker ─────────────────────────────────────── */
.echo-orb {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}
.echo-orb:hover { transform: scale(1.12); }

.echo-orb__glow {
  position: absolute;
  width: 24px; height: 24px;
  border-radius: 50%;
  filter: blur(5px);
}
.echo-orb--premium .echo-orb__glow {
  width: 30px; height: 30px;
  filter: blur(6px);
  animation: orb-breathe 2.8s ease-in-out infinite;
}
.echo-orb--unlocked .echo-orb__glow {
  animation: orb-breathe 3s ease-in-out infinite;
}
.echo-orb--locked .echo-orb__glow {
  opacity: 0.4;
}

.echo-orb__core {
  width: 11px; height: 11px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.95);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  transition: transform 0.2s;
  z-index: 1;
}
.echo-orb--premium .echo-orb__core {
  width: 14px; height: 14px;
  border-width: 2px;
}
.echo-orb--unlocked .echo-orb__core {
  border-color: rgba(255,230,150,0.92);
  box-shadow: 0 0 6px rgba(212,160,23,0.35), 0 1px 4px rgba(0,0,0,0.12);
}
.echo-orb--locked .echo-orb__core {
  opacity: 0.55;
  border-color: rgba(255,255,255,0.6);
}
.echo-orb:hover .echo-orb__core { transform: scale(1.18); }

.echo-orb__check {
  position: absolute;
  top: -1px; right: -1px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #d4a017;
  border: 1.5px solid white;
  z-index: 2;
}

/* ── Ripple ─────────────────────────────────────────── */
.echo-ripple {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  animation: ripple-expand 0.48s ease-out forwards;
  pointer-events: none;
}

/* ── Player halo ────────────────────────────────────── */
.player-halo {
  width: 48px; height: 48px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.player-halo__outer {
  position: absolute;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(37,99,235,0.22);
  animation: halo-breathe 3.5s ease-in-out infinite;
}
.player-halo__ring {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(37,99,235,0.18);
}
.player-halo__core {
  position: absolute;
  width: 11px; height: 11px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.16);
}

/* ── Animations ─────────────────────────────────────── */
@keyframes orb-breathe {
  0%, 100% { transform: scale(1); opacity: 0.65; }
  50% { transform: scale(1.18); opacity: 1; }
}
@keyframes ripple-expand {
  0% { transform: scale(1); opacity: 0.65; }
  100% { transform: scale(4.5); opacity: 0; }
}
@keyframes halo-breathe {
  0%, 100% { transform: scale(1); opacity: 0.65; }
  50% { transform: scale(1.22); opacity: 1; }
}

/* ── Mapbox overrides ───────────────────────────────── */
.mapboxgl-canvas { outline: none; }
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right { display: none; }
`;
