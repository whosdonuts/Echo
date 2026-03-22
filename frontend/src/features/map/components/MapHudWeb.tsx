import { barcelonaCount, barcelonaUnlockedCount, featuredCount, londonCount, westernCount } from '../runtimeData';

type MapHudWebProps = {
  tokenLoaded: boolean;
};

export function MapHudWeb({ tokenLoaded }: MapHudWebProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          alignSelf: 'flex-start',
          padding: '10px 18px',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(20,10,50,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 2px 16px rgba(20,10,50,0.07)',
          pointerEvents: 'auto',
        }}
      >
        <h1
          style={{
            margin: 0,
            color: 'rgba(20,10,50,0.55)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Echoes
        </h1>
      </div>
      <div
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '12px 14px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.62)',
          border: '1px solid rgba(20,10,50,0.06)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 2px 12px rgba(20,10,50,0.05)',
          pointerEvents: 'auto',
        }}
      >
        <StatRow color="#7c3aed" text={`${westernCount} campus - ${londonCount} city`} />
        <StatRow color="#d97706" text={`${featuredCount} featured`} />
        <StatRow color="#d4a017" text={`${barcelonaCount} Barcelona - ${barcelonaUnlockedCount} unlocked`} />
        <StatRow color={tokenLoaded ? '#059669' : '#dc2626'} text={`Token: ${tokenLoaded ? 'loaded' : 'missing'}`} />
      </div>
    </div>
  );
}

function StatRow({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
          display: 'inline-block',
        }}
      />
      <span style={{ color: 'rgba(20,10,50,0.45)', fontSize: 11 }}>{text}</span>
    </div>
  );
}
