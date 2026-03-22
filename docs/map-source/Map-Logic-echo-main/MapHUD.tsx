'use client';

import { westernCount, londonCount, featuredCount } from '@/components/EchoesMap';
import { barcelonaCount, barcelonaUnlockedCount } from '@/lib/barcelona';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
const tokenOk =
  MAPBOX_TOKEN.length > 0 && MAPBOX_TOKEN !== 'your_mapbox_token_here';

export default function MapHUD() {
  return (
    <div className="absolute top-5 left-5 z-50 pointer-events-none flex flex-col gap-3">
      {/* Title pill */}
      <div
        className="px-5 py-2.5 rounded-2xl pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(20,10,50,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 2px 16px rgba(20,10,50,0.07)',
        }}
      >
        <h1
          className="text-[13px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: 'rgba(20,10,50,0.55)' }}
        >
          Echoes
        </h1>
      </div>

      {/* Stats pill */}
      <div
        className="px-4 py-2 rounded-xl pointer-events-auto flex flex-col gap-1"
        style={{
          background: 'rgba(255,255,255,0.62)',
          border: '1px solid rgba(20,10,50,0.06)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 2px 12px rgba(20,10,50,0.05)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed' }} />
          <span className="text-[11px]" style={{ color: 'rgba(20,10,50,0.45)' }}>
            {westernCount} campus · {londonCount} city
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d97706' }} />
          <span className="text-[11px]" style={{ color: 'rgba(20,10,50,0.45)' }}>
            {featuredCount} featured
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4a017' }} />
          <span className="text-[11px]" style={{ color: 'rgba(20,10,50,0.45)' }}>
            {barcelonaCount} Barcelona · {barcelonaUnlockedCount} unlocked
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: tokenOk ? '#059669' : '#dc2626' }}
          />
          <span className="text-[11px]" style={{ color: 'rgba(20,10,50,0.45)' }}>
            Token: {tokenOk ? 'loaded' : 'missing'}
          </span>
        </div>
      </div>
    </div>
  );
}
