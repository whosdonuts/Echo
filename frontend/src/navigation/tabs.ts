import { ReactNode, createElement } from 'react';
import { EchoScreen } from '../screens/EchoScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SocialScreen } from '../screens/SocialScreen';

export type TabKey = 'map' | 'echo' | 'create' | 'explore' | 'profile';

export type TabDefinition = {
  key: TabKey;
  label: string;
  icon: 'map' | 'echo' | 'create' | 'explore' | 'profile';
  render: () => ReactNode;
};

export const tabs: TabDefinition[] = [
  { key: 'map', label: 'Discover', icon: 'map', render: () => createElement(MapScreen) },
  {
    key: 'echo',
    label: 'Echo',
    icon: 'echo',
    render: () => createElement(EchoScreen),
  },
  {
    key: 'create',
    label: 'Social',
    icon: 'create',
    render: () => createElement(SocialScreen),
  },
  {
    key: 'explore',
    label: 'Explore',
    icon: 'explore',
    render: () => createElement(ExploreScreen),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'profile',
    render: () => createElement(ProfileScreen),
  },
];
