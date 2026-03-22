import { useMemo, useState } from 'react';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FragmentDetailModal } from '../components/FragmentDetailModal';
import { FragmentDetail, detailFromMapPin, mapPins } from '../data/mock';
import { colors } from '../theme/colors';

type ActiveSheet =
  | { type: 'pin'; pinId: string }
  | { type: 'create' };

type PositionedValue = DimensionValue;

type MapLine = {
  top: PositionedValue;
  left: PositionedValue;
  width: PositionedValue;
  height: number;
  rotate: string;
};

type CityBlock = {
  top: PositionedValue;
  left: PositionedValue;
  width: number;
  height: number;
  tint: string;
};

type DiscoveredZone = {
  id: string;
  top: PositionedValue;
  left: PositionedValue;
  width: number;
  height: number;
  colors: [string, string];
};

const mapLines: MapLine[] = [
  { top: '12%', left: '-8%', width: '56%', height: 10, rotate: '-12deg' },
  { top: '20%', left: '44%', width: '52%', height: 8, rotate: '14deg' },
  { top: '31%', left: '-6%', width: '72%', height: 12, rotate: '7deg' },
  { top: '43%', left: '34%', width: '48%', height: 10, rotate: '-22deg' },
  { top: '56%', left: '4%', width: '86%', height: 10, rotate: '-4deg' },
  { top: '68%', left: '18%', width: '66%', height: 9, rotate: '18deg' },
  { top: '79%', left: '-10%', width: '62%', height: 10, rotate: '10deg' },
];

const cityBlocks: CityBlock[] = [
  { top: '16%', left: '8%', width: 94, height: 72, tint: '#D4CBC2' },
  { top: '24%', left: '62%', width: 76, height: 90, tint: '#CDC5BD' },
  { top: '38%', left: '16%', width: 126, height: 84, tint: '#D1C9C0' },
  { top: '51%', left: '58%', width: 104, height: 78, tint: '#CCC3B9' },
  { top: '66%', left: '10%', width: 90, height: 84, tint: '#D5CCC3' },
  { top: '74%', left: '56%', width: 116, height: 68, tint: '#CFC7BE' },
];

const discoveredZones: DiscoveredZone[] = [
  {
    id: 'harbor-zone',
    top: '12%',
    left: '-2%',
    width: 220,
    height: 220,
    colors: ['rgba(217,111,92,0.26)', 'rgba(217,111,92,0.04)'],
  },
  {
    id: 'clocktower-zone',
    top: '22%',
    left: '48%',
    width: 180,
    height: 180,
    colors: ['rgba(123,143,122,0.24)', 'rgba(123,143,122,0.03)'],
  },
  {
    id: 'station-zone',
    top: '55%',
    left: '25%',
    width: 230,
    height: 230,
    colors: ['rgba(216,182,122,0.20)', 'rgba(216,182,122,0.02)'],
  },
];

function pinToneColor(tone: 'accent' | 'sage' | 'gold') {
  if (tone === 'accent') {
    return colors.accent;
  }

  if (tone === 'sage') {
    return colors.sage;
  }

  return colors.gold;
}

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDetail, setSelectedDetail] = useState<FragmentDetail | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>({
    type: 'pin',
    pinId: mapPins.find((pin) => pin.discovered)?.id ?? mapPins[0].id,
  });

  const selectedPin = useMemo(() => {
    if (activeSheet.type !== 'pin') {
      return mapPins[0];
    }

    return mapPins.find((pin) => pin.id === activeSheet.pinId) ?? mapPins[0];
  }, [activeSheet]);

  const sheetBottom = Math.max(insets.bottom + 104, 132);
  const ctaBottom = Math.max(insets.bottom + 124, 152);
  const legendBottom = Math.max(insets.bottom + 112, 140);
  const mapGradient: [string, string, string] = ['#E5DED5', '#D4CBC2', '#EEE7DE'];
  const discoveredCount = mapPins.filter((pin) => pin.discovered).length;
  const hiddenCount = mapPins.length - discoveredCount;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <LinearGradient
          colors={mapGradient}
          end={{ x: 1, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.mapBase}>
          {cityBlocks.map((block) => (
            <View
              key={`${block.left}-${block.top}`}
              style={[
                styles.cityBlock,
                {
                  top: block.top,
                  left: block.left,
                  width: block.width,
                  height: block.height,
                  backgroundColor: block.tint,
                },
              ]}
            />
          ))}

          {discoveredZones
            .filter((zone) => mapPins.some((pin) => pin.discovered && zone.id.startsWith(pin.id)))
            .map((zone) => (
            <LinearGradient
              key={zone.id}
              colors={zone.colors}
              end={{ x: 1, y: 1 }}
              start={{ x: 0.2, y: 0.2 }}
              style={[
                styles.discoveredZone,
                {
                  top: zone.top,
                  left: zone.left,
                  width: zone.width,
                  height: zone.height,
                },
              ]}
            />
            ))}

          {mapLines.map((line) => (
            <View
              key={`${line.left}-${line.top}`}
              style={[
                styles.mapLine,
                {
                  top: line.top,
                  left: line.left,
                  width: line.width,
                  height: line.height,
                  transform: [{ rotate: line.rotate }],
                },
              ]}
            />
          ))}

          <View style={styles.atmosphere} />
        </View>

        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <View style={styles.brandWrap}>
              <Text style={styles.brand}>Echo</Text>
              <View style={styles.contextPill}>
                <Feather color={colors.accent} name="map-pin" size={13} />
                <Text style={styles.contextText}>
                  {`Old Port / ${discoveredCount} revealed, ${hiddenCount} still hidden`}
                </Text>
              </View>
            </View>

            <View style={styles.topActions}>
              <Pressable style={styles.iconButton}>
                <Feather color={colors.text} name="layers" size={15} />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <Feather color={colors.text} name="sliders" size={15} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.mapStory}>
            The city begins in gray. Memory gives it color.
          </Text>

          <View pointerEvents="none" style={styles.floatingLabels}>
            <Text style={[styles.areaLabel, { top: '18%', left: '12%' }]}>FERRY EDGE</Text>
            <Text style={[styles.areaLabel, { top: '35%', left: '61%' }]}>CLOCK TOWER</Text>
            <Text style={[styles.areaLabel, { top: '67%', left: '34%' }]}>UNION CUT</Text>
          </View>

          {mapPins.map((pin) => {
            const isSelected = activeSheet.type === 'pin' && activeSheet.pinId === pin.id;
            const toneColor = pinToneColor(pin.tone);

            return (
              <Pressable
                key={pin.id}
                onPress={() => setActiveSheet({ type: 'pin', pinId: pin.id })}
                style={[
                  styles.pinWrap,
                  {
                    left: pin.x as DimensionValue,
                    top: pin.y as DimensionValue,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rippleOuter,
                    {
                      borderColor: pin.discovered ? `${toneColor}44` : 'rgba(70, 65, 61, 0.18)',
                      backgroundColor: pin.discovered ? `${toneColor}12` : 'rgba(70, 65, 61, 0.06)',
                      borderStyle: pin.discovered ? 'solid' : 'dashed',
                      transform: [{ scale: isSelected ? 1.1 : 0.92 }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.rippleMid,
                    {
                      borderColor: pin.discovered ? `${toneColor}55` : 'rgba(70, 65, 61, 0.26)',
                      backgroundColor: pin.discovered ? `${toneColor}18` : 'rgba(255, 253, 252, 0.16)',
                      transform: [{ scale: isSelected ? 1.05 : 0.95 }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.rippleInner,
                    {
                      borderColor: pin.discovered ? `${toneColor}88` : 'rgba(70, 65, 61, 0.30)',
                      backgroundColor: pin.discovered ? 'rgba(255, 253, 252, 0.26)' : 'rgba(255, 253, 252, 0.42)',
                    },
                  ]}
                />
                <View
                  style={[
                    styles.pinCoreWrap,
                    {
                      backgroundColor: pin.discovered ? toneColor : 'rgba(120, 112, 105, 0.76)',
                    },
                  ]}
                >
                  <View style={styles.pinCore} />
                </View>
                {isSelected ? (
                  <View style={styles.pinLabel}>
                    <Text style={styles.pinLabelText}>{pin.label}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}

          <View style={[styles.legend, { bottom: legendBottom }]}>
            <View style={styles.legendRow}>
              <View style={styles.legendMutedDot} />
              <Text style={styles.legendText}>Undiscovered</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendRevealedDot} />
              <Text style={styles.legendText}>Remembered</Text>
            </View>
          </View>

          {activeSheet.type === 'pin' ? (
            selectedPin.discovered ? (
              <Pressable
                onPress={() => setSelectedDetail(detailFromMapPin(selectedPin))}
                style={[styles.previewSheet, { bottom: sheetBottom }]}
              >
                <View style={styles.previewHeader}>
                  <View>
                    <Text style={styles.previewEyebrow}>FRAGMENT PREVIEW</Text>
                    <Text style={styles.previewTitle}>{selectedPin.label}</Text>
                  </View>
                  <Text style={styles.previewTime}>{selectedPin.time}</Text>
                </View>

                <Text style={styles.previewBody}>{selectedPin.caption}</Text>

                <View style={styles.previewMetaRow}>
                  <View style={styles.previewMetaPillWarm}>
                    <Feather color={colors.accent} name="volume-2" size={13} />
                    <Text style={styles.previewMetaText}>{selectedPin.sound}</Text>
                  </View>
                  <View style={styles.previewMetaPill}>
                    <Text style={styles.previewMetaText}>{selectedPin.distance}</Text>
                  </View>
                  <View style={styles.previewMetaPill}>
                    <Text style={styles.previewMetaText}>{selectedPin.mood}</Text>
                  </View>
                </View>

                <Text style={styles.previewHint}>
                  Tap this preview to open the full memory and comment thread.
                </Text>
              </Pressable>
            ) : (
              <View style={[styles.previewSheet, { bottom: sheetBottom }]}>
                <View style={styles.previewHeader}>
                  <View>
                    <Text style={styles.previewEyebrow}>UNDISCOVERED ZONE</Text>
                    <Text style={styles.previewTitle}>{selectedPin.zone}</Text>
                  </View>
                  <Text style={styles.previewTime}>{selectedPin.time}</Text>
                </View>

                <Text style={styles.previewBody}>
                  A place is holding something here. Get closer or leave a fragment to reveal what this zone remembers.
                </Text>

                <View style={styles.previewMetaRow}>
                  <View style={styles.previewMetaPillWarm}>
                    <Feather color={colors.accent} name="map-pin" size={13} />
                    <Text style={styles.previewMetaText}>{selectedPin.distance}</Text>
                  </View>
                  <View style={styles.previewMetaPill}>
                    <Text style={styles.previewMetaText}>{selectedPin.clue}</Text>
                  </View>
                </View>

                <Text style={styles.previewHint}>
                  This memory stays hazy until the zone is discovered.
                </Text>
              </View>
            )
          ) : (
            <View style={[styles.previewSheet, { bottom: sheetBottom }]}>
              <View style={styles.previewHeader}>
                <View>
                  <Text style={styles.previewEyebrow}>CREATE MEMORY</Text>
                  <Text style={styles.previewTitle}>Camera flow ready</Text>
                </View>
                <Feather color={colors.textSoft} name="camera" size={18} />
              </View>

              <Text style={styles.previewBody}>
                Capture live photo, add a memento, attach optional sound, and leave the place with a trace.
              </Text>

              <View style={styles.previewMetaRow}>
                <View style={styles.previewMetaPillWarm}>
                  <Text style={styles.previewMetaText}>Live photo only</Text>
                </View>
                <View style={styles.previewMetaPill}>
                  <Text style={styles.previewMetaText}>Comments, not likes</Text>
                </View>
              </View>

              <Text style={styles.previewHint}>
                This prototype button stands in for the camera and create-memory flow.
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => setActiveSheet({ type: 'create' })}
            style={[styles.createButton, { bottom: ctaBottom }]}
          >
            <LinearGradient
              colors={[colors.text, '#1F1B19']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.createButtonFill}
            >
              <Feather color={colors.surface} name="camera" size={17} />
              <Text style={styles.createLabel}>Leave Echo</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <FragmentDetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D9D2CA',
  },
  screen: {
    flex: 1,
    backgroundColor: '#D9D2CA',
  },
  mapBase: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cityBlock: {
    position: 'absolute',
    borderRadius: 28,
    opacity: 0.7,
  },
  discoveredZone: {
    position: 'absolute',
    borderRadius: 999,
  },
  mapLine: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(104, 97, 90, 0.22)',
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(77, 70, 64, 0.06)',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandWrap: {
    flex: 1,
    gap: 10,
  },
  brand: {
    color: '#211D1A',
    fontSize: 31,
    fontFamily: 'Georgia',
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  contextPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 251, 247, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
  },
  contextText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 251, 247, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
  },
  mapStory: {
    width: 220,
    marginTop: 18,
    color: 'rgba(47, 42, 39, 0.78)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  floatingLabels: {
    ...StyleSheet.absoluteFillObject,
  },
  areaLabel: {
    position: 'absolute',
    color: 'rgba(47, 42, 39, 0.46)',
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  pinWrap: {
    position: 'absolute',
    width: 116,
    height: 116,
    marginLeft: -58,
    marginTop: -58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
  },
  rippleMid: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
  },
  rippleInner: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 253, 252, 0.26)',
  },
  pinCoreWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: 'rgba(255,253,252,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowStrong,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pinCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  pinLabel: {
    position: 'absolute',
    bottom: 8,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 253, 252, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.70)',
  },
  pinLabelText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  legend: {
    position: 'absolute',
    left: 20,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 253, 252, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.64)',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendMutedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(70, 65, 61, 0.28)',
  },
  legendRevealedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  legendText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  previewSheet: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 30,
    padding: 18,
    backgroundColor: 'rgba(255, 251, 247, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.68)',
    gap: 12,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  previewTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  previewTime: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  previewBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  previewMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewMetaPillWarm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceMuted,
  },
  previewMetaPill: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewMetaText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  previewHint: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  createButton: {
    position: 'absolute',
    right: 20,
    borderRadius: 28,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  createButtonFill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 28,
  },
  createLabel: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
