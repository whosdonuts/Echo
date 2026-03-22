export interface WesternFragment {
  title: string;
  subtitle: string;
  tag: string;
  lat: number;
  lng: number;
}

export type Coordinate = [number, number];

export interface PointGeometry {
  type: 'Point';
  coordinates: Coordinate;
}

export interface FragmentFeature {
  type: 'Feature';
  geometry: PointGeometry;
  properties: {
    title: string;
    subtitle: string;
    tag: string;
  };
}

export interface FragmentFeatureCollection {
  type: 'FeatureCollection';
  features: FragmentFeature[];
}

export interface PopupInfo {
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
  tag: string;
}

export type CityMode = 'western' | 'barcelona';
