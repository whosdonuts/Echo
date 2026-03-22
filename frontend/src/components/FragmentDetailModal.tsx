import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { FragmentDetail } from '../data/mock';
import { colors } from '../theme/colors';

type FragmentDetailModalProps = {
  detail: FragmentDetail | null;
  onClose: () => void;
};

export function FragmentDetailModal({
  detail,
  onClose,
}: FragmentDetailModalProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={detail !== null}
    >
      {detail ? (
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient
            colors={[colors.backgroundWarm, colors.background]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <Pressable onPress={onClose} style={styles.iconButton}>
                <Feather color={colors.text} name="x" size={18} />
              </Pressable>
              <Text style={styles.topLabel}>FRAGMENT DETAIL</Text>
              <Pressable style={styles.iconButton}>
                <Feather color={colors.text} name="bookmark" size={17} />
              </Pressable>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.mediaWrap}>
                <View
                  style={[
                    styles.ringLarge,
                    {
                      borderColor: `${detail.tint}55`,
                      backgroundColor: `${detail.tint}14`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.ringSmall,
                    {
                      borderColor: `${detail.tint}88`,
                      backgroundColor: `${detail.tint}10`,
                    },
                  ]}
                />
                <Image
                  source={{ uri: detail.image }}
                  style={detail.shape === 'orb' ? styles.orbImage : styles.capsuleImage}
                />
              </View>

              <View style={styles.metaBlock}>
                <Text style={styles.eyebrow}>{detail.location.toUpperCase()}</Text>
                <Text style={styles.title}>{detail.title}</Text>
                <Text style={styles.caption}>{detail.caption}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPillWarm}>
                  <Feather color={colors.accent} name="volume-2" size={14} />
                  <Text style={styles.metaPillText}>{detail.sound}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Feather color={colors.textSoft} name="map-pin" size={13} />
                  <Text style={styles.metaPillText}>{detail.location}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Feather color={colors.textSoft} name="clock" size={13} />
                  <Text style={styles.metaPillText}>{detail.timestamp}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Feather color={colors.textSoft} name="user" size={13} />
                  <Text style={styles.metaPillText}>{detail.author}</Text>
                </View>
              </View>
            </View>

            <View style={styles.soundPlayer}>
              <View style={styles.soundPlayerLeft}>
                <Pressable style={styles.soundPlayButton}>
                  <Feather color={colors.surface} name="play" size={14} />
                </Pressable>
                <View style={styles.soundTextWrap}>
                  <Text style={styles.soundLabel}>Optional sound</Text>
                  <Text style={styles.soundTrack}>{detail.sound}</Text>
                </View>
              </View>
              <View style={styles.waveform}>
                <View style={[styles.waveBar, { height: 12 }]} />
                <View style={[styles.waveBar, { height: 20 }]} />
                <View style={[styles.waveBar, { height: 16 }]} />
                <View style={[styles.waveBar, { height: 26 }]} />
                <View style={[styles.waveBar, { height: 18 }]} />
                <View style={[styles.waveBar, { height: 10 }]} />
              </View>
            </View>

            <View style={styles.actionsGrid}>
              <Pressable style={[styles.actionCard, styles.actionCardPrimary]}>
                <Feather color={colors.surface} name="bookmark" size={16} />
                <Text style={styles.actionPrimaryText}>Save to atlas</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <Feather color={colors.text} name="message-circle" size={16} />
                <Text style={styles.actionText}>Comment</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <Feather color={colors.text} name="map" size={16} />
                <Text style={styles.actionText}>View on map</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <Feather color={colors.text} name="repeat" size={16} />
                <Text style={styles.actionText}>Hold for trade</Text>
              </Pressable>
            </View>

            <View style={styles.commentsCard}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <Text style={styles.commentsHint}>
                Quiet responses only. No scores, no pressure.
              </Text>

              <View style={styles.commentComposer}>
                <Text style={styles.commentComposerText}>Leave a small reply...</Text>
                <Feather color={colors.textSoft} name="arrow-up-right" size={15} />
              </View>

              <View style={styles.commentList}>
                {detail.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  topLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    padding: 18,
    gap: 16,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 0.08,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  mediaWrap: {
    height: 308,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.surfaceSoft,
  },
  ringLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
  },
  ringSmall: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1,
  },
  orbImage: {
    width: 184,
    height: 184,
    borderRadius: 92,
  },
  capsuleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  metaBlock: {
    gap: 8,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.0,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontFamily: 'Georgia',
    fontWeight: '700',
    lineHeight: 35,
  },
  caption: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPillWarm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceMuted,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  soundPlayer: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    padding: 16,
    gap: 14,
  },
  soundPlayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundPlayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  soundTextWrap: {
    flex: 1,
    gap: 3,
  },
  soundLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  soundTrack: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  waveBar: {
    width: 6,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '47.8%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionCardPrimary: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  actionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  actionPrimaryText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '800',
  },
  commentsCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    padding: 18,
    gap: 14,
  },
  commentsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  commentsHint: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  commentComposer: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundWarm,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentComposerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  commentList: {
    gap: 12,
  },
  commentItem: {
    borderRadius: 18,
    backgroundColor: colors.backgroundWarm,
    padding: 14,
    gap: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  commentTime: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  commentText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
