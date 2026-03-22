import { Platform, StyleSheet, Text, View } from 'react-native';
import { SocialBadgeTone, SocialTone } from '../../data/socialMock';
import { colors } from '../../theme/colors';
import { SocialAvatar } from './SocialAvatar';
import { SocialCard } from './SocialPrimitives';

type SocialFriendCardProps = {
  name: string;
  tone: SocialTone;
  summary: string;
  time: string;
  badgeLabel?: string;
  badgeTone?: SocialBadgeTone;
  active?: boolean;
};

const uiFont = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-medium',
  default: 'System',
});

const badgeStyles: Record<
  SocialBadgeTone,
  { backgroundColor: string; textColor: string }
> = {
  accent: { backgroundColor: '#F8E3DA', textColor: colors.echoDeepTerracotta },
  sand: { backgroundColor: '#F8EBD4', textColor: colors.echoDarkCocoa },
  soft: { backgroundColor: '#F6E9E1', textColor: colors.echoDarkCocoa },
  neutral: { backgroundColor: '#F7F2EB', textColor: colors.echoOliveBronze },
};

export function SocialFriendCard({
  name,
  tone,
  summary,
  time,
  badgeLabel,
  badgeTone = 'neutral',
  active = false,
}: SocialFriendCardProps) {
  const badgeStyle = badgeStyles[badgeTone];

  return (
    <SocialCard style={styles.card}>
      <View style={styles.profileBlock}>
        <SocialAvatar active={active} name={name} size={54} tone={tone} />
        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text numberOfLines={2} style={styles.summary}>
            {summary}
          </Text>
          {badgeLabel ? (
            <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
              <Text style={[styles.badgeText, { color: badgeStyle.textColor }]}>
                {badgeLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </SocialCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  copy: {
    flex: 1,
    gap: 7,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summary: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
