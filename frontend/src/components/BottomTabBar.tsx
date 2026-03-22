import { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabDefinition, TabKey } from '../navigation/tabs';
import { colors } from '../theme/colors';

type BottomTabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  tabs: TabDefinition[];
};

const webLiquidGlassStyle =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(18px) saturate(155%)',
        WebkitBackdropFilter: 'blur(18px) saturate(155%)',
        boxShadow: '0 -10px 26px rgba(86, 33, 13, 0.06)',
      } as unknown as ViewStyle)
    : undefined;

function TabIcon({ icon, active }: { icon: TabDefinition['icon']; active: boolean }) {
  const color = active ? colors.tabBarActiveText : colors.tabBarInactive;
  const size = 20;
  let name: ComponentProps<typeof Ionicons>['name'];

  switch (icon) {
    case 'map':
      name = active ? 'map' : 'map-outline';
      break;
    case 'echo':
      name = active ? 'radio' : 'radio-outline';
      break;
    case 'create':
      name = active ? 'people' : 'people-outline';
      break;
    case 'explore':
      name = active ? 'compass' : 'compass-outline';
      break;
    case 'profile':
      name = active ? 'person' : 'person-outline';
      break;
  }

  return <Ionicons color={color} name={name} size={size} />;
}

export function BottomTabBar({ activeTab, onTabPress, tabs }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View
        style={[
          styles.surface,
          webLiquidGlassStyle,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <View pointerEvents="none" style={styles.topHighlight} />
        <View style={styles.row}>
          {tabs.map((tab) => {
            const active = tab.key === activeTab;

            return (
              <Pressable
                accessibilityLabel={tab.label}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                hitSlop={4}
                key={tab.key}
                onPress={() => onTabPress(tab.key)}
                style={({ pressed }) => [
                  styles.item,
                  pressed && (active ? styles.itemActivePressed : styles.itemInactivePressed),
                ]}
              >
                {active ? (
                  <LinearGradient
                    colors={[colors.tabBarActive, colors.tabBarActiveDeep]}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0.1 }}
                    style={styles.activePill}
                  >
                    <View pointerEvents="none" style={styles.activeSheen} />
                    <View style={styles.content}>
                      <TabIcon active icon={tab.icon} />
                      <Text minimumFontScale={0.95} numberOfLines={1} style={styles.activeLabel}>
                        {tab.label}
                      </Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveContent}>
                    <TabIcon active={false} icon={tab.icon} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  surface: {
    backgroundColor: colors.echoMainWhite,
    borderTopWidth: 1,
    borderColor: colors.tabBarBorder,
    overflow: 'hidden',
    paddingTop: 7,
    paddingHorizontal: 6,
    shadowColor: colors.tabBarShadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  topHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: colors.tabBarHighlight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  itemActivePressed: {
    opacity: 0.96,
  },
  itemInactivePressed: {
    opacity: 0.72,
  },
  activePill: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 4,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  activeSheen: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  inactiveContent: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  activeLabel: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.1,
    fontWeight: '700',
    color: colors.tabBarActiveText,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
});
