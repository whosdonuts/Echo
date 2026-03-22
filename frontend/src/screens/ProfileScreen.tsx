import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { profile } from '../data/mock';
import { colors } from '../theme/colors';
import { shellMetrics } from '../theme/layout';

const displayFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const uiFont = Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'System' });

export function ProfileScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageEyebrow}>Account</Text>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>
            The places you keep returning to, and the traces they keep.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            </View>

            <View style={styles.identityText}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.username}>{profile.username}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Feather color={colors.echoPrimaryTerracotta} name="clock" size={13} />
                  <Text style={styles.metaChipText}>{profile.joined}</Text>
                </View>

                <View style={styles.metaChipQuiet}>
                  <View style={styles.presenceDot} />
                  <Text style={styles.metaChipQuietText}>Quietly active</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroCopy}>
            <Text style={styles.bio}>{profile.bio}</Text>
            <Text style={styles.status}>{profile.status}</Text>
          </View>

          <View style={styles.accountNoteCard}>
            <Text style={styles.accountNoteLabel}>Account note</Text>
            <Text style={styles.accountNoteText}>{profile.accountNote}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>At a glance</Text>
            <Text style={styles.sectionMeta}>Collected quietly</Text>
          </View>

          <View style={styles.statsRow}>
            {profile.stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
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
                    color={danger ? colors.echoPrimaryTerracotta : colors.echoInk}
                    name={item.icon}
                    size={16}
                  />
                </View>

                <View style={styles.settingCopy}>
                  <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>

                <Feather
                  color={danger ? colors.echoPrimaryTerracotta : colors.textMuted}
                  name="chevron-right"
                  size={18}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.echoOffWhiteBackground,
  },
  content: {
    paddingTop: shellMetrics.topPadding + 4,
    paddingHorizontal: shellMetrics.horizontalPadding,
    paddingBottom: shellMetrics.contentBottomPadding,
    gap: 22,
  },
  pageHeader: {
    gap: 6,
  },
  pageEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pageTitle: {
    color: colors.echoInk,
    fontSize: 35,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -1,
  },
  pageSubtitle: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  heroCard: {
    gap: 18,
    borderRadius: 32,
    padding: 22,
    backgroundColor: colors.echoMainWhite,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
    shadowColor: colors.echoShadowStrong,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {
    padding: 5,
    borderRadius: 28,
    backgroundColor: colors.echoPaper,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
    shadowColor: colors.echoShadowStrong,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 24,
  },
  identityText: {
    flex: 1,
    gap: 5,
  },
  name: {
    color: colors.echoInk,
    fontSize: 30,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.85,
  },
  username: {
    color: colors.textSoft,
    fontSize: 14,
    fontFamily: uiFont,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: '#F0DED2',
  },
  metaChipText: {
    color: colors.echoInk,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
  },
  metaChipQuiet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: colors.echoPaperSoft,
    borderWidth: 1,
    borderColor: colors.echoLineFaint,
  },
  metaChipQuietText: {
    color: colors.textSoft,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
  },
  presenceDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.sage,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.echoLineFaint,
  },
  heroCopy: {
    gap: 8,
  },
  bio: {
    color: colors.echoInk,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: uiFont,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  status: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  accountNoteCard: {
    gap: 6,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.echoPaper,
    borderWidth: 1,
    borderColor: colors.echoLineFaint,
  },
  accountNoteLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  accountNoteText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: uiFont,
    fontWeight: '600',
  },
  statsSection: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.echoInk,
    fontSize: 17,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 106,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 24,
    paddingHorizontal: 10,
    backgroundColor: colors.echoMainWhite,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.echoInk,
    fontSize: 31,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  settingsList: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.echoMainWhite,
    borderWidth: 1,
    borderColor: colors.echoLineSoft,
  },
  settingRowDanger: {
    backgroundColor: '#FFF8F5',
    borderColor: '#F1DDD3',
  },
  settingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoPaper,
    borderWidth: 1,
    borderColor: colors.echoLineFaint,
  },
  settingIconWrapDanger: {
    backgroundColor: '#FDEFE9',
    borderColor: '#F3D3C7',
  },
  settingCopy: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    color: colors.echoInk,
    fontSize: 15,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  settingLabelDanger: {
    color: colors.echoPrimaryTerracotta,
  },
  settingDescription: {
    color: colors.textSoft,
    fontSize: 12.5,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
  },
});
