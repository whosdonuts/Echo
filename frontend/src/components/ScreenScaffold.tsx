import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { shellMetrics } from '../theme/layout';

type ScreenScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  headerRight?: ReactNode;
};

export function ScreenScaffold({
  title,
  subtitle,
  children,
  headerRight,
}: ScreenScaffoldProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View pointerEvents="none" style={styles.atmosphere}>
        <View style={styles.glowLarge} />
        <View style={styles.glowSmall} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {headerRight}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    top: -40,
    right: -38,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(217, 111, 92, 0.08)',
  },
  glowSmall: {
    position: 'absolute',
    top: 110,
    left: -34,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(168, 195, 216, 0.08)',
  },
  content: {
    paddingTop: shellMetrics.topPadding,
    paddingHorizontal: shellMetrics.horizontalPadding,
    paddingBottom: shellMetrics.contentBottomPadding,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 7,
  },
  title: {
    fontSize: 31,
    color: colors.text,
    fontFamily: 'Georgia',
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
    fontWeight: '500',
  },
});
