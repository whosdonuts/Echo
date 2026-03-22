import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getTagColor } from '../../data/map/geo';
import { colors } from '../../theme/colors';

type FlowStep = 'menu' | 'capture' | 'caption' | 'submitting' | 'unlocked';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const { width: W, height: H } = Dimensions.get('window');

export function AcebFlow({ visible, onClose }: Props) {
  const [step, setStep] = useState<FlowStep>('menu');
  const [caption, setCaption] = useState('');
  const [points, setPoints] = useState(0);
  const [captured, setCaptured] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('menu');
      setCaption('');
      setPoints(0);
      setCaptured(false);
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    setStep('submitting');
    let p = 0;
    const iv = setInterval(() => {
      p += 3;
      if (p >= 30) { clearInterval(iv); setPoints(30); setTimeout(() => setStep('unlocked'), 300); }
      else setPoints(p);
    }, 40);
  }, []);

  const handleCapture = useCallback(() => {
    setCaptured(true);
    setStep('caption');
  }, []);

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());
  }, [onClose]);

  const tc = getTagColor('Featured');

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [H * 0.3, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={handleClose}>
        <Pressable onPress={() => {}} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[s.panel, { transform: [{ translateY }], opacity: slideAnim }]}>
            {step === 'menu' && (
              <MenuStep tagColor={tc} onCapture={() => setStep('capture')} onClose={handleClose} />
            )}
            {step === 'capture' && (
              <CaptureStep onCapture={handleCapture} onBack={() => setStep('menu')} />
            )}
            {step === 'caption' && (
              <CaptionStep
                caption={caption}
                setCaption={setCaption}
                onSubmit={handleSubmit}
                onBack={() => { setCaptured(false); setStep('capture'); }}
              />
            )}
            {step === 'submitting' && <SubmittingStep points={points} />}
            {step === 'unlocked' && (
              <UnlockedStep tagColor={tc} caption={caption} onClose={handleClose} />
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-steps
// ═══════════════════════════════════════════════════════════════════════

function MenuStep({ tagColor, onCapture, onClose }: { tagColor: { core: string; badge: string }; onCapture: () => void; onClose: () => void }) {
  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.menuHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.menuTitle}>Mostly engineers, mostly all-nighters</Text>
          <Text style={s.menuSubtitle}>Amit Chakma Engineering Building</Text>
          <View style={[s.tagPill, { backgroundColor: tagColor.badge, borderColor: `${tagColor.core}30` }]}>
            <Text style={[s.tagText, { color: tagColor.core }]}>Featured</Text>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
          <Feather name="x" size={16} color={colors.textSoft} />
        </Pressable>
      </View>

      {/* Recent memento */}
      <Text style={s.sectionLabel}>Recent Memento</Text>
      <View style={s.mementoRow}>
        <LinearGradient colors={['#fef3c7', '#fde68a']} style={s.mementoThumb}>
          <Text style={{ fontSize: 20 }}>⚡</Text>
        </LinearGradient>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.mementoText} numberOfLines={1}>First week energy in the atrium</Text>
          <Text style={s.mementoMeta}>@westerneng · 2 days ago</Text>
        </View>
      </View>

      {/* Locked content */}
      <Text style={[s.sectionLabel, { marginTop: 16 }]}>More Mementos</Text>
      {['Lab night with the whole crew', 'View from the 3rd floor bridge', 'That one vending machine moment'].map((t, i) => (
        <View key={i} style={s.lockedRow}>
          <View style={s.lockedThumb} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={[s.lockedTextBar, { width: `${65 + i * 8}%` as any }]} />
            <View style={s.lockedSubBar} />
          </View>
          <Feather name="lock" size={13} color="rgba(20,10,50,0.18)" />
        </View>
      ))}
      <Text style={s.lockedHint}>Leave a memento to unlock the rest</Text>

      {/* CTA */}
      <Pressable onPress={onCapture} style={s.cta}>
        <Text style={s.ctaText}>Leave a Memento</Text>
      </Pressable>
      <Text style={s.ctaSubtext}>+30 points on unlock</Text>
    </ScrollView>
  );
}

function CaptureStep({ onCapture, onBack }: { onCapture: () => void; onBack: () => void }) {
  return (
    <View style={s.captureWrap}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={s.viewfinder}>
        <View style={s.cameraIcon}>
          <Feather name="camera" size={32} color="rgba(255,255,255,0.25)" />
        </View>
        <Text style={s.cameraHint}>Simulated camera for demo</Text>
      </LinearGradient>

      <View style={s.captureControls}>
        <Pressable onPress={onBack} style={s.captureBack}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>

        <Pressable onPress={onCapture} style={s.shutter}>
          <View style={s.shutterInner} />
        </Pressable>

        <View style={s.modeLabels}>
          <Text style={s.modeLabelActive}>Photo</Text>
          <Text style={s.modeLabel}>Video</Text>
        </View>
      </View>
    </View>
  );
}

function CaptionStep({ caption, setCaption, onSubmit, onBack }: { caption: string; setCaption: (v: string) => void; onSubmit: () => void; onBack: () => void }) {
  const MAX = 120;
  return (
    <View style={s.captionWrap}>
      <LinearGradient colors={['#1e1b4b', '#312e81']} style={s.captionPreview}>
        {caption ? <Text style={s.captionOverlay}>{caption}</Text> : null}
      </LinearGradient>

      <View style={s.captionBar}>
        <Pressable onPress={onBack} style={s.captionBackBtn}>
          <Feather name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <View style={s.captionInputWrap}>
          <TextInput
            value={caption}
            onChangeText={(t) => setCaption(t.slice(0, MAX))}
            placeholder="Add a caption..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={s.captionInput}
            maxLength={MAX}
            autoFocus
          />
          <Text style={s.captionCount}>{caption.length}/{MAX}</Text>
        </View>
        <Pressable onPress={onSubmit} disabled={caption.length === 0} style={[s.captionSend, caption.length === 0 && { opacity: 0.3 }]}>
          <Ionicons name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function SubmittingStep({ points }: { points: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 800, useNativeDriver: true })).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={s.submittingWrap}>
      <Animated.View style={[s.spinner, { transform: [{ rotate }] }]} />
      <Text style={s.submittingText}>Submitting memento…</Text>
      <View style={s.pointsPill}>
        <Text style={s.pointsPillText}>+{points} pts</Text>
      </View>
    </View>
  );
}

function UnlockedStep({ tagColor, caption, onClose }: { tagColor: { core: string; badge: string }; caption: string; onClose: () => void }) {
  const MEMENTOS = [
    { text: 'First week energy in the atrium', by: '@westerneng', time: '2 days ago' },
    { text: 'Lab night with the whole crew', by: '@jchen22', time: '5 days ago' },
    { text: 'View from the 3rd floor bridge', by: '@smurad', time: '1 week ago' },
    { text: 'That one vending machine moment', by: '@tpark', time: '2 weeks ago' },
  ];

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
      <View style={s.unlockedHeader}>
        <View style={s.checkCircle}>
          <Feather name="check" size={24} color="#fff" />
        </View>
        <Text style={s.unlockedTitle}>Fragment Collected</Text>
        <Text style={s.unlockedSub}>Amit Chakma Engineering Building</Text>
        <View style={s.earnedPill}>
          <Text style={s.earnedText}>+30 points</Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>Your Memento</Text>
      <View style={s.mementoRow}>
        <LinearGradient colors={['#ddd6fe', '#c4b5fd']} style={s.mementoThumb}>
          <Feather name="image" size={16} color="rgba(99,80,200,0.5)" />
        </LinearGradient>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.mementoText} numberOfLines={1}>{caption || 'Your memento'}</Text>
          <Text style={s.mementoMeta}>Just now</Text>
        </View>
      </View>

      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Unlocked Mementos</Text>
      {MEMENTOS.map((m, i) => (
        <View key={i} style={s.unlockedRow}>
          <LinearGradient
            colors={[`hsl(${220 + i * 30}, 60%, 85%)`, `hsl(${240 + i * 30}, 50%, 75%)`]}
            style={s.unlockedRowThumb}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.unlockedRowText} numberOfLines={1}>{m.text}</Text>
            <Text style={s.unlockedRowMeta}>{m.by} · {m.time}</Text>
          </View>
        </View>
      ))}

      <View style={s.tagRow}>
        <View style={[s.tagPill, { backgroundColor: tagColor.badge, borderColor: `${tagColor.core}30` }]}>
          <Text style={[s.tagText, { color: tagColor.core }]}>Collected</Text>
        </View>
        <View style={[s.tagPill, { backgroundColor: tagColor.badge, borderColor: `${tagColor.core}30` }]}>
          <Text style={[s.tagText, { color: tagColor.core }]}>Featured</Text>
        </View>
      </View>

      <Pressable onPress={onClose} style={[s.cta, { backgroundColor: 'rgba(20,10,50,0.08)' }]}>
        <Text style={[s.ctaText, { color: 'rgba(20,10,50,0.7)' }]}>Back to Map</Text>
      </Pressable>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════

const glass = Platform.OS === 'web' ? { backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' } as any : {};

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: 'rgba(255,253,250,0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: H * 0.88,
    ...glass,
  },

  menuHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  menuTitle: { fontSize: 17, fontWeight: '700', color: 'rgba(20,10,50,0.92)', lineHeight: 22 },
  menuSubtitle: { fontSize: 11, color: 'rgba(20,10,50,0.4)', marginTop: 2 },
  tagPill: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  tagText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.04)' },

  sectionLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(20,10,50,0.3)', marginBottom: 8 },

  mementoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 14, padding: 12, marginBottom: 4 },
  mementoThumb: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mementoText: { fontSize: 12, fontWeight: '500', color: 'rgba(20,10,50,0.8)' },
  mementoMeta: { fontSize: 10, color: 'rgba(20,10,50,0.3)', marginTop: 2 },

  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 4 },
  lockedThumb: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.04)' },
  lockedTextBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 4 },
  lockedSubBar: { height: 6, width: '40%', borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.03)' },
  lockedHint: { textAlign: 'center', fontSize: 10, color: 'rgba(20,10,50,0.28)', marginTop: 12, marginBottom: 16 },

  cta: { backgroundColor: 'rgba(20,10,50,0.9)', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  ctaSubtext: { textAlign: 'center', fontSize: 10, color: 'rgba(20,10,50,0.28)', marginTop: 8 },

  captureWrap: { height: H * 0.7 },
  viewfinder: { flex: 1, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cameraIcon: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cameraHint: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  captureControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 16 },
  captureBack: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: 'rgba(20,10,50,0.15)', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  modeLabels: { flexDirection: 'row', gap: 8 },
  modeLabelActive: { fontSize: 12, fontWeight: '700', color: 'rgba(20,10,50,0.7)' },
  modeLabel: { fontSize: 12, color: 'rgba(20,10,50,0.25)' },

  captionWrap: { height: H * 0.65 },
  captionPreview: { flex: 1, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  captionOverlay: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center', paddingHorizontal: 24 },
  captionBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 16 },
  captionBackBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(20,10,50,0.08)', alignItems: 'center', justifyContent: 'center' },
  captionInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  captionInput: { flex: 1, fontSize: 14, color: 'rgba(20,10,50,0.8)' },
  captionCount: { fontSize: 10, color: 'rgba(20,10,50,0.2)', marginLeft: 6 },
  captionSend: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(20,10,50,0.85)', alignItems: 'center', justifyContent: 'center' },

  submittingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  spinner: { width: 36, height: 36, borderRadius: 18, borderWidth: 2.5, borderColor: 'rgba(20,10,50,0.1)', borderTopColor: 'rgba(20,10,50,0.6)', marginBottom: 16 },
  submittingText: { fontSize: 14, fontWeight: '500', color: 'rgba(20,10,50,0.6)', marginBottom: 8 },
  pointsPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(217,119,6,0.12)' },
  pointsPillText: { fontSize: 13, fontWeight: '700', color: '#d97706' },

  unlockedHeader: { alignItems: 'center', marginBottom: 20 },
  checkCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  unlockedTitle: { fontSize: 18, fontWeight: '700', color: 'rgba(20,10,50,0.92)' },
  unlockedSub: { fontSize: 12, color: 'rgba(20,10,50,0.4)', marginTop: 4 },
  earnedPill: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.12)' },
  earnedText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },

  unlockedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  unlockedRowThumb: { width: 36, height: 36, borderRadius: 8 },
  unlockedRowText: { fontSize: 11, fontWeight: '500', color: 'rgba(20,10,50,0.75)' },
  unlockedRowMeta: { fontSize: 10, color: 'rgba(20,10,50,0.3)', marginTop: 2 },

  tagRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 16 },
});
