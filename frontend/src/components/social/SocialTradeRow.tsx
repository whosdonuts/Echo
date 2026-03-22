import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SocialTone } from '../../data/socialMock';
import { colors } from '../../theme/colors';
import { SocialAvatar } from './SocialAvatar';
import { SocialCard } from './SocialPrimitives';

type SocialTradeRowProps = {
  name: string;
  tone: SocialTone;
  info: string;
  emphasized?: boolean;
  onPress?: () => void;
};

const uiFont = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-medium',
  default: 'System',
});

export function SocialTradeRow({
  name,
  tone,
  info,
  emphasized = false,
  onPress,
}: SocialTradeRowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <SocialCard style={[styles.card, pressed && styles.cardPressed]}>
          <View style={styles.profileBlock}>
            <SocialAvatar name={name} size={56} tone={tone} />
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Text style={styles.name}>{name}</Text>
                <View style={[styles.statusPill, emphasized && styles.statusPillAccent]}>
                  <Text
                    style={[
                      styles.statusPillText,
                      emphasized && styles.statusPillTextAccent,
                    ]}
                  >
                    {emphasized ? 'Priority' : 'Open'}
                  </Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.info}>
                {info}
              </Text>
            </View>
          </View>

          <View style={[styles.button, emphasized ? styles.buttonPrimary : styles.buttonSoft]}>
            <Text style={[styles.buttonLabel, emphasized && styles.buttonLabelPrimary]}>
              Trade
            </Text>
          </View>
        </SocialCard>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
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
  titleRow: {
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
  info: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F7F2EB',
  },
  statusPillAccent: {
    backgroundColor: '#F8E3DA',
  },
  statusPillText: {
    color: colors.echoOliveBronze,
    fontSize: 10,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statusPillTextAccent: {
    color: colors.echoDeepTerracotta,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.echoPrimaryTerracotta,
  },
  buttonSoft: {
    backgroundColor: '#F6F0E8',
  },
  buttonLabel: {
    color: colors.echoOliveBronze,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonLabelPrimary: {
    color: colors.echoMainWhite,
  },
});
