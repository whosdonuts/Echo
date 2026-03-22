import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { WesternFragment } from '../../data/map/geo';
import { colors } from '../../theme/colors';

export type EchoMapProps = {
  onFragmentSelect: (fragment: WesternFragment | null) => void;
};

export function EchoMap(_props: EchoMapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Feather name="map" size={40} color={colors.textMuted} />
        <Text style={styles.title}>Interactive Map</Text>
        <Text style={styles.body}>
          The full map experience runs on web.{'\n'}
          Use the command below to explore.
        </Text>
        <View style={styles.codePill}>
          <Text style={styles.code}>npx expo start --web</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  card: {
    alignItems: 'center',
    gap: 14,
    padding: 32,
    borderRadius: 28,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Georgia',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
    fontWeight: '500',
    textAlign: 'center',
  },
  codePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  code: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Courier',
  },
});
