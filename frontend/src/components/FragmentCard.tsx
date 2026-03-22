import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Fragment } from '../data/mock';
import { colors } from '../theme/colors';

type FragmentCardProps = {
  fragment: Fragment;
};

export function FragmentCard({ fragment }: FragmentCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: fragment.image }} style={styles.image} />
      <Text style={styles.meta}>
        {fragment.place} · {fragment.time}
      </Text>
      <Text style={styles.caption}>{fragment.caption}</Text>
      <View style={styles.footer}>
        <View style={styles.soundPill}>
          <Feather color={colors.accent} name="volume-2" size={14} />
          <Text style={styles.soundText}>{fragment.sound}</Text>
        </View>
        <Text style={styles.comments}>{fragment.comments} comments</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 188,
    borderRadius: 18,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  caption: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  soundText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  comments: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
});
