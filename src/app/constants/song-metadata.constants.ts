import metadataOptions from '../../assets/songs/metadata-options.json';

/**
 * Preset metadata choices for song classification loaded from static JSON metadata.
 * Categories and mass sections are dynamically augmented as new songs are indexed.
 */
export const PRESET_MASS_SECTIONS: readonly string[] = metadataOptions.massSections;
export const PRESET_CATEGORIES: readonly string[] = metadataOptions.categories;

export type PresetMassSection = string;
export type PresetCategory = string;
