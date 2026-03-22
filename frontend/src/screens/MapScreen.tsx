import { useCallback, useState, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { EchoMap } from '../components/map/EchoMap';
import { FragmentSheet } from '../components/map/FragmentSheet';
import { AcebFlow } from '../components/map/AcebFlow';
import type { WesternFragment } from '../data/map/geo';
import { colors } from '../theme/colors';

const webGlass =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      } as any)
    : undefined;

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<WesternFragment | null>(null);
  const [acebOpen, setAcebOpen] = useState(false);

  const openAceb = useCallback(() => {
    setSelected(null);
    setAcebOpen(true);
  }, []);

  const sheetBottom = useMemo(
    () => Math.max(insets.bottom + 104, 132),
    [insets.bottom],
  );

  return (
    <View style={styles.container}>
      <EchoMap onFragmentSelect={setSelected} onAcebClick={openAceb} />

      {/* ── Floating HUD ─────────────────────────────────── */}
      <View
        style={[styles.hudWrap, { top: insets.top + 12 }]}
        pointerEvents="box-none"
      >
        <View style={[styles.brandPill, webGlass]} pointerEvents="auto">
          <Text style={styles.brand}>Echoes</Text>
        </View>

        <View style={styles.hudRow} pointerEvents="auto">
          <View style={[styles.statsPill, webGlass]}>
            <Feather name="map-pin" size={12} color={colors.accent} />
            <Text style={styles.statsText}>Western University</Text>
          </View>
          <Pressable style={[styles.iconBtn, webGlass]}>
            <Feather name="layers" size={14} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* ── Story tagline ────────────────────────────────── */}
      <View
        style={[styles.storyWrap, { top: insets.top + 88 }]}
        pointerEvents="none"
      >
        <Text style={styles.storyText}>
          The city begins in gray. Memory gives it color.
        </Text>
      </View>

      {/* ── Fragment preview sheet ────────────────────────── */}
      {selected ? (
        <FragmentSheet
          fragment={selected}
          onClose={() => setSelected(null)}
          bottom={sheetBottom}
        />
      ) : null}

      {/* ── ACEB interaction flow ─────────────────────────── */}
      <AcebFlow visible={acebOpen} onClose={() => setAcebOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DED5',
  },

  hudWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 10,
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,251,247,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
  },
  brand: {
    color: '#211D1A',
    fontSize: 26,
    fontFamily: 'Georgia',
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,251,247,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
  },
  statsText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,251,247,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
  },

  storyWrap: {
    position: 'absolute',
    left: 16,
    width: 200,
  },
  storyText: {
    color: 'rgba(47,42,39,0.68)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
