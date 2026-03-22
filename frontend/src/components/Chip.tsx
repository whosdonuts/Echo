import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.activeChip]}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  activeChip: {
    backgroundColor: colors.text,
    borderColor: colors.text,
    shadowColor: colors.shadowAmbient,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: colors.textInverse,
  },
});
