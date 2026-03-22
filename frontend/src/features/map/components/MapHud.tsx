import { StyleSheet, Text, View } from 'react-native';
import {
  barcelonaCount,
  barcelonaUnlockedCount,
  featuredCount,
  londonCount,
  westernCount,
} from '../runtimeData';

type MapHudProps = {
  tokenLoaded: boolean;
  topOffset?: number;
};

export function MapHud({ tokenLoaded, topOffset = 18 }: MapHudProps) {
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: topOffset }]}>
      <View style={styles.titlePill}>
        <Text style={styles.title}>Echoes</Text>
      </View>
      <View style={styles.statsPill}>
        <StatRow color="#7c3aed" text={`${westernCount} campus - ${londonCount} city`} />
        <StatRow color="#d97706" text={`${featuredCount} featured`} />
        <StatRow
          color="#d4a017"
          text={`${barcelonaCount} Barcelona - ${barcelonaUnlockedCount} unlocked`}
        />
        <StatRow
          color={tokenLoaded ? '#059669' : '#dc2626'}
          text={`Token: ${tokenLoaded ? 'loaded' : 'missing'}`}
        />
      </View>
    </View>
  );
}

function StatRow({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.statText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 40,
    gap: 12,
  },
  titlePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.08)',
  },
  title: {
    color: 'rgba(20,10,50,0.55)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.1,
    textTransform: 'uppercase',
  },
  statsPill: {
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statText: {
    color: 'rgba(20,10,50,0.45)',
    fontSize: 11,
    fontWeight: '600',
  },
});
