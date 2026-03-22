import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { WesternFragment } from '../../data/map/geo';
import { getTagColor, isUnlockedTag, isLockedTag } from '../../data/map/geo';
import { colors } from '../../theme/colors';

type Props = {
  fragment: WesternFragment;
  onClose: () => void;
  bottom: number;
};

export function FragmentSheet({ fragment, onClose, bottom }: Props) {
  const tc = getTagColor(fragment.tag);
  const unlocked = isUnlockedTag(fragment.tag);
  const locked = isLockedTag(fragment.tag);

  return (
    <View style={[styles.sheet, { bottom }]} pointerEvents="auto">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            {locked ? 'LOCKED FRAGMENT' : 'FRAGMENT PREVIEW'}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {locked ? '???' : fragment.title}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Feather name="x" size={14} color={colors.textSoft} />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        {fragment.subtitle}
      </Text>

      <View style={styles.tagRow}>
        <View style={[styles.tagPill, { backgroundColor: tc.badge }]}>
          <View style={[styles.tagDot, { backgroundColor: tc.core }]} />
          <Text style={[styles.tagLabel, { color: tc.core }]}>
            {unlocked ? '✓ ' : ''}{fragment.tag}
          </Text>
        </View>
      </View>

      {locked ? (
        <Text style={styles.hint}>
          Get closer or leave a fragment nearby to unlock this memory.
        </Text>
      ) : (
        <Text style={styles.hint}>
          Tap to explore this fragment's memories and mementos.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 26,
    padding: 18,
    backgroundColor: 'rgba(255, 251, 247, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.68)',
    gap: 10,
    shadowColor: 'rgba(61,45,35,0.16)',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'Georgia',
    lineHeight: 25,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,253,252,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
});
