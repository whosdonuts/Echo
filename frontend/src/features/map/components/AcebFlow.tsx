import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getTagColor } from '../geo';

type FlowStep = 'menu' | 'capture' | 'caption' | 'submitting' | 'unlocked';
type CameraMode = 'photo' | 'video';

type AcebFlowProps = {
  visible: boolean;
  onClose: () => void;
};

export function AcebFlow({ visible, onClose }: AcebFlowProps) {
  const [step, setStep] = useState<FlowStep>('menu');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [points, setPoints] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('photo');
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const tagColor = useMemo(() => getTagColor('Featured'), []);

  const clearTimers = useCallback(() => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (submitTimerRef.current) {
      clearInterval(submitTimerRef.current);
      submitTimerRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    setStep('menu');
    setCapturedImage(null);
    setCaption('');
    setPoints(0);
    setCameraReady(false);
    setCameraMode('photo');
    setRecording(false);
  }, [clearTimers]);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [resetState, visible]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85, shutterSound: false });
      if (!photo?.uri) {
        return;
      }
      setCapturedImage(photo.uri);
      setStep('caption');
    } catch {
      setCameraReady(false);
    }
  }, []);

  const handleVideoCapture = useCallback(() => {
    if (recording) {
      return;
    }

    clearTimers();
    setRecording(true);
    recordingTimerRef.current = setTimeout(() => {
      setRecording(false);
      setCapturedImage(null);
      setStep('caption');
      recordingTimerRef.current = null;
    }, 3000);
  }, [clearTimers, recording]);

  const handleShutter = useCallback(() => {
    if (cameraMode === 'photo') {
      void handleTakePhoto();
      return;
    }
    handleVideoCapture();
  }, [cameraMode, handleTakePhoto, handleVideoCapture]);

  const handleSubmit = useCallback(() => {
    clearTimers();
    setStep('submitting');
    setPoints(0);

    submitTimerRef.current = setInterval(() => {
      setPoints((current) => {
        const next = current + 3;
        if (next >= 30) {
          if (submitTimerRef.current) {
            clearInterval(submitTimerRef.current);
            submitTimerRef.current = null;
          }
          setTimeout(() => setStep('unlocked'), 300);
          return 30;
        }
        return next;
      });
    }, 40);
  }, [clearTimers]);

  const closeAndReset = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={closeAndReset} presentationStyle="overFullScreen" transparent visible>
      {step === 'menu' ? (
        <MenuScreen onCapture={() => setStep('capture')} onClose={closeAndReset} tagColor={tagColor} />
      ) : null}
      {step === 'capture' ? (
        <CaptureScreen
          cameraMode={cameraMode}
          cameraReady={cameraReady}
          cameraRef={cameraRef}
          hasPermission={permission?.granted ?? false}
          isPermissionKnown={permission !== null}
          onBack={() => setStep('menu')}
          onCameraReady={() => setCameraReady(true)}
          onModeToggle={() => setCameraMode((current) => (current === 'photo' ? 'video' : 'photo'))}
          onRequestPermission={handleRequestPermission}
          onShutter={handleShutter}
          recording={recording}
        />
      ) : null}
      {step === 'caption' ? (
        <CaptionScreen
          caption={caption}
          image={capturedImage}
          isVideo={cameraMode === 'video' && capturedImage === null}
          onBack={() => {
            setCapturedImage(null);
            setStep('capture');
          }}
          onSubmit={handleSubmit}
          setCaption={setCaption}
        />
      ) : null}
      {step === 'submitting' ? <SubmittingScreen points={points} /> : null}
      {step === 'unlocked' ? (
        <UnlockedScreen
          caption={caption}
          image={capturedImage}
          isVideo={cameraMode === 'video' && capturedImage === null}
          onClose={closeAndReset}
          tagColor={tagColor}
        />
      ) : null}
    </Modal>
  );
}

function MenuScreen({
  tagColor,
  onCapture,
  onClose,
}: {
  tagColor: { core: string; badge: string };
  onCapture: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.overlay}>
      <View style={styles.bottomSheet}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Mostly engineers, mostly all-nighters</Text>
            <Text style={styles.subtitle}>Amit Chakma Engineering Building</Text>
            <View style={[styles.tag, { backgroundColor: tagColor.badge, borderColor: `${tagColor.core}30` }]}>
              <Text style={[styles.tagText, { color: tagColor.core }]}>Featured</Text>
            </View>
          </View>
          <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
            <Feather color="rgba(20,10,50,0.35)" name="x" size={18} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Recent Memento</Text>
        <View style={styles.previewRow}>
          <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.previewThumb}>
            <Feather color="rgba(20,10,50,0.52)" name="zap" size={22} />
          </LinearGradient>
          <View style={styles.previewTextWrap}>
            <Text numberOfLines={1} style={styles.previewTitle}>
              First week energy in the atrium
            </Text>
            <Text style={styles.previewMeta}>@westerneng - 2 days ago</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionGap]}>More Mementos</Text>
        <View style={styles.lockedList}>
          {[
            'Lab night with the whole crew',
            'View from the 3rd floor bridge',
            'That one vending machine moment',
          ].map((label) => (
            <View key={label} style={styles.lockedRow}>
              <View style={styles.lockedThumb} />
              <View style={styles.lockedBody}>
                <Text numberOfLines={1} style={styles.lockedTitle}>
                  {label}
                </Text>
                <Text style={styles.lockedSubtitle}>Leave a memento to unlock</Text>
              </View>
              <Feather color="rgba(20,10,50,0.18)" name="lock" size={14} />
            </View>
          ))}
        </View>

        <Text style={styles.centerHint}>Leave a memento to unlock the rest</Text>

        <Pressable onPress={onCapture} style={styles.ctaButton}>
          <LinearGradient colors={['#d97706', '#f59e0b']} style={styles.ctaFill}>
            <Text style={styles.ctaText}>Leave a Memento</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.centerHint}>+30 points on unlock</Text>
      </View>
    </View>
  );
}

function CaptureScreen({
  cameraRef,
  cameraReady,
  cameraMode,
  hasPermission,
  isPermissionKnown,
  onBack,
  onCameraReady,
  onModeToggle,
  onRequestPermission,
  onShutter,
  recording,
}: {
  cameraRef: RefObject<CameraView | null>;
  cameraReady: boolean;
  cameraMode: CameraMode;
  hasPermission: boolean;
  isPermissionKnown: boolean;
  onBack: () => void;
  onCameraReady: () => void;
  onModeToggle: () => void;
  onRequestPermission: () => void;
  onShutter: () => void;
  recording: boolean;
}) {
  return (
    <View style={styles.darkOverlay}>
      <View style={styles.captureShell}>
        <View style={styles.captureViewport}>
          {hasPermission ? (
            <CameraView
              ref={cameraRef}
              animateShutter={false}
              facing="back"
              mode="picture"
              onCameraReady={onCameraReady}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={styles.cameraFallback}>
              <View style={styles.cameraIconCircle}>
                <Feather color="rgba(255,255,255,0.4)" name="camera" size={24} />
              </View>
              <Text style={styles.cameraFallbackTitle}>
                {isPermissionKnown ? 'Camera access needed' : 'Camera loading...'}
              </Text>
              <Text style={styles.cameraFallbackBody}>
                Allow camera access to capture your memento.
              </Text>
              <Pressable onPress={onRequestPermission} style={styles.permissionButton}>
                <Text style={styles.permissionButtonText}>Allow camera</Text>
              </Pressable>
            </View>
          )}

          {hasPermission && !cameraReady ? (
            <View style={styles.cameraLoadingOverlay}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.cameraFallbackTitle}>Camera loading...</Text>
            </View>
          ) : null}

          {recording ? (
            <View style={styles.recordingPill}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.captureControls}>
          <Pressable onPress={onBack} style={styles.circleIconButton}>
            <Feather color="rgba(255,255,255,0.78)" name="arrow-left" size={20} />
          </Pressable>

          <Pressable onPress={onShutter} style={[styles.shutterOuter, recording && styles.shutterOuterRecording]}>
            <View style={[styles.shutterInner, recording && styles.shutterInnerRecording]} />
          </Pressable>

          <Pressable onPress={onModeToggle} style={styles.modeToggle}>
            <Text style={[styles.modeLabel, cameraMode === 'photo' && styles.modeLabelActive]}>Photo</Text>
            <Text style={[styles.modeLabel, cameraMode === 'video' && styles.modeLabelActive]}>Video</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CaptionScreen({
  image,
  caption,
  isVideo,
  onBack,
  onSubmit,
  setCaption,
}: {
  image: string | null;
  caption: string;
  isVideo: boolean;
  onBack: () => void;
  onSubmit: () => void;
  setCaption: (value: string) => void;
}) {
  const maxLen = 120;

  return (
    <View style={styles.darkOverlay}>
      <View style={styles.captionShell}>
        <View style={styles.captionPreview}>
          {image ? (
            <Image source={{ uri: image }} style={styles.captionImage} />
          ) : (
            <LinearGradient colors={['#1e1b4b', '#312e81']} style={StyleSheet.absoluteFill}>
              {isVideo ? (
                <View style={styles.videoBadge}>
                  <Feather color="#FFFFFF" name="video" size={16} />
                  <Text style={styles.videoBadgeText}>Video Preview</Text>
                </View>
              ) : null}
            </LinearGradient>
          )}
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)']} style={StyleSheet.absoluteFill} />
          {caption ? (
            <View style={styles.captionFloating}>
              <Text style={styles.captionFloatingText}>{caption}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.captionBar}>
          <Pressable onPress={onBack} style={styles.circleIconButton}>
            <Feather color="rgba(255,255,255,0.78)" name="arrow-left" size={18} />
          </Pressable>
          <View style={styles.captionInputWrap}>
            <TextInput
              autoFocus
              maxLength={maxLen}
              onChangeText={(value) => setCaption(value.slice(0, maxLen))}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.captionInput}
              value={caption}
            />
            <Text style={styles.captionCount}>
              {caption.length}/{maxLen}
            </Text>
          </View>
          <Pressable disabled={caption.length === 0} onPress={onSubmit} style={[styles.sendButton, caption.length === 0 && styles.sendButtonDisabled]}>
            <LinearGradient colors={['#d97706', '#f59e0b']} style={styles.sendButtonFill}>
              <Feather color="#FFFFFF" name="send" size={16} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SubmittingScreen({ points }: { points: number }) {
  return (
    <View style={styles.darkOverlay}>
      <View style={styles.submittingWrap}>
        <ActivityIndicator color="#f59e0b" size="large" />
        <Text style={styles.submittingTitle}>Submitting memento...</Text>
        <View style={styles.pointsPill}>
          <Text style={styles.pointsText}>+{points} pts</Text>
        </View>
      </View>
    </View>
  );
}

function UnlockedScreen({
  caption,
  image,
  isVideo,
  onClose,
  tagColor,
}: {
  caption: string;
  image: string | null;
  isVideo: boolean;
  onClose: () => void;
  tagColor: { core: string; badge: string };
}) {
  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.bottomSheetContent} style={styles.bottomSheet}>
        <View style={styles.successHeader}>
          <View style={styles.successBadge}>
            <Feather color="#FFFFFF" name="check" size={26} />
          </View>
          <Text style={styles.title}>Fragment Collected</Text>
          <Text style={styles.subtitle}>Amit Chakma Engineering Building</Text>
          <View style={styles.successPoints}>
            <Text style={styles.successPointsText}>+30 points</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Your Memento</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewThumb}>
            {image ? (
              <Image source={{ uri: image }} style={StyleSheet.absoluteFill} />
            ) : (
              <LinearGradient colors={['#ddd6fe', '#c4b5fd']} style={StyleSheet.absoluteFill}>
                {isVideo ? (
                  <View style={styles.videoBadgeCompact}>
                    <Feather color="#FFFFFF" name="video" size={14} />
                  </View>
                ) : null}
              </LinearGradient>
            )}
          </View>
          <View style={styles.previewTextWrap}>
            <Text numberOfLines={2} style={styles.previewTitle}>
              {caption || 'Your memento'}
            </Text>
            <Text style={styles.previewMeta}>Just now</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionGap]}>Unlocked Mementos</Text>
        <View style={styles.lockedList}>
          {[
            { text: 'First week energy in the atrium', by: '@westerneng', time: '2 days ago' },
            { text: 'Lab night with the whole crew', by: '@jchen22', time: '5 days ago' },
            { text: 'View from the 3rd floor bridge', by: '@smurad', time: '1 week ago' },
            { text: 'That one vending machine moment', by: '@tpark', time: '2 weeks ago' },
          ].map((item, index) => (
            <View key={item.text} style={styles.unlockedRow}>
              <LinearGradient
                colors={[
                  `hsl(${220 + index * 30}, 60%, 85%)`,
                  `hsl(${240 + index * 30}, 50%, 75%)`,
                ]}
                style={styles.unlockedThumb}
              />
              <View style={styles.lockedBody}>
                <Text numberOfLines={1} style={styles.lockedTitle}>
                  {item.text}
                </Text>
                <Text style={styles.lockedSubtitle}>{`${item.by} - ${item.time}`}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.collectedTags}>
          {['Collected', 'Featured'].map((label) => (
            <View key={label} style={[styles.tag, { backgroundColor: tagColor.badge, borderColor: `${tagColor.core}30` }]}>
              <Text style={[styles.tagText, { color: tagColor.core }]}>{label}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={onClose} style={styles.doneButton}>
          <LinearGradient colors={['#059669', '#10b981']} style={styles.ctaFill}>
            <Text style={styles.ctaText}>Back to Map</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12,10,30,0.45)',
    justifyContent: 'flex-end',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  bottomSheet: {
    maxHeight: '88%',
    backgroundColor: 'rgba(255,253,250,0.97)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: 'rgba(20,10,50,0.92)',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(20,10,50,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,10,50,0.04)',
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    color: 'rgba(20,10,50,0.3)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionGap: {
    marginTop: 22,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(20,10,50,0.025)',
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.05)',
  },
  previewThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,10,50,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTextWrap: {
    flex: 1,
    gap: 4,
  },
  previewTitle: {
    color: 'rgba(20,10,50,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  previewMeta: {
    color: 'rgba(20,10,50,0.3)',
    fontSize: 10,
    fontWeight: '500',
  },
  lockedList: {
    gap: 8,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(20,10,50,0.018)',
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.04)',
    opacity: 0.65,
  },
  lockedThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(20,10,50,0.06)',
  },
  lockedBody: {
    flex: 1,
    gap: 4,
  },
  lockedTitle: {
    color: 'rgba(20,10,50,0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  lockedSubtitle: {
    color: 'rgba(20,10,50,0.3)',
    fontSize: 10,
    fontWeight: '500',
  },
  centerHint: {
    marginTop: 12,
    color: 'rgba(20,10,50,0.28)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
  },
  doneButton: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaFill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  captureShell: {
    flex: 1,
  },
  captureViewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  cameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  cameraIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cameraFallbackTitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '600',
  },
  cameraFallbackBody: {
    maxWidth: 220,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  recordingPill: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(220,38,38,0.8)',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 36,
  },
  circleIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRecording: {
    borderColor: '#ef4444',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  shutterInnerRecording: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  modeLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modeLabelActive: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captionShell: {
    flex: 1,
  },
  captionPreview: {
    flex: 1,
    position: 'relative',
  },
  captionImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: '46%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  captionFloating: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    maxWidth: 280,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  captionFloatingText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  captionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captionInputWrap: {
    flex: 1,
    position: 'relative',
  },
  captionInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    fontSize: 13,
    paddingLeft: 14,
    paddingRight: 52,
    paddingVertical: 10,
  },
  captionCount: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontWeight: '500',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendButtonFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submittingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  submittingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pointsText: {
    color: '#f59e0b',
    fontSize: 15,
    fontWeight: '700',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    marginBottom: 12,
  },
  successPoints: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(5,150,105,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  successPointsText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  unlockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(20,10,50,0.018)',
    borderWidth: 1,
    borderColor: 'rgba(20,10,50,0.04)',
  },
  unlockedThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  collectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  videoBadgeCompact: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
});
