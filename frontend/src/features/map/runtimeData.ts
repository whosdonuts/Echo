import londonRaw from './data/london_echo_fragments_extended.json';
import westernRaw from './data/western_echo_fragments_revised_fresh.json';
import { barcelonaCount, barcelonaUnlockedCount, barcelonaToFeatureCollection } from './barcelona';
import { fragmentsToFeatureCollection } from './geo';
import { LONDON_AMBIENT } from './londonAmbient';
import { FragmentFeatureCollection, WesternFragment } from './types';

export const westernFragments = westernRaw as WesternFragment[];
export const londonJsonFragments = londonRaw as WesternFragment[];
export const londonFragments: WesternFragment[] = [...londonJsonFragments, ...LONDON_AMBIENT];

export const westernCount = westernFragments.length;
export const londonCount = londonFragments.length;
export const featuredCount = westernFragments.filter((fragment) => fragment.tag === 'Featured').length;

export const londonGeoJSON: FragmentFeatureCollection = fragmentsToFeatureCollection(londonFragments);
export const barcelonaGeoJSON = barcelonaToFeatureCollection();

export { barcelonaCount, barcelonaUnlockedCount };
