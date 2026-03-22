import { ImageSourcePropType } from 'react-native';

export const echoOrbAssets = {
  coral: require('../../assets/echo-orbs/orb-coral.png'),
  sky: require('../../assets/echo-orbs/orb-sky.png'),
  lilac: require('../../assets/echo-orbs/orb-lilac.png'),
  gold: require('../../assets/echo-orbs/orb-gold.png'),
  mint: require('../../assets/echo-orbs/orb-mint.png'),
  rose: require('../../assets/echo-orbs/orb-rose.png'),
} as const;

export type EchoOrbKey = keyof typeof echoOrbAssets;

export function getEchoOrbAsset(key: EchoOrbKey): ImageSourcePropType {
  return echoOrbAssets[key];
}

