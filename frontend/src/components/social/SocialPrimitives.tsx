import { ComponentProps, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

export type SegmentOption = {
  key: string;
  label: string;
};

type SocialSegmentedControlProps = {
  options: ReadonlyArray<SegmentOption>;
  activeKey: string;
  onChange: (nextKey: string) => void;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  compact?: boolean;
};

type SocialIconButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
};

type SocialLogoBadgeProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  accent?: boolean;
};

type SocialCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const uiFont = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-medium',
  default: 'System',
});

export function SocialSegmentedControl({
  options,
  activeKey,
  onChange,
  style,
  fullWidth = false,
  compact = false,
}: SocialSegmentedControlProps) {
  return (
    <View style={[styles.segmentedShell, style]}>
      {options.map((option) => {
        const active = option.key === activeKey;

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.segment,
              compact ? styles.segmentCompact : styles.segmentRegular,
              fullWidth && styles.segmentFullWidth,
              active && styles.segmentActive,
              pressed && !active && styles.segmentPressed,
            ]}
          >
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SocialIconButton({
  icon,
  onPress,
  accent = false,
  style,
}: SocialIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        accent && styles.iconButtonAccent,
        pressed && styles.iconButtonPressed,
        style,
      ]}
    >
      <Ionicons
        color={accent ? colors.echoMainWhite : colors.echoDarkCocoa}
        name={icon}
        size={18}
      />
    </Pressable>
  );
}

export function SocialLogoBadge({ icon, accent = true }: SocialLogoBadgeProps) {
  return (
    <View style={[styles.logoBadge, accent ? styles.logoBadgeAccent : styles.logoBadgeSoft]}>
      <View style={styles.logoBadgeInner}>
        <Ionicons
          color={accent ? colors.echoDeepTerracotta : colors.echoOliveBronze}
          name={icon}
          size={18}
        />
      </View>
    </View>
  );
}

export function SocialCard({ children, style }: SocialCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  segmentedShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 5,
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(225, 214, 203, 0.88)',
    shadowColor: 'rgba(84, 56, 41, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  segmentRegular: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  segmentCompact: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  segmentFullWidth: {
    flex: 1,
  },
  segmentActive: {
    backgroundColor: colors.echoPrimaryTerracotta,
    shadowColor: 'rgba(218, 115, 82, 0.26)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  segmentPressed: {
    backgroundColor: '#FBF3EB',
  },
  segmentLabel: {
    color: colors.echoOliveBronze,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  segmentLabelActive: {
    color: colors.echoMainWhite,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.86)',
    shadowColor: 'rgba(84, 56, 41, 0.08)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconButtonAccent: {
    backgroundColor: colors.echoPrimaryTerracotta,
    borderColor: colors.echoPrimaryTerracotta,
    shadowColor: 'rgba(218, 115, 82, 0.28)',
  },
  iconButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  logoBadge: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
  },
  logoBadgeInner: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
  },
  logoBadgeAccent: {
    backgroundColor: '#FBE8DE',
    borderColor: 'rgba(227, 172, 150, 0.36)',
  },
  logoBadgeSoft: {
    backgroundColor: '#F8F2EB',
    borderColor: 'rgba(225, 214, 203, 0.86)',
  },
  card: {
    borderRadius: 28,
    backgroundColor: '#FFFEFC',
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.9)',
    shadowColor: 'rgba(75, 52, 39, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
