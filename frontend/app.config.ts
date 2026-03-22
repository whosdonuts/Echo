import type { ExpoConfig } from 'expo/config';

const downloadToken = process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN;
const mapboxPlugin: string | [string, { RNMapboxMapsDownloadToken: string }] = downloadToken
  ? ['@rnmapbox/maps', { RNMapboxMapsDownloadToken: downloadToken }]
  : '@rnmapbox/maps';

const config: ExpoConfig = {
  name: 'Echo',
  slug: 'echo-mobile-prototype',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  splash: {
    backgroundColor: '#F7F3EE',
  },
  assetBundlePatterns: ['**/*'],
  plugins: [
    'expo-asset',
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Echo to access your camera so you can leave a memento on the map.',
        recordAudioAndroid: false,
      },
    ],
    mapboxPlugin,
  ],
};

export default config;
