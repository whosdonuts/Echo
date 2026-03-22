import { LinearGradient } from 'expo-linear-gradient';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SocialTone } from '../../data/socialMock';
import { colors } from '../../theme/colors';

type SocialAvatarProps = {
  name: string;
  tone: SocialTone;
  size?: number;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
};

const uiFont = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-medium',
  default: 'System',
});

const toneMap: Record<SocialTone, [string, string, string]> = {
  terracotta: ['#FFF7F1', '#F6D7CC', '#E8A48F'],
  sand: ['#FFF8EF', '#F7E2B7', '#EBC378'],
  clay: ['#FFF7F3', '#F2DBD2', '#E6B19C'],
  cream: ['#FFFBEF', '#F7E9BE', '#E9D38C'],
  neutral: ['#FFF8F2', '#EFE2D6', '#D6C4B3'],
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function SocialAvatar({
  name,
  tone,
  size = 56,
  active = false,
  style,
}: SocialAvatarProps) {
  const ringInset = Math.max(3, Math.round(size * 0.07));

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />

      <LinearGradient
        colors={toneMap[tone]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0.12, y: 0.08 }}
        style={[
          styles.avatar,
          {
            width: size - ringInset,
            height: size - ringInset,
            borderRadius: (size - ringInset) / 2,
          },
        ]}
      >
        <View style={styles.gloss} />
        <Text style={[styles.initials, { fontSize: Math.max(12, size * 0.23) }]}>
          {getInitials(name)}
        </Text>
      </LinearGradient>

      {active ? <View style={styles.activeDot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(227, 216, 205, 0.88)',
    shadowColor: 'rgba(75, 52, 39, 0.12)',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  initials: {
    color: colors.echoDarkCocoa,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  activeDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sage,
    borderWidth: 2,
    borderColor: colors.echoMainWhite,
  },
});
