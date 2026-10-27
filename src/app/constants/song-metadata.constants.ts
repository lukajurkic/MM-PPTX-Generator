/**
 * Preset metadata choices for song classification.
 * Users can easily add or edit choices in these lists.
 */

export const PRESET_MASS_SECTIONS = [
  'Ulazna',
  'Gospodine smiluj se',
  'Slava',
  'Otpjevni psalam',
  'Aleluja',
  'Prinosna',
  'Svet',
  'Jaganjče Božji',
  'Pričesna',
  'Zahvalna',
  'Završna',
  'Klanjanje'
] as const;

export const PRESET_CATEGORIES = [
  'Slavljenje',
  'Zahvala',
  'Meditativne',
  'Došašće',
  'Božićne',
  'Korizmene',
  'Uskrsne',
  'Marijanske',
  'Duhu Svetom',
  'Mladi',
  'Opće'
] as const;

export type PresetMassSection = (typeof PRESET_MASS_SECTIONS)[number];
export type PresetCategory = (typeof PRESET_CATEGORIES)[number];

