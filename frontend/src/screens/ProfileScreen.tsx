import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { profile } from '../data/mock';
import { colors } from '../theme/colors';

export function ProfileScreen() {
  return (
    <ScreenScaffold
      title="Profile"
      subtitle="The places you keep returning to, and the traces they keep."
    >
      <View style={styles.identityCard}>
        <View style={styles.identityGlowLarge} />
        <View style={styles.identityGlowSmall} />

        <View style={styles.identityTop}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />

          <View style={styles.identityText}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.username}>{profile.username}</Text>

            <View style={styles.joinedPill}>
              <Feather color={colors.accent} name="clock" size={13} />
              <Text style={styles.joinedText}>{profile.joined}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.bio}>{profile.bio}</Text>
        <Text style={styles.status}>{profile.status}</Text>
        <View style={styles.accountNotePill}>
          <Feather color={colors.accent} name="moon" size={13} />
          <Text style={styles.accountNoteText}>{profile.accountNote}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {profile.stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.sectionMeta}>Prototype settings only</Text>
      </View>

      <View style={styles.settingsList}>
        {profile.settings.map((item) => {
          const danger = item.tone === 'danger';

          return (
            <Pressable key={item.id} style={[styles.settingRow, danger && styles.settingRowDanger]}>
              <View style={[styles.settingIconWrap, danger && styles.settingIconWrapDanger]}>
                <Feather
                  color={danger ? colors.accent : colors.text}
                  name={item.icon}
                  size={16}
                />
              </View>

              <View style={styles.settingCopy}>
                <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
                  {item.label}
                </Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>

              <Feather
                color={danger ? colors.accent : colors.textMuted}
                name="chevron-right"
                size={18}
              />
            </Pressable>
          );
        })}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    overflow: 'hidden',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    padding: 18,
    gap: 12,
  },
  identityGlowLarge: {
    position: 'absolute',
    top: -38,
    right: -26,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: 'rgba(217, 111, 92, 0.09)',
  },
  identityGlowSmall: {
    position: 'absolute',
    bottom: -44,
    left: -12,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(168, 195, 216, 0.08)',
  },
  identityTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 29,
    fontFamily: 'Georgia',
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  username: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  joinedPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FFF6F2',
    borderWidth: 1,
    borderColor: '#F2D7CF',
  },
  joinedText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  bio: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  status: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  accountNotePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  accountNoteText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  settingsList: {
    gap: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    padding: 14,
  },
  settingRowDanger: {
    backgroundColor: '#FFF7F4',
    borderColor: '#F1D5CB',
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  settingIconWrapDanger: {
    backgroundColor: '#FCE8E2',
  },
  settingCopy: {
    flex: 1,
    gap: 3,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  settingLabelDanger: {
    color: colors.accent,
  },
  settingDescription: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
