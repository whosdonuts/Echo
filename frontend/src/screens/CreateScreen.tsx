import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createMemoryDraft, fragments } from '../data/mock';
import { colors } from '../theme/colors';

type CreateStage = 'capture' | 'compose';

const zoneLabel = createMemoryDraft.zone;
const capturedImage = fragments[2].image;

export function CreateScreen() {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<CreateStage>('capture');
  const [flashVisible, setFlashVisible] = useState(false);
  const [soundAttached, setSoundAttached] = useState(true);
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [memento, setMemento] = useState(
    createMemoryDraft.memento,
  );

  const captureControlsBottom = Math.max(insets.bottom + 118, 132);
  const composeBottomPadding = Math.max(insets.bottom + 150, 164);

  function handleCapture() {
    setFlashVisible(true);
    setPosted(false);

    setTimeout(() => {
      setFlashVisible(false);
      setStage('compose');
    }, 240);
  }

  function handleBack() {
    if (stage === 'compose') {
      setPosting(false);
      setPosted(false);
      setStage('capture');
      return;
    }

    setPosting(false);
    setPosted(false);
  }

  function handlePost() {
    setPosting(true);

    setTimeout(() => {
      setPosting(false);
      setPosted(true);
    }, 720);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      {stage === 'capture' ? (
        <CaptureStage
          captureControlsBottom={captureControlsBottom}
          flashVisible={flashVisible}
          onCapture={handleCapture}
          onToggleSound={() => setSoundAttached((value) => !value)}
          soundAttached={soundAttached}
        />
      ) : (
        <ComposeStage
          composeBottomPadding={composeBottomPadding}
          memento={memento}
          onBack={handleBack}
          onChangeMemento={setMemento}
          onPost={handlePost}
          onToggleSound={() => setSoundAttached((value) => !value)}
          posting={posting}
          posted={posted}
          soundAttached={soundAttached}
        />
      )}
    </SafeAreaView>
  );
}

function CaptureStage({
  soundAttached,
  flashVisible,
  captureControlsBottom,
  onCapture,
  onToggleSound,
}: {
  soundAttached: boolean;
  flashVisible: boolean;
  captureControlsBottom: number;
  onCapture: () => void;
  onToggleSound: () => void;
}) {
  return (
    <View style={styles.screen}>
      <ImageBackground
        resizeMode="cover"
        source={{ uri: capturedImage }}
        style={styles.preview}
      >
        <LinearGradient
          colors={['rgba(17, 15, 14, 0.68)', 'rgba(17, 15, 14, 0.10)', 'rgba(17, 15, 14, 0.78)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.echoField}>
          <View style={styles.echoRingOuter} />
          <View style={styles.echoRingInner} />
        </View>

        <View style={[styles.topOverlay, { paddingTop: 10 }]}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE PREVIEW</Text>
          </View>

          <View style={styles.zoneCard}>
            <View style={styles.zoneRow}>
              <Feather color={colors.surface} name="map-pin" size={14} />
              <Text style={styles.zoneLabel}>{zoneLabel}</Text>
            </View>
            <Text style={styles.zoneTitle}>{createMemoryDraft.liveTitle}</Text>
            <Text style={styles.zoneHint}>{createMemoryDraft.liveHint}</Text>
          </View>
        </View>

        <View style={styles.focusWrap} pointerEvents="none">
          <View style={styles.focusFrame}>
            <View style={styles.focusCornerTopLeft} />
            <View style={styles.focusCornerTopRight} />
            <View style={styles.focusCornerBottomLeft} />
            <View style={styles.focusCornerBottomRight} />
          </View>
        </View>

        {flashVisible ? <View style={styles.captureFlash} /> : null}

        <View style={[styles.bottomOverlay, { bottom: captureControlsBottom }]}>
          <Text style={styles.capturePrompt}>Leave a trace of exactly what this place feels like.</Text>

          <View style={styles.controlsRow}>
            <Pressable style={styles.sideButton}>
              <Feather color={colors.surface} name="arrow-left" size={18} />
              <Text style={styles.sideButtonText}>Back</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onCapture}
              style={styles.captureButton}
            >
              <View style={styles.captureOuter} />
              <View style={styles.captureMiddle} />
              <View style={styles.captureCore} />
            </Pressable>

            <Pressable onPress={onToggleSound} style={styles.sideButton}>
              <Feather
                color={colors.surface}
                name={soundAttached ? 'mic' : 'mic-off'}
                size={18}
              />
              <Text style={styles.sideButtonText}>
                {soundAttached ? 'Sound on' : 'Muted'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function ComposeStage({
  composeBottomPadding,
  memento,
  posting,
  posted,
  soundAttached,
  onBack,
  onChangeMemento,
  onPost,
  onToggleSound,
}: {
  composeBottomPadding: number;
  memento: string;
  posting: boolean;
  posted: boolean;
  soundAttached: boolean;
  onBack: () => void;
  onChangeMemento: (value: string) => void;
  onPost: () => void;
  onToggleSound: () => void;
}) {
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#16110F', '#1E1815', '#120E0D']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.composeAtmosphere}>
        <View style={styles.composeGlowWide} />
        <View style={styles.composeGlowTight} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.composeContent, { paddingBottom: composeBottomPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.composeHeader}>
          <Pressable onPress={onBack} style={styles.headerButton}>
            <Feather color={colors.surface} name="arrow-left" size={17} />
          </Pressable>

          <View style={styles.capturedPill}>
            <Feather color={colors.accent} name="check-circle" size={14} />
            <Text style={styles.capturedPillText}>CAPTURED</Text>
          </View>
        </View>

        <View style={styles.composeIntro}>
          <View style={styles.zoneRow}>
            <Feather color={colors.surface} name="map-pin" size={14} />
            <Text style={styles.zoneLabel}>{zoneLabel}</Text>
          </View>
          <Text style={styles.composeTitle}>Leave a trace behind this moment.</Text>
          <Text style={styles.composeHint}>
            {createMemoryDraft.liveHint}
          </Text>
        </View>

        <View style={styles.photoCard}>
          <Image source={{ uri: capturedImage }} style={styles.photoPreview} />
          <LinearGradient
            colors={['rgba(18, 14, 13, 0)', 'rgba(18, 14, 13, 0.54)', 'rgba(18, 14, 13, 0.92)']}
            locations={[0, 0.56, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.photoEchoOuter} />
          <View style={styles.photoEchoInner} />
          <View style={styles.photoMeta}>
            <Text style={styles.photoMetaEyebrow}>CAPTURED JUST NOW</Text>
            <Text style={styles.photoMetaBody}>{createMemoryDraft.photoNote}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPillWarm}>
            <Feather color={colors.accent} name="map-pin" size={13} />
            <Text style={styles.metaPillText}>{createMemoryDraft.location}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{createMemoryDraft.timestamp}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{zoneLabel.split(' / ')[1]}</Text>
          </View>
        </View>

        <View style={styles.mementoCard}>
          <Text style={styles.sectionEyebrow}>LEAVE A MEMENTO</Text>
          <TextInput
            multiline
            onChangeText={onChangeMemento}
            placeholder="Leave a memento"
            placeholderTextColor="rgba(255, 253, 252, 0.34)"
            selectionColor={colors.accent}
            style={styles.mementoInput}
            value={memento}
          />
        </View>

        <Pressable onPress={onToggleSound} style={styles.soundCard}>
          <View style={styles.soundIconWrap}>
            <Feather color={soundAttached ? colors.accent : colors.surface} name={soundAttached ? 'volume-2' : 'mic'} size={18} />
          </View>
          <View style={styles.soundTextWrap}>
            <Text style={styles.soundTitle}>Optional sound</Text>
            <Text style={styles.soundBody}>
              {soundAttached
                ? createMemoryDraft.soundHint
                : 'Add a short sound trace if this place needs one.'}
            </Text>
          </View>
          <View style={[styles.soundStatusPill, soundAttached && styles.soundStatusPillActive]}>
            <Text style={[styles.soundStatusText, soundAttached && styles.soundStatusTextActive]}>
              {soundAttached ? createMemoryDraft.soundTag : 'Add'}
            </Text>
          </View>
        </Pressable>

        <Pressable disabled={posting} onPress={onPost} style={[styles.postButton, posting && styles.postButtonBusy]}>
          {posting ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <Feather color={colors.surface} name="send" size={16} />
          )}
          <Text style={styles.postButtonText}>{posting ? 'Leaving fragment...' : 'Leave fragment here'}</Text>
        </Pressable>

        <Text style={styles.postHint}>
          Posting reveals this nearby zone on the map and leaves the fragment for passersby.
        </Text>
      </ScrollView>

      {posted ? (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successEchoOuter}>
              <View style={styles.successEchoInner}>
                <Feather color={colors.accent} name="map-pin" size={18} />
              </View>
            </View>
            <Text style={styles.successTitle}>Fragment left behind.</Text>
            <Text style={styles.successBody}>
              {createMemoryDraft.successNote}
            </Text>
            <Pressable onPress={onBack} style={styles.successButton}>
              <Text style={styles.successButtonText}>Back to camera</Text>
            </Pressable>
            <Text style={styles.successFootnote}>Prototype success state. Map reveal is mocked in this pass.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#110F0E',
  },
  screen: {
    flex: 1,
    backgroundColor: '#110F0E',
  },
  preview: {
    flex: 1,
    backgroundColor: '#241F1C',
  },
  echoField: {
    position: 'absolute',
    top: '28%',
    alignSelf: 'center',
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 253, 252, 0.02)',
  },
  echoRingOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
  },
  echoRingInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 92, 0.34)',
    backgroundColor: 'rgba(217, 111, 92, 0.05)',
  },
  topOverlay: {
    paddingHorizontal: 20,
    gap: 14,
  },
  livePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 253, 252, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.12)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  liveText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  zoneCard: {
    width: '78%',
    gap: 8,
  },
  zoneRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(255, 253, 252, 0.10)',
  },
  zoneLabel: {
    color: 'rgba(255, 253, 252, 0.90)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  zoneTitle: {
    color: colors.surface,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  zoneHint: {
    color: 'rgba(255, 253, 252, 0.76)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  focusWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusFrame: {
    width: 170,
    height: 230,
  },
  focusCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 253, 252, 0.68)',
    borderTopLeftRadius: 14,
  },
  focusCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 253, 252, 0.68)',
    borderTopRightRadius: 14,
  },
  focusCornerBottomLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 253, 252, 0.68)',
    borderBottomLeftRadius: 14,
  },
  focusCornerBottomRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 253, 252, 0.68)',
    borderBottomRightRadius: 14,
  },
  captureFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bottomOverlay: {
    position: 'absolute',
    right: 0,
    left: 0,
    paddingHorizontal: 20,
    gap: 18,
  },
  capturePrompt: {
    alignSelf: 'center',
    maxWidth: 280,
    color: 'rgba(255, 253, 252, 0.80)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    width: 76,
    alignItems: 'center',
    gap: 8,
  },
  sideButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  captureButton: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.24)',
    backgroundColor: 'rgba(255, 253, 252, 0.04)',
  },
  captureMiddle: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.40)',
    backgroundColor: 'rgba(255, 253, 252, 0.12)',
  },
  captureCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  composeAtmosphere: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  composeGlowWide: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(217, 111, 92, 0.08)',
  },
  composeGlowTight: {
    position: 'absolute',
    top: 210,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(168, 195, 216, 0.06)',
  },
  composeContent: {
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 18,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 253, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
  },
  capturedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 253, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
  },
  capturedPillText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  composeIntro: {
    gap: 10,
  },
  composeTitle: {
    color: colors.surface,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  composeHint: {
    color: 'rgba(255, 253, 252, 0.72)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  photoCard: {
    height: 308,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.12)',
    backgroundColor: '#221C19',
    justifyContent: 'flex-end',
  },
  photoPreview: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  photoEchoOuter: {
    position: 'absolute',
    top: 44,
    alignSelf: 'center',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.16)',
    backgroundColor: 'rgba(255, 253, 252, 0.04)',
  },
  photoEchoInner: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 92, 0.44)',
    backgroundColor: 'rgba(217, 111, 92, 0.08)',
  },
  photoMeta: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 6,
  },
  photoMetaEyebrow: {
    color: 'rgba(255, 253, 252, 0.72)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  photoMetaBody: {
    color: colors.surface,
    fontSize: 15,
    lineHeight: 21,
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
    paddingVertical: 9,
    backgroundColor: '#2D221D',
    borderWidth: 1,
    borderColor: '#4A342C',
  },
  metaPill: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: 'rgba(255, 253, 252, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
  },
  metaPillText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  mementoCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: 'rgba(255, 253, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
    gap: 12,
  },
  sectionEyebrow: {
    color: 'rgba(255, 253, 252, 0.58)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mementoInput: {
    minHeight: 132,
    color: colors.surface,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
    textAlignVertical: 'top',
    padding: 0,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 253, 252, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
  },
  soundIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 253, 252, 0.08)',
  },
  soundTextWrap: {
    flex: 1,
    gap: 4,
  },
  soundTitle: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  soundBody: {
    color: 'rgba(255, 253, 252, 0.62)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  soundStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 253, 252, 0.08)',
  },
  soundStatusPillActive: {
    backgroundColor: '#34251F',
  },
  soundStatusText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  soundStatusTextActive: {
    color: '#F1D4CB',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 22,
    paddingVertical: 17,
    backgroundColor: colors.accent,
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  postButtonBusy: {
    opacity: 0.88,
  },
  postButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  postHint: {
    color: 'rgba(255, 253, 252, 0.60)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(8, 7, 7, 0.62)',
  },
  successCard: {
    width: '100%',
    borderRadius: 30,
    padding: 24,
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#201816',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.10)',
  },
  successEchoOuter: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 252, 0.12)',
    backgroundColor: 'rgba(255, 253, 252, 0.04)',
  },
  successEchoInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217, 111, 92, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 92, 0.48)',
  },
  successTitle: {
    color: colors.surface,
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  successBody: {
    color: 'rgba(255, 253, 252, 0.74)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
  },
  successButton: {
    marginTop: 4,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: colors.accent,
  },
  successButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  successFootnote: {
    color: 'rgba(255, 253, 252, 0.46)',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
});
