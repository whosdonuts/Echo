import { useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from './src/components/BottomTabBar';
import { TabKey, tabs } from './src/navigation/tabs';
import { colors } from './src/theme/colors';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('map');
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  function handleTabChange(nextTab: TabKey) {
    if (nextTab === activeTab) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 14,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.985,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(nextTab);
      opacity.setValue(0);
      translateY.setValue(20);
      scale.setValue(0.985);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 210,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 190,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 20,
          stiffness: 180,
          mass: 0.92,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  const activeScreen = tabs.find((tab) => tab.key === activeTab)?.render();

  return (
    <SafeAreaProvider>
      <StatusBar style={activeTab === 'create' ? 'light' : 'dark'} />
      <LinearGradient
        colors={[colors.backgroundWarm, colors.background]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={styles.app}
      >
        <View style={styles.phoneShell}>
          <Animated.View
            style={[
              styles.screenHost,
              {
                opacity,
                transform: [{ translateY }, { scale }],
              },
            ]}
          >
            {activeScreen}
          </Animated.View>
          <BottomTabBar activeTab={activeTab} onTabPress={handleTabChange} tabs={tabs} />
        </View>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  phoneShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenHost: {
    flex: 1,
  },
});
