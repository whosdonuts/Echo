import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { WesternFragment } from '../../data/map/geo';
import { colors } from '../../theme/colors';

export type EchoMapProps = {
  onFragmentSelect: (fragment: WesternFragment | null) => void;
  onAcebClick: () => void;
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  card: {
    alignItems: 'center',
    gap: 12,
    padding: 32,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
    textAlign: 'center',
  },
  codePill: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  code: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
  },
});
